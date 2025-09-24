const { supabase } = require('../config/db');

// @desc    Get all complaints
// @route   GET /api/stats/getAllComplaints
// @access  Protected (admin/superadmin)
exports.getComplaints = async (req, res) => {
  try {
    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('*, reported_by (id, name, email)')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ message: error.message });

    res.status(200).json(complaints);
  } catch (err) {
    console.error('ERROR IN getComplaints:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all users
// @route   GET /api/stats/getAllUsers
// @access  Protected (admin/superadmin)
exports.getAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, department, created_at');

    if (error) return res.status(400).json({ message: error.message });

    res.status(200).json(users);
  } catch (err) {
    console.error('ERROR IN getAllUsers:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
