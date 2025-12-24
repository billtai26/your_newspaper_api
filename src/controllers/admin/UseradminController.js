const express = require("express");
const router = express.Router();
const UserService = require(global.__basedir + "/src/Services/UserService");
const { verifyToken, requireAdmin } = require(global.__basedir + "/src/Middlewares/AuthMiddleware");

// API: Lấy danh sách người dùng có phân trang
// URL: GET /admin/user/list?page=1&limit=10
router.get("/list", verifyToken, requireAdmin, async (req, res) => {
    try {
        const userService = new UserService();
        
        // Lấy thông tin phân trang từ query string [cite: 241]
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Gọi service xử lý logic lấy dữ liệu
        const result = await userService.getUserListWithPagination(page, limit);
        
        res.json({
            status: true,
            data: result.users,
            pagination: {
                total: result.total,
                page: page,
                limit: limit,
                totalPages: Math.ceil(result.total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// API: Xóa người dùng
// URL: DELETE /admin/user/delete?id=...
router.delete("/delete", verifyToken, requireAdmin, async (req, res) => {
    try {
        const userService = new UserService();
        const userId = req.query.id; // Lấy ID từ tham số query [cite: 336]

        if (!userId) {
            return res.status(400).json({ status: false, message: "Thiếu ID người dùng" });
        }

        const result = await userService.deleteUser(userId);
        
        if (result) {
            res.json({ status: true, message: "Xóa người dùng thành công" });
        } else {
            res.status(404).json({ status: false, message: "Không tìm thấy người dùng" });
        }
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// API: Cập nhật vai trò (Role) của người dùng
// URL: PUT /admin/user/update-role
router.put("/update-role", verifyToken, requireAdmin, async (req, res) => {
    try {
        const userService = new UserService();
        const { id, role } = req.body;

        if (!id || !role) {
            return res.status(400).json({ status: false, message: "Thiếu ID hoặc Role" });
        }

        await userService.updateUserRole(id, role);
        res.json({ status: true, message: "Cập nhật quyền thành công" });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

module.exports = router;