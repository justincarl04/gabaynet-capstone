const logger = require('../../utils/logger');
const reportService = require('./reports.service');

const newReport = async (req, res, next) => {

    if (!req.body.title || !req.body.category_id) {
        return res.status(400).json({ message: 'Title and Category are required.' });
    }

    const reportData = {
        ...req.body,
        image_url: req.file ? (req.file.location || `/uploads/${req.file.filename}`) : null
    };

    logger.debug("Creating report with data: ", reportData); // DEBUG
    try {
        const report = await reportService.createReport(reportData, req.file);
        res.status(201).json(report);
    } catch (err) {
        if (err.code === '23503') { 
            logger.warn("Foreign key constraint violation: ", { error: err }); // DEBUG
            return res.status(400).json({ message: 'Invalid Category' });
        }
        err.userMessage = 'Failed to create report.';
        next(err);
    }
};

const getAllReports = async (req, res, next) => {
    logger.debug("Fetching all reports"); // DEBUG
    try {
        const reports = await reportService.getAllReports(req.query);

        res.json(reports);
    } catch (err) {
        err.userMessage = 'Failed to fetch reports.';
        next(err);
    }
};

const getReportById = async (req, res, next) => {
    logger.debug('Fetching report with ID: ', req.params.report_id); // DEBUG
    try {
        const report = await reportService.getReportById(req.params.report_id);
        res.json(report);
    } catch (err) {
        if (err.type === 'REPORT_NOT_FOUND') {
            logger.warn("Report not found: ", { report_id: req.params.report_id }); // DEBUG
            return res.status(404).json({ message: err.message });
        }
        err.userMessage = 'Failed to fetch report.';
        next(err);
    }
};

module.exports = {
    newReport,
    getAllReports,
    getReportById
};