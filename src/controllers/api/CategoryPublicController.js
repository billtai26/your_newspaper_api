var express = require("express");
var router = express.Router();
var CategoryService = require("../../Services/CategoryService");

// API lấy danh sách danh mục cho người dùng (Không cần token)
router.get("/list", async function(req, res) {
    try {
        var service = new CategoryService();
        // Lấy trang 1, tối đa 100 danh mục để hiển thị trên menu
        var list = await service.getCategoryList(1, 100);
        res.json(list);
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

module.exports = router;
