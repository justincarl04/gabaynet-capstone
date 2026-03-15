const { loadSecrets } = require('./src/config/secrets');
const { getPool } = require('./src/config/db');
const fs = require('fs');
const path = require('path');
exports.handler = async () => {
    await loadSecrets();
    const pool = getPool();
    const client = await pool.connect();
    try {
        const schema = fs.readFileSync(path.join(__dirname, 'database/schema.sql'), 'utf8');
        await client.query(schema);
        console.log('Schema applied successfully.');
        return { statusCode: 200, body: 'Schema applied.' };
    } catch (err) {
        console.error('Schema error:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
};