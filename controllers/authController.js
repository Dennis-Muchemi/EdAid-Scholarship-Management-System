const User = require('../models/user');
const firebaseAdmin = require('firebase-admin');

exports.registerUser = async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        
        // Create Firebase user
        const userRecord = await firebaseAdmin.auth().createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`
        });

        // Create MongoDB user record
        const user = new User({
            firebaseUid: userRecord.uid,
            email,
            profile: {
                firstName,
                lastName
            }
        });

        await user.save();
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.user.uid });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};