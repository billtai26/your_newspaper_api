const express = require("express");
const router = express.Router();
const UserService = require(global.__basedir + "/src/Services/UserService");
const User = require(global.__basedir + "/src/Entity/User");

class AuthenticateController {

    /**
     * API Đăng ký tài khoản
     */
    register = async (req, res) => {
        try {
            const userService = new UserService();
            const user = new User();
            user.Username = req.body.username;
            user.Password = req.body.password;
            user.Email = req.body.email;
            user.Role = req.body.role || 'user';

            await userService.register(user);
            
            return res.status(201).json({ 
                status: true, 
                message: "Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản." 
            });
        } catch (error) {
            return res.status(400).json({ status: false, message: error.message });
        }
    }

    /**
     * API Kích hoạt tài khoản qua Token
     */
    activate = async (req, res) => {
        try {
            const userService = new UserService();
            const { token } = req.params;
            await userService.activateUser(token);

            // Trả về JSON thay vì res.send(HTML)
            return res.status(200).json({ 
                status: true, 
                message: "Kích hoạt thành công" 
            });
        } catch (error) {
            return res.status(400).json({ 
                status: false, 
                message: error.message 
            });
        }
    }

    /**
     * API Đăng nhập
     */
    login = async (req, res) => {
        try {
            const userService = new UserService();
            const { username, password } = req.body;
            const result = await userService.login(username, password);

            if (result) {
                return res.json({ 
                    status: true, 
                    message: "Đăng nhập thành công", 
                    token: result.token, 
                    role: result.role,
                    username: result.username 
                });
            } else {
                return res.status(401).json({ status: false, message: "Sai tài khoản hoặc mật khẩu" });
            }
        } catch (error) {
            // Trả về 403 (Forbidden) nếu tài khoản chưa kích hoạt
            const statusCode = error.message.includes("kích hoạt") ? 403 : 500;
            return res.status(statusCode).json({ status: false, message: error.message });
        }
    }
}

// Khởi tạo instance của Controller
const authController = new AuthenticateController();

// Định nghĩa các Route sử dụng các method của Class
router.post("/register", authController.register);
router.get("/activate/:token", authController.activate);
router.post("/login", authController.login);

module.exports = router;