const express = require('express');
const router = express.Router();
const { supabase } = require('../config/db');

// @desc    Get all users for stats
// @route   GET /api/stats/getAllUsers
// @access  Protected (admin/superadmin)
const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, department, created_at');

    if (error) return res.status(400).json({ message: error.message });

    res.json({ users: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all complaints for stats
// @route   GET /api/stats/getAllComplaints
// @access  Protected (admin/superadmin)
const getComplaints = async (req, res) => {
  try {
    // Optionally, join feedback history to each complaint
    const { data: complaints, error: complaintsError } = await supabase
      .from('complaints')
      .select('*');

    if (complaintsError) return res.status(400).json({ message: complaintsError.message });

    const complaintsWithFeedback = await Promise.all(
      complaints.map(async (complaint) => {
        const { data: feedback, error } = await supabase
          .from('feedback_history')
          .select('*')
          .eq('complaint_id', complaint.id);
        return { ...complaint, feedbackHistory: feedback || [] };
      })
    );

    res.json({ complaints: complaintsWithFeedback });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Routes
router.get('/getAllUsers', getAllUsers);
router.get('/getAllComplaints', getComplaints);

module.exports = router;
