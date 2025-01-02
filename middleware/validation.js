const { body, validationResult } = require('express-validator');

// Scholarship validation middleware
const validateScholarship = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('deadline').isISO8601().withMessage('Invalid date format'),
    body('requirements.gpa').isFloat({ min: 0, max: 4 }).withMessage('GPA must be between 0 and 4'),
    body('requirements.academicLevel').isIn(['undergraduate', 'graduate', 'both'])
        .withMessage('Invalid academic level'),
];

// Application validation middleware
const validateApplication = [
    body('academicInfo.gpa').isFloat({ min: 0, max: 4 }).withMessage('GPA must be between 0 and 4'),
    body('academicInfo.institution').trim().notEmpty().withMessage('Institution is required'),
    body('academicInfo.major').trim().notEmpty().withMessage('Major is required'),
];

// Review validation middleware
const validateReview = [
    body('score').isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
    body('comments').trim().notEmpty().withMessage('Comments are required'),
    body('status').isIn(['under_review', 'shortlisted', 'accepted', 'rejected'])
        .withMessage('Invalid status'),
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    validateScholarship,
    validateApplication,
    validateReview,
    handleValidationErrors
};