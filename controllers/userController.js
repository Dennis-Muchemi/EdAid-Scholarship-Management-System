const User = require('../models/user');
const Application = require('../models/Application');
const { validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinary');

class UserController {
    // Get user profile
    async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.userId)
                .select('-password')
                .populate('applications')
                .populate('savedScholarships');
            
            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            res.json(user);
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: 'Server Error' });
        }
    }

    // Update user profile
    async updateProfile(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const updateFields = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                phone: req.body.phone,
                academicInfo: req.body.academicInfo,
                preferences: req.body.preferences
            };

            const user = await User.findByIdAndUpdate(
                req.user.userId,
                { $set: updateFields },
                { new: true }
            ).select('-password');

            res.json(user);
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: 'Server Error' });
        }
    }

    // Upload user document
    async uploadDocument(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ msg: 'No file uploaded' });
            }

            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'user_documents',
                resource_type: 'auto'
            });

            const user = await User.findById(req.user.userId);
            user.documents.push({
                name: req.file.originalname,
                url: result.secure_url,
                cloudinaryId: result.public_id,
                type: req.body.documentType
            });

            await user.save();
            res.json(user.documents);
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: 'Server Error' });
        }
    }

    // Get user applications
    async getApplications(req, res) {
        try {
            const applications = await Application.find({ user: req.user.userId })
                .populate('scholarship')
                .sort({ createdAt: -1 });
            res.json(applications);
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: 'Server Error' });
        }
    }

    // Toggle saved scholarship
    async toggleSavedScholarship(req, res) {
        try {
            const user = await User.findById(req.user.userId);
            const scholarshipId = req.params.id;

            const savedIndex = user.savedScholarships.indexOf(scholarshipId);
            if (savedIndex > -1) {
                user.savedScholarships.splice(savedIndex, 1);
            } else {
                user.savedScholarships.push(scholarshipId);
            }

            await user.save();
            res.json(user.savedScholarships);
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: 'Server Error' });
        }
    }

    // Update notification preferences
    async updatePreferences(req, res) {
        try {
            const user = await User.findByIdAndUpdate(
                req.user.userId,
                { $set: { notificationPreferences: req.body.preferences } },
                { new: true }
            );
            res.json(user.notificationPreferences);
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: 'Server Error' });
        }
    }

    // Delete user document
    async deleteDocument(req, res) {
        try {
            const user = await User.findById(req.user.userId);
            const document = user.documents.id(req.params.documentId);

            if (!document) {
                return res.status(404).json({ msg: 'Document not found' });
            }

            await cloudinary.uploader.destroy(document.cloudinaryId);
            document.remove();
            await user.save();

            res.json({ msg: 'Document deleted' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: 'Server Error' });
        }
    }
}

module.exports = new UserController();