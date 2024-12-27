const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    deadline: {
        type: Date,
        required: true
    },
    requirements: {
        gpa: {
            type: Number,
            required: true,
            min: 0,
            max: 4.0
        },
        academicLevel: {
            type: String,
            enum: ['undergraduate', 'graduate', 'both'],
        },
        fieldOfStudy: [String],
        documents: [{
            name: String,
            required: Boolean,
            description: String
        }]
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'closed', 'archived'],
        default: 'draft'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    maxApplicants: {
        type: Number,
        default: null
    },
    currentApplicants: {
        type: Number,
        default: 0
    },
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
scholarshipSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Scholarship', scholarshipSchema);