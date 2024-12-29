const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/user');
const sendEmail = require('../utils/email');
const admin = require('firebase-admin');
const { authenticateUser, checkRole } = require('../middleware/auth');

// @route   POST /auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
    check('firstName', 'First name is required').notEmpty(),
    check('lastName', 'Last name is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    check('role', 'Role is required').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { firstName, lastName, email, password, role } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user
        user = new User({
            firstName,
            lastName,
            email,
            password,
            role
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user
        await user.save();

        // Create verification token
        const verificationToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Send verification email
        await sendEmail({
            email: user.email,
            subject: 'Email Verification',
            template: 'verification',
            context: {
                name: user.firstName,
                verificationLink: `${process.env.CLIENT_URL}/verify/${verificationToken}`
            }
        });

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(401).json({ msg: 'Please verify your email first' });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
    check('email', 'Please include a valid email').isEmail()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Create reset token
        const resetToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send reset email
        await sendEmail({
            email: user.email,
            subject: 'Password Reset',
            template: 'resetPassword',
            context: {
                name: user.firstName,
                resetLink: `${process.env.CLIENT_URL}/reset-password/${resetToken}`
            }
        });

        res.json({ msg: 'Password reset email sent' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post('/reset-password/:token', [
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { token } = req.params;
        const { password } = req.body;

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ msg: 'Invalid or expired token' });
    }
});

// @route   GET /auth/verify/:token
// @desc    Verify email
// @access  Public
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.isVerified = true;
        await user.save();

        res.json({ msg: 'Email verified successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ msg: 'Invalid or expired token' });
    }
});

// @route   GET /auth/user
// @desc    Get authenticated user
// @access  Private
router.get('/user', authenticateUser, async (req, res) => {
    try {
        // Verify user exists in request
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ 
                error: 'Authentication failed',
                details: 'User ID not found in request'
            });
        }

        const user = await User.findById(req.user.userId)
            .select('-password')
            .populate('applications')
            .populate('savedScholarships');

        if (!user) {
            return res.status(404).json({ 
                error: 'User not found',
                details: 'User does not exist in database'
            });
        }

        res.json({
            success: true,
            data: user,
            authType: req.user.authType
        });

    } catch (err) {
        console.error('Auth Error:', err.message);
        res.status(500).json({ 
            error: 'Server error',
            details: err.message
        });
    }
});

// Firebase token verification middleware
const verifyFirebaseToken = async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
      }
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (err) {
      res.status(401).json({ msg: 'Token is not valid' });
    }
  };
  
  // @route   POST /auth/firebase/login
  // @desc    Login or register with Firebase
  // @access  Public
  router.post('/firebase/login', verifyFirebaseToken, async (req, res) => {
    try {
      const { uid, email, name } = req.user;
  
      // Check if user exists
      let user = await User.findOne({ firebaseUid: uid });
  
      if (!user) {
        // Create new user if doesn't exist
        user = new User({
          firebaseUid: uid,
          email,
          firstName: name?.split(' ')[0] || '',
          lastName: name?.split(' ')[1] || '',
          isVerified: true // Firebase handles email verification
        });
        await user.save();
      }
  
      res.json({ user });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });
  
  // @route   POST /auth/firebase/social
  // @desc    Handle social auth with Firebase
  // @access  Public
  router.post('/firebase/social', verifyFirebaseToken, async (req, res) => {
    try {
      const { uid, email, name, provider } = req.user;
  
      let user = await User.findOne({ firebaseUid: uid });
      if (!user) {
        user = new User({
          firebaseUid: uid,
          email,
          firstName: name?.split(' ')[0] || '',
          lastName: name?.split(' ')[1] || '',
          authProvider: provider,
          isVerified: true
        });
        await user.save();
      }
  
      res.json({ user });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });  

module.exports = router;