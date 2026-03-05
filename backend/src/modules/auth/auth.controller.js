const authService = require('./auth.service');

const registerAccount = async (req, res) => {
    console.log("Registering account with data: ", req.body); // DEBUG
    try {
        const user = await authService.createAccount(req.user, req.body);
        res.status(201).json(user);
    } catch (err) {
        console.error("Error occurred while registering account: ", err); // DEBUG
        if (err.type === 'AUTH_USERNAME_TAKEN') {
            return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

const login = async (req, res) => {
    console.log("Logging in user with data: ", req.body); // DEBUG
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password required.' });
        }

        const result = await authService.login(req.body);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error occurred while logging in user: ", err); // DEBUG
        if (err.type == 'AUTH_USER_NOT_FOUND' || err.type == 'AUTH_INVALID_PASSWORD') {
            return res.status(401).json({ message: err.message });
        }
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = {
    registerAccount,
    login
};