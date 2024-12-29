const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');
const { sendEmail } = require('../utils/email');

exports.submitApplication = async (req, res) => {
    try {
        // Check if scholarship is still accepting applications
        const scholarship = await Scholarship.findById(req.body.scholarship);
        if (!scholarship || scholarship.status !== 'published') {
            return res.status(400).json({ error: 'Scholarship is not accepting applications' });
        }

        // Check if user already applied
        const existingApplication = await Application.findOne({
            scholarship: req.body.scholarship,
            applicant: req.user._id
        });
        if (existingApplication) {
            return res.status(400).json({ error: 'You have already applied for this scholarship' });
        }

        const application = new Application({
            ...req.body,
            applicant: req.user._id,
            status: 'submitted',
            submissionDate: Date.now()
        });

        await application.save();

        // Update scholarship application count
        await Scholarship.findByIdAndUpdate(req.body.scholarship, {
            $inc: { currentApplicants: 1 }
        });

        // Send confirmation email
        await sendEmail({
            to: req.user.email,
            subject: 'Application Submitted Successfully',
            template: 'application-confirmation',
            data: {
                scholarshipTitle: scholarship.title,
                applicationId: application._id
            }
        });

        res.status(201).json(application);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getApplicationById = async (req, res) => {
    try {
        const application = await Application.findOne({
            _id: req.params.id,
            applicant: req.user._id
        }).populate('scholarship');
        
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        
        res.json(application);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.reviewApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        application.reviews.push({
            reviewer: req.user._id,
            score: req.body.score,
            comments: req.body.comments
        });

        // Update application status based on review
        if (req.body.status) {
            application.status = req.body.status;
            
            // Send email notification
            await sendEmail({
                to: application.applicant.email,
                subject: `Application Status Updated`,
                template: 'application-status-update',
                data: {
                    status: req.body.status,
                    scholarshipTitle: application.scholarship.title
                }
            });
        }

        await application.save();
        res.json(application);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ user: req.user.userId })
            .populate({
                path: 'scholarship',
                select: 'title amount deadline status'
            })
            .populate({
                path: 'reviewedBy',
                select: 'name email'
            })
            .sort({ createdAt: -1 });

        if (!applications) {
            return res.status(404).json({ 
                success: false,
                message: 'No applications found'
            });
        }

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving applications',
            error: error.message
        });
    }
};