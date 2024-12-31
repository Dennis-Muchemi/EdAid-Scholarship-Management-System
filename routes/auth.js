const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const User = require('../models/user');

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

// Login/Register with Firebase
router.post('/firebase/login', verifyFirebaseToken, async (req, res) => {
    try {
        const { uid, email } = req.user;
        const { firstName, lastName, role } = req.body;

        // Find or create user
        let user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            user = new User({
                firebaseUid: uid,
                email,
                firstName: firstName || '',
                lastName: lastName || '',
                role: role || 'student',
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

// Social auth with Firebase
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

// Get user profile
router.get('/user', verifyFirebaseToken, async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.user.uid })
            .select('-password')
            .populate('applications')
            .populate('savedScholarships');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;