const { getPool } = require('../../config/db');
const logger = require('../../utils/logger');
const generateSignedUrl = require('../../utils/s3SignedUrl');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const uploadFile = require("../../utils/s3Upload");
const s3 = require("../../config/s3");

const createReport = async (data, fileData) => {
    const pool = getPool();
    const client = await pool.connect();
    try{
        let image_url = null;
        if (fileData) {
            image_url = await uploadFile(fileData);
        }

        const { title, description, category_id, location, reporter_contact } = data;
        
        const query = 'INSERT INTO reports (title, description, category_id, location, image_url, reporter_contact) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const values = [title, description, category_id, location, image_url, reporter_contact];

        const result = await client.query(query, values);
        let report = result.rows[0];

        if (report.image_url) {
            report.image_url = await generateSignedUrl(report.image_url);
        }

        return report;
    } catch (err) {
        if (fileData) {
            await s3.send(new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: image_url
            }));
            logger.info("Deleted uploaded file from S3 due to error during report creation: ", fileData.key); // DEBUG
        }
        throw err;
    } finally {
        client.release();
    }
};

const getAllReports = async (query) => {
    const pool = getPool();
    const client = await pool.connect();
    const { 
        page = 1, 
        limit = 10, 
        category, 
        category_id,
        status, 
        title, 
        handler_name,
        from, 
        to, 
        sort = 'submitted_at', 
        order = '' 
    } = query;

    const validSortMap = {
        'submitted_at':  'r.submitted_at',
        'report_id':     'r.report_id',
        'status':        'r.status',
        'title':         'r.title',
        'category_name': 'c.name',
        'handler_name':  'u.username',
    } 
    const validOrders = ['asc', 'desc']

    let baseQuery = 'SELECT r.report_id, r.title, r.status, r.updated_at, r.submitted_at, c.name AS category_name, u.username AS handler_name, COUNT(*) OVER() AS total_count FROM reports r JOIN categories c ON r.category_id = c.category_id LEFT JOIN users u ON r.handler_id = u.user_id';
    const conditions = [];
    const values = [];
    if (category) {
        values.push(category);
        conditions.push(`c.name = $${values.length}`);
    }
    if (category_id) {
        values.push(category_id);
        conditions.push(`r.category_id = $${values.length}`);
    }
    if (status) {
        values.push(status);
        conditions.push(`r.status = $${values.length}`);
    }
    if (title) {
        values.push(`%${title}%`);
        conditions.push(`r.title ILIKE $${values.length}`);
    }
    if (handler_name) {
        values.push(`%${handler_name}%`);
        conditions.push(`u.username ILIKE $${values.length}`);
    }
    if (from) {
        values.push(from);
        conditions.push(`r.submitted_at >= $${values.length}`);
    }
    if (to) {
        values.push(to);
        conditions.push(`r.submitted_at <= $${values.length}`);
    }
    if (conditions.length > 0) {
        baseQuery += ' WHERE ' + conditions.join(' AND ');
    }
    
    const safeOrder = validOrders.includes(order.toLowerCase()) ? order.toLowerCase() : 'desc';
    const safeSort = validSortMap[sort] ?? sortColumnMap['submitted_at']; 

    baseQuery += ` ORDER BY ${safeSort} ${safeOrder} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, (page - 1) * limit);

    try{
        const result = await client.query(baseQuery, values);
        const reports = result.rows;
        const totalCount = reports.length > 0 ? parseInt(reports[0].total_count) : 0;

        return {
            data: reports,
            meta: {
                totalCount: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit),
                hasNextPage: page * limit < totalCount,
                hasPreviousPage: page > 1
            }
        }
    }  finally {
        client.release();
    }
};

const getReportById = async (report_id) => {
    const pool = getPool();
    const client = await pool.connect();
    const query = 'SELECT r.*, c.name AS category_name, u.username AS handler_name FROM reports r JOIN categories c ON r.category_id = c.category_id LEFT JOIN users u ON r.handler_id = u.user_id WHERE r.report_id = $1';
    
    try{
        const result = await client.query(query, [report_id]);
        if (!result.rows[0]){
            const err = new Error('There is no report with this id.');
            err.type = 'REPORT_NOT_FOUND';
            throw err;
        }
        let report = result.rows[0];
        if (report.image_url) {
            report.image_url = await generateSignedUrl(report.image_url);
        }

        return report;   
    } finally {
        client.release();
    }
};

const claimReport = async (report_id, user_id) => {
    const pool = getPool();
    const client = await pool.connect();
    const query = "UPDATE reports SET handler_id = $1, status = $2, updated_at = NOW() WHERE report_id = $3 AND status = 'pending' RETURNING *";
    const values = [user_id, 'in_progress', report_id];
    try{
        const result = await client.query(query, values);
        if (!result.rows[0]){
            const err = new Error('Report not found or already claimed.');
            err.type = 'REPORT_CLAIM_FAILED';
            throw err;
        }
        return result.rows[0];
    } finally {
        client.release();
    }
}

const resolveReport = async (report_id, user_id) => {
    const pool = getPool();
    const client = await pool.connect();
    // user_id is for future use, for audit logging.
    const query = 'UPDATE reports SET status = $1, updated_at = NOW() WHERE report_id = $2 RETURNING *';
    const values = ['resolved', report_id];
    
    try{
        const result = await client.query(query, values);
        if (!result.rows[0]){
            const err = new Error('There is no report with this id.');
            err.type = 'REPORT_NOT_FOUND';
            throw err;
        }
        return result.rows[0];
    } finally {
        client.release();
    }
}

module.exports = {
    createReport,
    getAllReports,
    getReportById,
    claimReport,
    resolveReport
};