const { supabase } = require('../config/db');
const { getPriorityFromDescription } = require('../services/geminiService');
const { uploadToSupabase } = require('../middleware/uploadMiddleware');

// --- Helper: format complaint with feedback ---
const formatComplaint = async (complaint) => {
  const { data: feedback } = await supabase
    .from('feedback_history')
    .select('*')
    .eq('complaint_id', complaint.id);
  return { ...complaint, feedbackHistory: feedback || [] };
};


// --- Create Complaint ---
exports.createComplaint = async (req, res) => {
  try {

    console.log("REQ BODY:", req.body);
    console.log("REQ FILES:", req.files);

    const { title, description, latitude, longitude, category, locationName } = req.body;
    const files = req.files;

    if (!title || !description || !latitude || !longitude || !category || !files?.image) {
      return res.status(400).json({ message: 'Missing required fields or image.' });
    }

    // Upload files to Supabase Storage
    const imageUrl = await uploadToSupabase(files.image[0], 'images');
    let voiceNoteUrl = '';
    if (files.voiceNote) {
      voiceNoteUrl = await uploadToSupabase(files.voiceNote[0], 'voiceNotes');
    }

    // Compute priority
    const priority = await getPriorityFromDescription(description);

    // Insert complaint
    const { data: complaint, error } = await supabase
      .from('complaints')
      .insert([{
        title,
        description,
        category,
        image_url: imageUrl,
        voice_note_url: voiceNoteUrl,
        priority,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        location_name: locationName,
        reported_by: req.user.id,
        status: 'pending',
        is_final: false
      }])
      .select()
      .single();

    if (error) return res.status(400).json({ message: error.message });

    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error during complaint creation.' });
  }
};

// --- Get All Complaints ---
exports.getAllComplaints = async (req, res) => {
  try {
    let query = supabase.from('complaints').select('*').order('created_at', { ascending: false });

    if (req.user.role === 'admin') {
      query = query.eq('category', req.user.department);
    }

    const { data, error } = await query;
    if (error) return res.status(400).json({ message: error.message });

    const complaintsWithFeedback = await Promise.all(data.map(formatComplaint));

    res.json(complaintsWithFeedback);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- Get My Complaints ---
exports.getMyComplaints = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('reported_by', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ message: error.message });

    const complaintsWithFeedback = await Promise.all(data.map(formatComplaint));
    res.json(complaintsWithFeedback);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- Update Complaint Status ---
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { data: complaint, error } = await supabase
      .from('complaints')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !complaint) return res.status(404).json({ message: 'Complaint not found' });

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- Add Feedback & Reopen ---
exports.addFeedbackAndReopen = async (req, res) => {
  try {
    const { rating, comment, wantsToReopen } = req.body;
    const complaintId = req.params.id;

    // Insert feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback_history')
      .insert([{ complaint_id: complaintId, rating, comment }])
      .select()
      .single();

    if (feedbackError) return res.status(400).json({ message: feedbackError.message });

    // Optionally reopen complaint
    if (wantsToReopen) {
      await supabase.from('complaints').update({ status: 'reopened' }).eq('id', complaintId);
    } else {
      await supabase.from('complaints').update({ status: 'closed', is_final: true }).eq('id', complaintId);
    }

    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- Close Complaint ---
exports.closeComplaint = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { data, error } = await supabase
      .from('complaints')
      .update({ status: 'closed', is_final: true })
      .eq('id', complaintId)
      .select()
      .single();

    if (error) return res.status(400).json({ message: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- Forward Complaint ---
exports.forwardComplaint = async (req, res) => {
  try {
    const { department } = req.body;
    const { data, error } = await supabase
      .from('complaints')
      .update({ status: 'under consideration', department })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ message: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- Reject Complaint ---
exports.rejectComplaint = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .update({ status: 'closed', is_final: true })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ message: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
