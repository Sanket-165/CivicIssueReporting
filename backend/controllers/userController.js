const User = require('../models/User.js');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Superadmin
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); // Exclude passwords from the result
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user role and department
// @route   PUT /api/users/:id
// @access  Private/Superadmin
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.role = req.body.role || user.role;
            // Only set department if the role is 'admin'
            if (user.role === 'admin') {
                user.department = req.body.department || user.department;
            } else {
                // If role is changed to something else, remove the department
                user.department = undefined;
            }

            const updatedUser = await user.save();
            
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                department: updatedUser.department,
            });

        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
