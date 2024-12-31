// app.js
const express = require('express');
const mongoose = require('mongoose');
const firebaseAdmin = require('firebase-admin');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');
const { apiLimiter, securityHeaders } = require('./middleware/security');
const { handleValidationErrors } = require('./middleware/validation');

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS)
});

// Middleware Configuration
app.use(limiter);
app.use(express.static('public'));
app.use(bodyParser.json({
    limit: process.env.MAX_FILE_SIZE
}));
app.use(bodyParser.urlencoded({ 
    extended: true,
    limit: process.env.MAX_FILE_SIZE
}));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Apply security headers
app.use(securityHeaders);

// Apply API rate limiting to all routes
app.use('/api/', apiLimiter);

// Apply validation error handler
app.use(handleValidationErrors);

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Firebase Admin Initialization
const firebaseAdminConfig = require('./config/firebase-admin');
firebaseAdmin.initializeApp(firebaseAdminConfig);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
    console.error('MongoDB Connection Error:', err);
    console.error('Connection String:', process.env.MONGODB_URI);
});

// Serve static files from the src directory
app.use(express.static(path.join(__dirname, 'src')));

// Import Routes
const authRoutes = require('./routes/auth');
const scholarshipRoutes = require('./routes/scholarships');
const applicationRoutes = require('./routes/applications');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');

// Route Middleware
app.use('/auth', authRoutes);
app.use('/scholarships', scholarshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/admin', adminRoutes);
app.use('/api/users', userRoutes);

// Root URL Handler
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/assets/pages/index.html'));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;