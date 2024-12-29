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

// Main authentication middleware
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') || 
                     req.cookies?.token;

        if (!token) {
            return res.status(401).json({ error: 'No authentication token provided' });
        }

        // Try both auth methods
        const firebaseResult = await firebaseAuth(token);
        const jwtResult = jwtAuth(token);

        if (!firebaseResult && !jwtResult) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Prefer Firebase auth if both succeed
        const authResult = firebaseResult || jwtResult;
        
        // Set user info on request object
        req.user = {
            userId: authResult.user.uid || authResult.user.id,
            email: authResult.user.email,
            role: authResult.user.role,
            authType: authResult.type
        };

        next();
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
};

// Role-based access control middleware
const checkRole = (roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ 
                    error: 'Authentication required'
                });
            }

            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ 
                    error: 'Access denied',
                    details: 'Insufficient permissions'
                });
            }

            next();
        } catch (error) {
            console.error('Role Check Error:', error);
            res.status(500).json({ 
                error: 'Role verification failed'
            });
        }
    };
};

// Export as default middleware
// Export both middlewares
module.exports = {
    authenticateUser,
    checkRole
};