var express = require("express");
var router = express.Router();
var CategoryService = require("../../Services/CategoryService");

// API lấy danh sách danh mục cho người dùng (Không cần token)
router.get("/list", async function(req, res) {
    try {
        var service = new CategoryService();
        // Chỉ lấy các danh mục có Status là 'Active'
        var list = await service.getCategoryList(1, 100, { Status: "Active" }); 
        res.json(list);
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

module.exports = router;
