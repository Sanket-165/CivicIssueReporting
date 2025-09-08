const Complaint = require('../models/Complaint');
const { getPriorityFromDescription } = require('../services/geminiService');
const cloudinary = require('cloudinary');
const streamifier = require('streamifier');
const exifParser = require('exif-parser'); // Import the new library

// This function needs to be configured with your Cloudinary credentials
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const streamUpload = (buffer, folder, resource_type) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream({ folder, resource_type }, (error, result) => {
            if (result) resolve(result);
            else reject(error);
        });
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

exports.createComplaint = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            latitude, 
            longitude, 
            category,
            locationName
        } = req.body;
        
        const files = req.files;

        if (!title || !description || !latitude || !longitude || !category || !files.image) {
            return res.status(400).json({ message: 'Missing required fields or image.' });
        }

        const imageBuffer = files.image[0].buffer;
        
        // --- NEW: EXIF DATA EXTRACTION ---
        let geotagData = {};
        try {
            const parser = exifParser.create(imageBuffer);
            const result = parser.parse();
            if (result.tags && result.tags.GPSLatitude && result.tags.GPSLongitude) {
                geotagData = {
                    latitude: result.tags.GPSLatitude,
                    longitude: result.tags.GPSLongitude,
                };
            }
        } catch (exifError) {
            console.log('Could not parse EXIF data from image:', exifError.message);
            // It's not a critical error, just proceed without geotag data
        }
        
        // Upload image to Cloudinary
        const imageResult = await streamUpload(imageBuffer, 'civic_issues', 'image');
        
        let voiceNoteUrl = '';
        if (files.voiceNote) {
            const voiceResult = await streamUpload(files.voiceNote[0].buffer, 'civic_issues', 'video');
            voiceNoteUrl = voiceResult.secure_url;
        }
        
        const priority = await getPriorityFromDescription(description);

        const complaint = await Complaint.create({
            title,
            description,
            category,
            imageUrl: imageResult.secure_url,
            voiceNoteUrl,
            priority,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            locationName,
            geotag: geotagData, // Save the extracted geotag data
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
            query = { category: req.user.department };
        }
        const complaints = await Complaint.find(query).populate('reportedBy', 'name email').sort({ createdAt: -1 });
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

