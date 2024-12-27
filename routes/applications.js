const express = require('express');
const router = express.Router();
const { authenticateUser, checkRole } = require('../middleware/auth');
const applicationController = require('../controllers/applicationController');
const upload = require('../middleware/fileUpload');

router.use(authenticateUser);

router.post('/', 
    upload.array('documents'), 
    applicationController.submitApplication
);
router.get('/my-applications', applicationController.getMyApplications);
router.get('/:id', applicationController.getApplicationById);

// Reviewer routes
router.post('/:id/review', 
    checkRole(['admin', 'reviewer']), 
    applicationController.reviewApplication
);

module.exports = router;