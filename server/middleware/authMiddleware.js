const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (req.params.id) {
            if (req.params.id !== String(decoded.id)) {
                return res.status(401).json({ success: false, message: 'Access denied' });
            }
        }

        req.user = decoded;
        next();
    } catch (err) {
        console.error(err.message)

        return res.status(401).json({ success: false, message: 'Token verification failed' });
    }
};

module.exports = authMiddleware;
