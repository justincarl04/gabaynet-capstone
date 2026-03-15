const logger = require('../../utils/logger');
const reportService = require('./reports.service');

const newReport = async (req, res, next) => {

    if (!req.body.title || !req.body.category_id) {
        return res.status(400).json({ message: 'Title and Category are required.' });
    }

    logger.debug("Creating report with data: ", req.body); // DEBUG
    try {
        const report = await reportService.createReport(req.body, req.file);
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

const claimReport = async (req, res, next) => {
    logger.debug('Claiming report with ID: ', req.params.report_id, ' by user: ', req.user.id); // DEBUG
    try {
        const report = await reportService.claimReport(req.params.report_id, req.user.id);
        res.json(report);
    } catch (err) {
        if (err.type === 'REPORT_CLAIM_FAILED'){
            logger.warn("Report not found or already claimed for: ", { report_id: req.params.report_id }); // DEBUG
            return res.status(404).json({ message: err.message });
        }
        err.userMessage = 'Failed to claim report.';
        next(err);
    }
}

const resolveReport = async (req, res, next) => {
    logger.debug('Resolving report with ID: ', req.params.report_id, ' by user: ', req.user.id);
    try {
        const report = await reportService.resolveReport(req.params.report_id, req.user.id);
        res.json(report);
    } catch (err) {
        if (err.type === 'REPORT_NOT_FOUND'){
            logger.warn("Report not found for resolving: ", { report_id: req.params.report_id }); // DEBUG
            return res.status(404).json({ message: err.message });
        }
        err.userMessage = 'Failed to resolve report.';
        next(err);
    }
}

module.exports = {
    newReport,
    getAllReports,
    getReportById,
    claimReport,
    resolveReport
};