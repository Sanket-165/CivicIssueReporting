// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
// 🔄 UPDATED import
const { registerUser, login } = require('../controllers/authController');

router.post('/register', registerUser);

// ✨ NEW UNIFIED LOGIN ROUTE
router.post('/login', login);

module.exports = router;