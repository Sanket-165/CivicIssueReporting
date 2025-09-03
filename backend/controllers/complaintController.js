const Complaint = require('../models/Complaint');
const { getPriorityFromDescription } = require('../services/geminiService');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to upload buffer to Cloudinary
const streamUpload = (buffer, folder, resource_type) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder, resource_type }, (error, result) => {
            if (result) {
                resolve(result);
            } else {
                reject(error);
            }
        });
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

exports.createComplaint = async (req, res) => {
    try {
        const { title, description, latitude, longitude, category } = req.body;
        const files = req.files;
        
        if (!title || !description || !latitude || !longitude || !files.image || !category) {
            return res.status(400).json({ message: 'Missing required fields or image.' });
        }
        
        const imageResult = await streamUpload(files.image[0].buffer, 'civic_issues', 'image');

        let voiceNoteUrl = '';
        if (files.voiceNote) {
            const voiceResult = await streamUpload(files.voiceNote[0].buffer, 'civic_issues', 'video');
            voiceNoteUrl = voiceResult.secure_url;
        }

        const priority = await getPriorityFromDescription(description);

        const complaint = await Complaint.create({
            title,
            description,
            imageUrl: imageResult.secure_url,
            voiceNoteUrl,
            category,
            priority,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            reportedBy: req.user.id,
        });

        res.status(201).json({ success: true, data: complaint });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during complaint creation.' });
    }
};

exports.getAllComplaints = async (req, res) => {
    try {
        let query = {};
        
        if (req.user.role === 'admin') {
            // Departmental admin sees only their department's complaints
            query = { category: req.user.department };
        }
        
        const complaints = await Complaint.find(query)
            .populate('reportedBy', 'name email')
            .sort({ createdAt: -1 });
            
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ reportedBy: req.user.id }).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateComplaintStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        complaint.status = status;
        await complaint.save();
        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};