// Backend auth.js routes
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
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Auth Routes

// Render login page
router.get('/login', (req, res) => {
    const message = req.query.message;
    res.render('auth/login', { error: null, message });
});

// Render register page
router.get('/register', (req, res) => {
    res.render('auth/register', { error: null });
});

// Render forgot password page
router.get('/forgot-password', (req, res) => {
    res.render('auth/forgot-password', { error: null, success: null });
});

// Register endpoint
router.post('/register', verifyFirebaseToken, async (req, res) => {
    try {
        const { firstName, lastName, email, role } = req.body;
        const { uid } = req.user;

        // Create user in MongoDB
        const user = new User({
            firebaseUid: uid,
            email,
            profile: {
                firstName,
                lastName
            },
            role: role || 'student'
        });

        await user.save();

        // Send welcome email
        await sendEmail({
            to: email,
            template: 'welcome',
            data: {
                name: firstName,
                verificationLink: `${process.env.CLIENT_URL}/auth/verify-email?token=${uid}`
            }
        });

        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login endpoint
router.post('/login', verifyFirebaseToken, async (req, res) => {
    try {
        const { uid } = req.user;
        
        // Get user from MongoDB
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Set session data
        req.session.user = {
            id: user._id,
            role: user.role,
            email: user.email
        };

        // Determine redirect URL based on role
        let redirectUrl;
        switch (user.role) {
            case 'admin':
                redirectUrl = '/admin/dashboard';
                break;
            case 'reviewer':
                redirectUrl = '/dashboard/reviewer';
                break;
            default:
                redirectUrl = '/dashboard/student';
        }

        res.json({ redirectUrl });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Email verification endpoint
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        
        // Verify Firebase token
        const user = await admin.auth().getUser(token);
        
        if (user.emailVerified) {
            return res.redirect('/auth/login?message=Email already verified');
        }

        // Update email verified status in Firebase
        await admin.auth().updateUser(token, {
            emailVerified: true
        });

        // Update MongoDB user
        await User.findOneAndUpdate(
            { firebaseUid: token },
            { isVerified: true }
        );

        res.redirect('/auth/login?message=Email verification successful');
    } catch (error) {
        console.error('Verification error:', error);
        res.redirect('/auth/login?message=Verification failed');
    }
});

// Social auth endpoint
router.post('/firebase/social', verifyFirebaseToken, async (req, res) => {
    try {
        const { uid, email, name } = req.user;

        let user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            // Create new user
            user = new User({
                firebaseUid: uid,
                email,
                profile: {
                    firstName: name?.split(' ')[0] || '',
                    lastName: name?.split(' ')[1] || ''
                },
                role: 'student',
                isVerified: true // Social login users are pre-verified
            });
            await user.save();
        }

        // Set session
        req.session.user = {
            id: user._id,
            role: user.role,
            email: user.email
        };

        // Determine redirect URL
        const redirectUrl = user.role === 'admin' 
            ? '/admin/dashboard' 
            : user.role === 'reviewer'
                ? '/dashboard/reviewer'
                : '/dashboard/student';

        res.json({ redirectUrl });
    } catch (error) {
        console.error('Social auth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// Logout endpoint
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
});

module.exports = router;