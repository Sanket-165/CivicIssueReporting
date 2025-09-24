const express = require('express');
const router = express.Router();
const { supabase } = require('../config/db');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Protected (admin/superadmin)
const getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ message: error.message });

    res.json({ users: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Protected (admin/superadmin)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, department } = req.body;

    const updateData = { name, email, role, department };

    // If password is being updated, hash it
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) return res.status(400).json({ message: error.message });

    res.json({ user: data[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Routes
router.get('/', getUsers);
router.put('/:id', updateUser);

module.exports = router;
