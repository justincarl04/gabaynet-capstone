const reportService = require('./reports.service');

const newReport = async (req, res) => {
    console.log("Creating report with data: ", req.body); // DEBUG
    try {
        const report = await reportService.createReport(req.body);
        res.status(201).json(report);
    } catch (err) {
        console.error("Error occurred while creating report: ", err); // DEBUG
    }
};

module.exports = {
    createReport
};