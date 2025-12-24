const express = require("express");
const router = express.Router();
const UserService = require(global.__basedir + "/src/Services/UserService");
const User = require(global.__basedir + "/src/Entity/User");

// API Đăng ký
router.post("/register", async (req, res) => {
    try {
        const userService = new UserService();
        const user = new User();
        user.Username = req.body.username;
        user.Password = req.body.password;
        user.Email = req.body.email;
        user.Role = req.body.role || 'user'; 

        await userService.register(user);
        res.json({ status: true, message: "Đăng ký thành công" });
    } catch (error) {
        res.status(400).json({ status: false, message: error.message });
    }
});

// API Đăng nhập
router.post("/login", async (req, res) => {
    try {
        const userService = new UserService();
        const result = await userService.login(req.body.username, req.body.password);

        if (result) {
            res.json({ 
                status: true, 
                message: "Login success", 
                token: result.token,
                role: result.role
            });
        } else {
            res.status(401).json({ status: false, message: "Sai tài khoản hoặc mật khẩu" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;