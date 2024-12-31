const express = require('express');
const router = express.Router();
const { authenticateUser, checkRole } = require('../middleware/auth');

// Student Dashboard
router.get('/student', [authenticateUser, checkRole(['student'])], (req, res) => {
    res.render('dashboard/student', { user: req.user });
});

// Reviewer Dashboard
router.get('/reviewer', [authenticateUser, checkRole(['reviewer'])], (req, res) => {
    res.render('dashboard/reviewer', { user: req.user });
});

module.exports = router;

