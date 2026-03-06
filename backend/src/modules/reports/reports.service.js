const pool = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createReport = async (data) => {
    const { title, description, category_id, location, image_url, reporter_contact } = data;
    
    const query = 'INSERT INTO reports (title, description, category_id, location, image_url, reporter_contact) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    const values = [title, description, category_id, location, image_url, reporter_contact];

    const result = await pool.query(query, values);
    return result.rows[0];
};

module.exports = {
    createReport
};