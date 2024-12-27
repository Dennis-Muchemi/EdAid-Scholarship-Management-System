const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    scholarship: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scholarship',
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'under_review', 'shortlisted', 'accepted', 'rejected'],
        default: 'draft'
    },
    academicInfo: {
        institution: {
            type: String,
            required: true
        },
        major: {
            type: String,
            required: true
        },
        gpa: {
            type: Number,
            required: true
        },
        academicLevel: {
            type: String,
            required: true,
            enum: ['undergraduate', 'graduate']
        },
        expectedGraduation: Date
    },
    documents: [{
        name: String,
        url: String,
        uploadDate: Date,
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        }
    }],
    reviews: [{
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        score: Number,
        comments: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    submissionDate: Date,
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Update lastUpdated timestamp on save
applicationSchema.pre('save', function(next) {
    this.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model('Application', applicationSchema);