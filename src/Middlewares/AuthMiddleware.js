const jwt = require('jsonwebtoken');
const config = require(global.__basedir + "/src/configs/Setting.json");

const AuthMiddleware = {
    // 1. Kiểm tra Token có hợp lệ không (Dùng cho cả Admin và User)
    verifyToken: (req, res, next) => {
        const tokenHeader = req.headers['authorization'];

        if (!tokenHeader) {
            return res.status(401).json({ auth: false, message: 'No token provided.' });
        }

        // Định dạng header: "Bearer <token>"
        const token = tokenHeader.split(" ")[1];
        if (!token) return res.status(401).json({ auth: false, message: 'Token format error.' });

        try {
            const decoded = jwt.verify(token, config.jwt.secret);
            req.userData = decoded; // Lưu thông tin user vào request để dùng sau
            next();
        } catch (err) {
            return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
        }
    },

    // 2. Chỉ cho phép Admin
    requireAdmin: (req, res, next) => {
        // Hàm này phải chạy SAU verifyToken
        if (req.userData && req.userData.role === 'admin') {
            next();
        } else {
            return res.status(403).json({ message: "Access Denied: You are not Admin" });
        }
    }
};

module.exports = AuthMiddleware;