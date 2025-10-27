const { register, login } = require('../services/authService');

exports.register = async(req, res) => {
    try {
        const data = await register(req.body);
        res.json(data);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.login = async(req, res) => {
    try {
        const data = await login(req.body);
        res.json(data);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};