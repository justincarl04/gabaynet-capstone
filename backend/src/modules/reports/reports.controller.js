const { get } = require('./reports.routes');
const reportService = require('./reports.service');

const newReport = async (req, res) => {

    if (!req.body.title || !req.body.category_id) {
        return res.status(400).json({ message: 'Title and Category are required.' });
    }

    console.log("Creating report with data: ", req.body); // DEBUG
    try {
        const report = await reportService.createReport(req.body);
        res.status(201).json(report);
    } catch (err) {
        if (err.code === '23503') { 
            return res.status(400).json({ message: 'Invalid Category' });
        }
        console.error("Error occurred while creating report: ", err); // DEBUG
        return res.status(500).json({ message: 'Failed to create report.' });
    }
};

const getAllReports = async (req, res) => {
    console.log("Fetching all reports"); // DEBUG
    try {
        const reports = await reportService.getAllReports(req.query);

        res.json(reports);
    } catch (err) {
        console.error("Error occurred while fetching reports: ", err); // DEBUG
        return res.status(500).json({ message: 'Failed to fetch reports.' });
    }
};

const getReportById = async (req, res) => {
    console.log('Fetching report with ID: ', req.params.report_id); // DEBUG
    try {
        const report = await reportService.getReportById(req.params.report_id);
        res.json(report);
    } catch (err) {
        console.error("Error occured while fetching report: ", err); // DEBUG
        if (err.type === 'REPORT_NOT_FOUND') {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: 'Failed to fetch report.' });
    }
};

module.exports = {
    newReport,
    getAllReports,
    getReportById
};