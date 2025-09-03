const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ✨ NEW: Define departments
const departments = [
    'Water Supply & Sewage',
    'Roads & Potholes',
    'Waste Management',
    'Streetlights',
    'Public Health & Sanitation',
    'Illegal Construction & Encroachment',
    'Other'
];

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // 🔄 UPDATED: Roles are now more specific
    role: { 
        type: String, 
        enum: ['citizen', 'admin', 'superadmin'], 
        default: 'citizen' 
    },
    // ✨ NEW: Department field for admins
    department: {
        type: String,
        enum: departments,
        // This field is only required if the role is 'admin'
        required: function() { return this.role === 'admin' }
    },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);