const { supabase } = require('../config/db');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Superadmin
exports.getUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, department, created_at');

    if (error) return res.status(400).json({ message: error.message });

    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user role and department
// @route   PUT /api/users/:id
// @access  Private/Superadmin
exports.updateUser = async (req, res) => {
  try {
    const { role, department } = req.body;

    // Fetch the user first
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare updated fields
    const updates = { role };
    if (role === 'admin') {
      updates.department = department || existingUser.department;
    } else {
      updates.department = null; // remove department if not admin
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) return res.status(400).json({ message: updateError.message });

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
