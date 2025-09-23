const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  updateComplaintStatus,
  addFeedbackAndReopen, // ✨ RENAMED/MODIFIED
  forwardComplaint,     // ✨ NEW
  rejectComplaint,      // ✨ NEW
  closeComplaint,       // ✨ NEW
} = require('../controllers/complaintController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// send proof to user
const {sendProof} = require("../controllers/feedbackController")
router.post('/sendProof', protect, admin, upload.single('proof'), sendProof);

// Route to create a new complaint (citizen)
router.post('/', protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'voiceNote', maxCount: 1 }]), createComplaint);

// Route to get all complaints (admin)
router.get('/', protect, admin, getAllComplaints);

// Route to get complaints for the logged-in user (citizen)
router.get('/mycomplaints', protect, getMyComplaints);

// Route to update a complaint's status (admin)
router.put('/:id/status', protect, admin, updateComplaintStatus);

// --- ✨ NEW Feedback and Reconsideration Routes ---

// Route for a citizen to submit feedback and potentially reopen an issue
router.post('/:id/feedback', protect, addFeedbackAndReopen);

// Route for a citizen to permanently close an issue after positive feedback
router.put('/:id/close', protect, closeComplaint);

// Route for a superadmin to accept and forward a reopened complaint
router.put('/:id/forward', protect, admin, forwardComplaint); // Assuming admin middleware checks for superadmin role

// Route for a superadmin to reject a reopened complaint
router.put('/:id/reject', protect, admin, rejectComplaint); // Assuming admin middleware checks for superadmin role

module.exports = router;