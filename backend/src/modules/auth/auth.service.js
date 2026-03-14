const { getPool } = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
    return jwt.sign(
        { id: payload.id, username: payload.username, role: payload.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

const getUserByUsername = async (username) => {
    const pool = getPool();
    const client = await pool.connect();
    try {
        const query = 'SELECT * FROM users WHERE username = $1';
        const values = [username];
        const result = await client.query(query, values);
        return result.rows[0];
    } finally {
        client.release();
    }
};

const verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};  

const createAccount = async (client, data) => {
    const { username, password, email, role } = data;

    if (role == 'super_admin') {
        const err = new Error('Cannot create Super Admin accounts.');
        err.type = 'AUTH_UNAUTHORIZED';
        throw err;
    }
    if (role == 'admin' && client.role != 'super_admin') {
        const err = new Error('Only Super Admin can create admin accounts.');
        err.type = 'AUTH_UNAUTHORIZED';
        throw err;   
    }
    if (role == 'staff' && !['admin', 'super_admin'].includes(client.role)) {
        const err = new Error('Only Admin or Super Admin can create staff accounts.');
        err.type = 'AUTH_UNAUTHORIZED';
        throw err;
    }

    const userExists = await getUserByUsername(username);
    if (userExists) {
        const err = new Error('Username already exists');
        err.type = 'AUTH_USERNAME_TAKEN';
        throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const pool = getPool();
    const dbClient = await pool.connect();
    try {
        const query = 'INSERT INTO users (username, password_hash, email, role) VALUES ($1, $2, $3, $4) RETURNING user_id, username, email, role';
        const values = [username, hashedPassword, email, role];
        const result = await dbClient.query(query, values);
        return result.rows[0];
    } finally {
        dbClient.release();
    }
    // Returns an object with: user_id, username, email, role
};

const login = async (data) => {
    const { username, password } = data;

    const user = await getUserByUsername(username);
    if (!user) {
        const err = new Error('Invalid username or password.');
        err.type = 'AUTH_USER_NOT_FOUND';
        throw err;
    }

    const isPasswordCorrect = await verifyPassword(password, user.password_hash);
    if (!isPasswordCorrect) {
        const err = new Error('Invalid username or password.');
        err.type = 'AUTH_INVALID_PASSWORD';
        throw err;
    }

    const token = generateToken({
        id: user.user_id,
        username: user.username,
        role: user.role
    });

    const { password_hash, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, token };
}

module.exports = {
    createAccount,
    login
}