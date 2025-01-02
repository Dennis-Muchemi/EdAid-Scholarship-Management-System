const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiting configuration
const createRateLimiter = (windowMs, max) => rateLimit({
    windowMs,
    max,
    message: 'Too many requests from this IP, please try again later.'
});

// API rate limiter
const apiLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes

// Login rate limiter
const loginLimiter = createRateLimiter(60 * 60 * 1000, 5); // 5 login attempts per hour

// Security headers middleware
const securityHeaders = [
    helmet(),
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["*"],
            styleSrc: ["*", "'unsafe-inline'"],
            scriptSrc: ["*", "'unsafe-inline'"],
            imgSrc: ["*", "data:", "https:"],
            connectSrc: ["*"]
        }
    })
];

module.exports = {
    apiLimiter,
    loginLimiter,
    securityHeaders
};