const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const User = require('../models/user');
const { sendEmail } = require('../utils/email');

// Firebase token verification middleware
const verifyFirebaseToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Get full user object to check email verification
        const firebaseUser = await admin.auth().getUser(decodedToken.uid);
        req.user = { ...decodedToken, emailVerified: firebaseUser.emailVerified };
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Register endpoint
router.post('/register', verifyFirebaseToken, async (req, res) => {
    try {
        const { uid, email } = req.user;
        const { firstName, lastName, role } = req.body;

        // Check if user exists
        let user = await User.findOne({ firebaseUid: uid });
        if (user) {
            return res.status(409).json({ 
                message: 'User already exists'
            });
        }

        // Create new user
        user = new User({
            firebaseUid: uid,
            email,
            profile: {
                firstName,
                lastName
            },
            role: role || 'student',
            isVerified: false
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please verify your email.',
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: error.message || 'Registration failed'
        });
    }
});

// Login endpoint
router.post('/login', verifyFirebaseToken, async (req, res) => {
    try {
        const { uid, emailVerified } = req.user;
        
        // Check Firebase email verification
        if (!emailVerified) {
            return res.status(403).json({ 
                message: 'Please verify your email before logging in'
            });
        }

        // Find user in database
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            return res.status(404).json({ message: 'User not found in database' });
        }

        // Check database verification status
        if (!user.isVerified) {
            // If Firebase shows verified but database doesn't, update database
            user.isVerified = true;
            await user.save();
        }

        // Determine redirect URL
        let redirectUrl = '/student/dashboard';
        if (user.role === 'admin') {
            redirectUrl = '/admin/dashboard';
        } else if (user.role === 'reviewer') {
            redirectUrl = '/reviewer/dashboard';
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.profile.firstName,
                lastName: user.profile.lastName
            },
            redirectUrl
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: error.message || 'Login failed'
        });
    }
});

// Email verification confirmation endpoint
router.post('/verify-email', verifyFirebaseToken, async (req, res) => {
    try {
        const { uid, emailVerified } = req.user;
        
        if (!emailVerified) {
            return res.status(403).json({ 
                message: 'Email not verified in Firebase'
            });
        }

        // Update user verification status in database
        const user = await User.findOneAndUpdate(
            { firebaseUid: uid },
            { isVerified: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found in database' });
        }

        res.json({
            success: true,
            message: 'Email verification confirmed'
        });

    } catch (error) {
        console.error('Verification confirmation error:', error);
        res.status(500).json({ 
            message: error.message || 'Verification confirmation failed'
        });
    }
});

// Verification status check endpoint
router.get('/verification-status', verifyFirebaseToken, async (req, res) => {
    try {
        const { uid, emailVerified } = req.user;
        
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            return res.status(404).json({ message: 'User not found in database' });
        }

        res.json({
            success: true,
            isVerified: emailVerified && user.isVerified
        });

    } catch (error) {
        console.error('Verification status check error:', error);
        res.status(500).json({ 
            message: error.message || 'Failed to check verification status'
        });
    }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
    try {
        res.clearCookie('session');
        res.json({ 
            success: true,
            message: 'Logged out successfully' 
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            message: error.message || 'Logout failed'
        });
    }
});

module.exports = router;