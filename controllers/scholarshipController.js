const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');

exports.createScholarship = async (req, res) => {
    try {
        const scholarship = new Scholarship({
            ...req.body,
            createdBy: req.user._id
        });
        await scholarship.save();
        res.status(201).json(scholarship);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllScholarships = async (req, res) => {
    try {
        const filters = {};
        if (req.query.status) filters.status = req.query.status;
        if (req.query.academicLevel) filters['requirements.academicLevel'] = req.query.academicLevel;
        
        const scholarships = await Scholarship.find(filters)
            .where('deadline').gt(Date.now())
            .where('status').equals('published')
            .sort({ deadline: 1 });
            
        res.json(scholarships);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getScholarshipById = async (req, res) => {
    try {
        const scholarship = await Scholarship.findById(req.params.id);
        if (!scholarship) {
            return res.status(404).json({ error: 'Scholarship not found' });
        }
        res.json(scholarship);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateScholarship = async (req, res) => {
    try {
        const scholarship = await Scholarship.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!scholarship) {
            return res.status(404).json({ error: 'Scholarship not found' });
        }
        res.json(scholarship);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};