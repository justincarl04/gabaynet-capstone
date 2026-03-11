const authService = require('./auth.service');
const logger = require('../../utils/logger');

const registerAccount = async (req, res, next) => {
    logger.debug("Registering account with data: ", { body: req.body }); // DEBUG
    try {
        const user = await authService.createAccount(req.user, req.body);
        res.status(201).json(user);
    } catch (err) {
        if (err.type === 'AUTH_USERNAME_TAKEN') {
            logger.warn("Username already taken: ", { username: req.body.username }); // DEBUG
            return res.status(400).json({ message: err.message });
        }
        if (err.type === 'AUTH_UNAUTHORIZED') {
            logger.warn("Unauthorized attempt to register account: ", { user: req.user }); // DEBUG
            return res.status(403).json({ message: err.message });
        }
        err.userMessage = 'Failed to register account.';
        next(err);
    }
};

const login = async (req, res, next) => {
    logger.debug("Logging in user with data: ", { body: req.body }); // DEBUG
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password required.' });
        }
        const result = await authService.login(req.body);
        res.status(200).json(result);
    } catch (err) {
        if (err.type == 'AUTH_USER_NOT_FOUND' || err.type == 'AUTH_INVALID_PASSWORD') {
            logger.warn("Invalid login attempt for username: ", { username: req.body.username }); // DEBUG
            return res.status(401).json({ message: err.message });
        }
        err.userMessage = 'Failed to login user.';
        next(err);
    }
};

module.exports = {
    registerAccount,
    login
};