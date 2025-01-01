const firebaseAdmin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/user'); // Add this to check against your database

// Firebase Authentication
const firebaseAuth = async (token) => {
    try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        
        // Get the full user object to check email verification
        const firebaseUser = await firebaseAdmin.auth().getUser(decodedToken.uid);
        
        // Get user from database to check local verification status
        const dbUser = await User.findOne({ firebaseUid: decodedToken.uid });
        
        return { 
            user: {
                ...decodedToken,
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
                role: dbUser?.role || 'student',
                dbVerified: dbUser?.isVerified || false
            },
            type: 'firebase'
        };
    } catch (error) {
        console.error('Firebase auth error:', error);
        return null;
    }
};

// JWT Authentication (if you're using it as a backup)
const jwtAuth = (token) => {
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        return {
            user: decoded,
            type: 'jwt'
        };
    } catch (error) {
        console.error('JWT auth error:', error);
        return null;
    }
};

// Main authentication middleware
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') || 
                     req.cookies?.token;

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'No authentication token provided' 
            });
        }

        // Try Firebase authentication first
        const firebaseResult = await firebaseAuth(token);
        if (firebaseResult) {
            // Check email verification status
            if (!firebaseResult.user.emailVerified) {
                return res.status(403).json({
                    success: false,
                    message: 'Please verify your email before proceeding'
                });
            }

            // Check if verification states match between Firebase and database
            if (firebaseResult.user.emailVerified && !firebaseResult.user.dbVerified) {
                // Update database verification status
                await User.findOneAndUpdate(
                    { firebaseUid: firebaseResult.user.uid },
                    { isVerified: true }
                );
            }

            req.user = {
                userId: firebaseResult.user.uid,
                email: firebaseResult.user.email,
                role: firebaseResult.user.role,
                emailVerified: firebaseResult.user.emailVerified,
                authType: firebaseResult.type
            };
            return next();
        }

        // Fallback to JWT auth if Firebase fails
        const jwtResult = jwtAuth(token);
        if (jwtResult) {
            req.user = {
                userId: jwtResult.user.id,
                email: jwtResult.user.email,
                role: jwtResult.user.role,
                authType: jwtResult.type
            };
            return next();
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid authentication token'
        });
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

// Role-based access control middleware
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied',
                    details: 'Insufficient permissions'
                });
            }

            next();
        } catch (error) {
            console.error('Role check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Role verification failed',
                error: error.message
            });
        }
    };
};

// Verification check middleware
const requireVerifiedEmail = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!req.user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Email verification required'
            });
        }

        next();
    } catch (error) {
        console.error('Verification check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Verification check failed',
            error: error.message
        });
    }
};

module.exports = {
    authenticateUser,
    checkRole,
    requireVerifiedEmail
};