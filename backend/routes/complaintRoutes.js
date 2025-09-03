const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  updateComplaintStatus,
} = require('../controllers/complaintController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Route to create a new complaint (citizen)
router.post('/', protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'voiceNote', maxCount: 1 }]), createComplaint);

// Route to get all complaints (admin)
router.get('/', protect, admin, getAllComplaints);

// Route to get complaints for the logged-in user (citizen)
router.get('/mycomplaints', protect, getMyComplaints);

// Route to update a complaint's status (admin)
router.put('/:id/status', protect, admin, updateComplaintStatus);

module.exports = router;