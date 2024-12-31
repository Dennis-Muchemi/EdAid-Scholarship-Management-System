// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['student', 'admin', 'reviewer'],
        default: 'student'
    },
    profile: {
        firstName: String,
        lastName: String,
        phoneNumber: String,
        academicInfo: {
            institution: String,
            major: String,
            gpa: Number
        },
        documents: [{
            type: String,
            name: String,
            url: String,
            uploadDate: Date
        }]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);