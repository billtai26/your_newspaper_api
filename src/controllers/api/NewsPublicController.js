var express = require("express");
var router = express.Router();
var NewsService = require(global.__basedir + "/src/Services/NewsService");
var ObjectId = require('mongodb').ObjectId;

// API Lấy danh sách tin tức công khai
router.get("/list", async function(req, res) {
    try {
        const newsService = new NewsService();
        
        // Lấy tham số từ URL query
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const categoryId = req.query.category;
        const search = req.query.search;

        const result = await newsService.getNewsWithPagination(page, limit, search, categoryId);
        
        // Trả về kết quả kèm thông tin phân trang
        res.json(result); 
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// API Lấy chi tiết một bài tin tức
router.get("/detail/:id", async function(req, res) {
    try {
        const newsService = new NewsService();
        const id = req.params.id;

        // Kiểm tra ID hợp lệ
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ status: false, message: "ID không hợp lệ" });
        }

        const result = await newsService.getNewsById(new ObjectId(id));
        
        if (result) {
            res.json({ status: true, data: result });
        } else {
            res.status(404).json({ status: false, message: "Tin tức không tìm thấy" });
        }
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// Xử lý GET /news/:id
router.get("/:id", async function(req, res) {
    try {
        const newsService = new NewsService();
        const result = await newsService.getNewsById(req.params.id);
        
        if (result) {
            res.json(result); // Trả về object bài viết trực tiếp
        } else {
            res.status(404).json({ message: "Không tìm thấy bài viết" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
