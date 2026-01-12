var express = require("express");
var router = express.Router();
var CategoryService = require("../../Services/CategoryService");
var Category = require("../../Entity/Category"); 
// Sử dụng Destructuring để lấy verifyToken và requireAdmin từ AuthMiddleware
const { verifyToken, requireAdmin } = require(global.__basedir + "/src/Middlewares/AuthMiddleware"); 
var ObjectId = require('mongodb').ObjectId; 

// API: Lấy danh sách danh mục có phân trang (Ví dụ: ?page=1&size=10)
router.get("/list", verifyToken, requireAdmin, async function(req, res) {
    var page = parseInt(req.query.page) || 1;
    var size = parseInt(req.query.size) || 10;
    var search = req.query.search || ""; // Lấy từ khóa tìm kiếm từ FE

    // Tạo đối tượng query để lọc dữ liệu
    var query = {};
    if (search) {
        // Tìm kiếm theo trường 'Name', không phân biệt chữ hoa/thường ('i')
        query.Name = { $regex: search, $options: 'i' }; 
    }

    var service = new CategoryService();
    // Truyền query vào hàm getCategoryList đã được cập nhật trước đó
    var list = await service.getCategoryList(page, size, query);
    res.json(list);
});

// API: Thêm mới danh mục
router.post("/add", verifyToken, requireAdmin, async function(req, res) {
    var service = new CategoryService();
    var cate = new Category();
    cate.Name = req.body.Name;
    cate.Status = req.body.Status || 'Active'; // Nhận status từ FE, mặc định là Active
    cate.ParentId = req.body.ParentId || null;
    var result = await service.insertCategory(cate);
    res.json(result);
});

// API: Cập nhật danh mục
router.put("/update", verifyToken, requireAdmin, async function(req, res) {
    var service = new CategoryService();
    var cate = new Category();
    cate._id = req.body.Id;
    cate.Name = req.body.Name;
    cate.Status = req.body.Status; // Cập nhật trạng thái mới
    cate.ParentId = req.body.ParentId;
    var result = await service.updateCategory(cate);
    res.json(result);
});

// API: Xóa danh mục
router.delete("/delete", verifyToken, requireAdmin, async function(req, res) {
    var service = new CategoryService();
    var result = await service.deleteCategory(req.query.id);
    res.json(result);
});

module.exports = router; 