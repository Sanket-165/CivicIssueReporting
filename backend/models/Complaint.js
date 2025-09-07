const mongoose = require('mongoose');

const categories = [
    'Water Supply & Sewage',
    'Roads & Potholes',
    'Waste Management',
    'Streetlights & Electricity',
    'Public Health & Sanitation',
    'Illegal Construction & Encroachment',
    'Other'
];

const ComplaintSchema = new mongoose.Schema({
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, enum: categories, required: true },
    imageUrl: { type: String, required: true },
    voiceNoteUrl: { type: String },
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    locationName: { type: String, trim: true }, // Stores the human-readable address
    status: {
        type: String,
        enum: ['pending', 'under consideration', 'resolved'],
        default: 'pending',
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium',
    },
}, { timestamps: true });

ComplaintSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Complaint', ComplaintSchema);