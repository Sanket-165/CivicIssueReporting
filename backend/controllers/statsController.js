const Complaint = require('../models/Complaint');
const User = require('../models/User');

exports.getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({}).populate('reportedBy', 'name email').sort({ createdAt: -1 });
        res.status(200).json(complaints);
    } catch (err) {
        console.error("ERROR IN getComplaints:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (err) {
        console.error("ERROR IN getAllUsers:", err);
        res.status(500).json({ message: "Server Error" });
    }
};