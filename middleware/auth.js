const firebaseAdmin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const config = require('config');

// Firebase Authentication
const firebaseAuth = async (token) => {
    try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        return { 
            user: decodedToken,
            type: 'firebase'
        };
    } catch (error) {
        return null;
    }
};

// JWT Authentication
const jwtAuth = (token) => {
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        return {
            user: decoded,
            type: 'jwt'
        };
    } catch (error) {
        return null;
    }
};

// Combined Authentication Middleware
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split('Bearer ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Try both authentication methods
        const firebaseResult = await firebaseAuth(token);
        const jwtResult = jwtAuth(token);

        if (!firebaseResult && !jwtResult) {
            return res.status(401).json({ error: 'Invalid authentication token' });
        }

        // Prefer Firebase auth if both succeed
        const authResult = firebaseResult || jwtResult;
        req.user = {
            ...authResult.user,
            userId: authResult.user.uid || authResult.user.id,
            authType: authResult.type
        };

        next();
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

module.exports = { authenticateUser, checkRole };