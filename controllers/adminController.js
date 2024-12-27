const User = require('../models/user');
const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');

exports.getDashboardStats = async (req, res) => {
    try {
        const stats = {
            totalScholarships: await Scholarship.countDocuments(),
            activeScholarships: await Scholarship.countDocuments({ 
                status: 'published',
                deadline: { $gt: new Date() }
            }),
            totalApplications: await Application.countDocuments(),
            pendingReviews: await Application.countDocuments({ 
                status: 'submitted'
            }),
            totalUsers: await User.countDocuments(),
            recentApplications: await Application.find()
                .sort('-submissionDate')
                .limit(5)
                .populate('applicant', 'profile.firstName profile.lastName')
                .populate('scholarship', 'title'),
            upcomingDeadlines: await Scholarship.find({
                status: 'published',
                deadline: { $gt: new Date() }
            })
                .sort('deadline')
                .limit(5)
                .select('title deadline currentApplicants')
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getApplicationStats = async (req, res) => {
    try {
        const monthlyStats = await Application.aggregate([
            {
                $group: {
                    _id: {
                        month: { $month: "$submissionDate" },
                        year: { $year: "$submissionDate" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const statusStats = await Application.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            monthly: monthlyStats,
            byStatus: statusStats
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getScholarshipStats = async (req, res) => {
    try {
        const stats = await Scholarship.aggregate([
            {
                $facet: {
                    byStatus: [
                        { $group: { _id: "$status", count: { $sum: 1 } } }
                    ],
                    byAcademicLevel: [
                        { $group: { _id: "$requirements.academicLevel", count: { $sum: 1 } } }
                    ],
                    totalFunding: [
                        { $group: { _id: null, total: { $sum: "$amount" } } }
                    ]
                }
            }
        ]);

        res.json(stats[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.manageUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-__v')
            .sort('-createdAt');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role: req.body.role },
            { new: true, runValidators: true }
        );
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};