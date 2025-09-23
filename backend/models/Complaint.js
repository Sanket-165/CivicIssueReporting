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

// ✨ NEW: Sub-schema for feedback history
const FeedbackSchema = new mongoose.Schema({
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true },
    proofUrl: { type: String }, // The proof associated with this resolution attempt
    feedbackAt: { type: Date, default: Date.now }
});

const ComplaintSchema = new mongoose.Schema({
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, enum: categories, required: true },
    imageUrl: { type: String, required: true },
    voiceNoteUrl: { type: String },
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true },
    },
    locationName: { type: String, trim: true },
    status: {
        type: String,
        enum: ['pending', 'under consideration', 'resolved', 'reopened', 'reassigned', 'closed'], // ✨ MODIFIED
        default: 'pending',
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium',
    },
    feedbackHistory: [FeedbackSchema], // ✨ NEW: An array to store all feedback rounds
    isFinal: { type: Boolean, default: false },
    // ✨ NEW: Flag to permanently close a complaint
}, { timestamps: true });

ComplaintSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Complaint', ComplaintSchema);