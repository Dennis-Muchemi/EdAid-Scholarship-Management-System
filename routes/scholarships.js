const express = require('express');
const router = express.Router();
const { authenticateUser, checkRole } = require('../middleware/auth');
const scholarshipController = require('../controllers/scholarshipController');
const upload = require('../middleware/fileUpload');

router.get('/', scholarshipController.getAllScholarships);
router.get('/:id', scholarshipController.getScholarshipById);

// Protected routes
router.use(authenticateUser);
router.post('/', 
    checkRole(['admin']), 
    upload.array('documents'), 
    scholarshipController.createScholarship
);
router.put('/:id', 
    checkRole(['admin']), 
    upload.array('documents'), 
    scholarshipController.updateScholarship
);

module.exports = router;