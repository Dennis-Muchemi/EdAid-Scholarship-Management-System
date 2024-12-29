const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const { authenticateUser } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads/documents',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb('Error: Invalid file type');
  }
});

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select('-password')
            .populate('applications')
            .populate('savedScholarships');

        if (!user) {
            return res.status(404).json({ 
                error: 'User not found',
                details: `No user found with ID: ${req.user.userId}`
            });
        }

        res.json(user);
    } catch (err) {
        console.error('Profile Error:', err);
        res.status(500).json({ 
            error: 'Server Error',
            details: err.message 
        });
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [authenticateUser, [
  check('firstName', 'First name is required').notEmpty(),
  check('lastName', 'Last name is required').notEmpty(),
  check('phone', 'Phone number is required').optional()
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/users/documents
// @desc    Upload user documents
// @access  Private
router.post('/documents', [authenticateUser, upload.single('document')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const user = await User.findById(req.user.userId);
    user.documents.push({
      name: req.file.originalname,
      path: req.file.path,
      type: req.body.documentType
    });

    await user.save();
    res.json(user.documents);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/applications
// @desc    Get user's applications
// @access  Private
router.get('/applications', authenticateUser, async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.userId })
      .populate('scholarship')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/users/save-scholarship/:id
// @desc    Save/unsave a scholarship
// @access  Private
router.post('/save-scholarship/:id', authenticateUser, async (req, res) => {
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
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user notification preferences
// @access  Private
router.put('/preferences', authenticateUser, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { notificationPreferences: req.body.preferences } },
      { new: true }
    );
    res.json(user.notificationPreferences);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;