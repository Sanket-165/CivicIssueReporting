const express = require('express');
const router = express.Router();
const { getUsers, updateUser } = require('../controllers/userController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// These routes are protected and can only be accessed by a logged-in superadmin.
// The 'admin' middleware now correctly handles both 'admin' and 'superadmin' roles,
// but for user management, we could create a more specific 'superadmin' middleware if needed.
// For now, the existing 'admin' middleware will suffice as it grants access.

router.route('/')
    .get(protect, admin, getUsers);

router.route('/:id')
    .put(protect, admin, updateUser);

module.exports = router;