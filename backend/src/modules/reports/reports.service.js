const pool = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../../config/s3");

const createReport = async (data, fileData) => {
    try{
        const { title, description, category_id, location, image_url, reporter_contact } = data;
        
        const query = 'INSERT INTO reports (title, description, category_id, location, image_url, reporter_contact) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const values = [title, description, category_id, location, image_url, reporter_contact];

        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (err) {
        if (fileData) {
            await s3.send(new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: fileData.key
            }));
            console.log("Deleted uploaded file from S3 due to error during report creation: ", fileData.key); // DEBUG
        }
        throw err;
    }
};

const getAllReports = async (query) => {
    const { 
        page = 1, 
        limit = 10, 
        category, 
        category_id,
        status, 
        title, 
        from, 
        to, 
        sort = 'submitted_at', 
        order = '' 
    } = query;

    let baseQuery = 'SELECT r.report_id, r.title, r.status, r.updated_at, r.submitted_at, c.name AS category_name, COUNT(*) OVER() AS total_count FROM reports r JOIN categories c ON r.category_id = c.category_id';
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

    baseQuery += ` ORDER BY r.${sort} ${order} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, (page - 1) * limit);

    const result = await pool.query(baseQuery, values);
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
};

const getReportById = async (report_id) => {
    const query = 'SELECT r.*, c.name AS category_name FROM reports r JOIN categories c ON r.category_id = c.category_id WHERE r.report_id = $1';
    const result = await pool.query(query, [report_id]);

    if (!result.rows[0]){
        const err = new Error('There is no report with this id.');
        err.type = 'REPORT_NOT_FOUND';
        throw err;
    }
    return result.rows[0];
};

module.exports = {
    createReport,
    getAllReports,
    getReportById
};