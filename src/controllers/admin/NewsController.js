var express = require("express"); 
var router = express.Router();
var NewsService = require(global.__basedir + "/src/Services/NewsService");
var News = require(global.__basedir + "/src/Entity/News");
var ObjectId = require('mongodb').ObjectId;
// Import middleware upload
var upload = require(global.__basedir + "/src/Middlewares/CloudinaryUpload");
var { verifyToken, requireAdmin } = require(global.__basedir + "/src/Middlewares/AuthMiddleware");

// API Thêm tin tức có ảnh
router.post("/insert-news", verifyToken, requireAdmin, async function(req, res) {
    try {
        var newsService = new NewsService();
        var news = new News();
        
        news.Title = req.body.Title; 
        news.Content = req.body.Content;
        news.Author = req.body.Author;
        // THÊM DÒNG NÀY:
        news.CategoryId = req.body.CategoryId; 

        news.Image = req.body.Image || ""; 

        var result = await newsService.insertNews(news);
        res.json({ status: true, message: "Thêm thành công", data: result });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// API Lấy danh sách tin tức
router.get("/news-list", async function(req, res) {
    try {
        const newsService = new NewsService();
        
        // Lấy tham số từ URL query
        const page = req.query.page;
        const limit = req.query.limit;
        var search = req.query.search || "";
        var categoryId = req.query.categoryId || "";

        const result = await newsService.getNewsWithPagination(page, limit, search, categoryId);
        
        // Trả về kết quả kèm thông tin phân trang
        res.json(result); 
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// API Cập nhật tin tức
router.post("/update-news", verifyToken, requireAdmin, async function(req, res) {
    try {
        var newsService = new NewsService();
        var news = new News();

        news._id = new ObjectId(req.body.Id); 
        news.Title = req.body.Title;
        news.Content = req.body.Content;
        news.Author = req.body.Author;
        // THÊM DÒNG NÀY:
        news.CategoryId = req.body.CategoryId; 

        if (req.body.Image) {
            news.Image = req.body.Image;
        }
        await newsService.updateNews(news);
        res.json({ status: true, message: "Cập nhật thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// API Xóa tin tức
router.delete("/delete-news", verifyToken, requireAdmin, async function(req, res) {
    var newsService = new NewsService();
    await newsService.deleteNews(req.query.id);
    res.json({ status: true, message: "Xóa thành công" });
});

router.get("/:id", async function(req, res) {
    try {
        const newsService = new NewsService();
        const articleId = req.params.id; // Lấy ID từ URL

        // Bạn cần đảm bảo NewsService đã có hàm getNewsById
        const result = await newsService.getNewsById(articleId); 
        
        if (result) {
            res.json({ status: true, data: result });
        } else {
            res.status(404).json({ status: false, message: "Không tìm thấy bài viết" });
        }
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

module.exports = router; 