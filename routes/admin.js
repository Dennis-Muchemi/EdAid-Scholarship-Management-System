const express = require('express');
const router = express.Router();
const { authenticateUser, checkRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.use(authenticateUser);
router.use(checkRole(['admin']));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/applications/stats', adminController.getApplicationStats);
router.get('/scholarships/stats', adminController.getScholarshipStats);
router.get('/users', adminController.manageUsers);
router.put('/users/:id/role', adminController.updateUserRole);

module.exports = router;