const express = require('express');
const router = express.Router();
const { supabase } = require('../config/db');
const { protect, admin } = require('../middleware/authMiddleware');

// Helper: format complaint with feedback
const formatComplaint = async (complaint) => {
  const { data: feedback, error } = await supabase
    .from('feedback_history')
    .select('*')
    .eq('complaint_id', complaint.id);

  if (error) console.error(error);
  return { ...complaint, feedbackHistory: feedback || [] };
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Protected (citizen)
const createComplaint = async (req, res) => {
  try {
    const { title, description, category, locationName, latitude, longitude } = req.body;

    // For file uploads
    const imageUrl = req.files?.image?.[0]?.path || null;
    const voiceNoteUrl = req.files?.voiceNote?.[0]?.path || null;

    const { data, error } = await supabase
      .from('complaints')
      .insert([{
        reported_by: req.user.id,
        title,
        description,
        category,
        image_url: imageUrl,
        voice_note_url: voiceNoteUrl,
        latitude,
        longitude,
        location_name: locationName,
        status: 'pending',
        priority: 'Medium',
        is_final: false
      }])
      .select();

    if (error) return res.status(400).json({ message: error.message });

    res.status(201).json({ complaint: data[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all complaints (admin)
// @route   GET /api/complaints
// @access  Protected (admin)
const getAllComplaints = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ message: error.message });

    const complaintsWithFeedback = await Promise.all(data.map(formatComplaint));

    res.json({ complaints: complaintsWithFeedback });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get complaints for logged-in user
// @route   GET /api/complaints/mycomplaints
// @access  Protected (citizen)
const getMyComplaints = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('reported_by', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ message: error.message });

    const complaintsWithFeedback = await Promise.all(data.map(formatComplaint));

    res.json({ complaints: complaintsWithFeedback });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update complaint status (admin)
// @route   PUT /api/complaints/:id/status
// @access  Protected (admin)
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const { data, error } = await supabase
      .from('complaints')
      .update({ status, priority })
      .eq('id', id)
      .select();

    if (error) return res.status(400).json({ message: error.message });

    res.json({ complaint: data[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Add feedback and optionally reopen a complaint
// @route   POST /api/complaints/:id/feedback
// @access  Protected (citizen)
const addFeedbackAndReopen = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, reopen } = req.body;
    const proofUrl = req.file?.path || null;

    // Insert feedback
    const { data, error } = await supabase
      .from('feedback_history')
      .insert([{ complaint_id: id, rating, comment, proof_url: proofUrl }])
      .select();

    if (error) return res.status(400).json({ message: error.message });

    // Optionally reopen complaint
    if (reopen) {
      await supabase
        .from('complaints')
        .update({ status: 'reopened' })
        .eq('id', id);
    }

    res.json({ feedback: data[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Close complaint permanently
// @route   PUT /api/complaints/:id/close
// @access  Protected (citizen)
const closeComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('complaints')
      .update({ status: 'closed', is_final: true })
      .eq('id', id)
      .select();

    if (error) return res.status(400).json({ message: error.message });

    res.json({ complaint: data[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Forward complaint (superadmin)
// @route   PUT /api/complaints/:id/forward
// @access  Protected (superadmin)
const forwardComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { department } = req.body;

    const { data, error } = await supabase
      .from('complaints')
      .update({ status: 'under consideration', department })
      .eq('id', id)
      .select();

    if (error) return res.status(400).json({ message: error.message });

    res.json({ complaint: data[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Reject complaint (superadmin)
// @route   PUT /api/complaints/:id/reject
// @access  Protected (superadmin)
const rejectComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('complaints')
      .update({ status: 'closed', is_final: true })
      .eq('id', id)
      .select();

    if (error) return res.status(400).json({ message: error.message });

    res.json({ complaint: data[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Routes
router.post('/', protect, createComplaint);
router.get('/', protect, admin, getAllComplaints);
router.get('/mycomplaints', protect, getMyComplaints);
router.put('/:id/status', protect, admin, updateComplaintStatus);
router.post('/:id/feedback', protect, addFeedbackAndReopen);
router.put('/:id/close', protect, closeComplaint);
router.put('/:id/forward', protect, admin, forwardComplaint);
router.put('/:id/reject', protect, admin, rejectComplaint);

module.exports = router;

