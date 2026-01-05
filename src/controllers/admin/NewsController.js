var express = require("express"); 
var router = express.Router();
var NewsService = require(global.__basedir + "/src/Services/NewsService");
var News = require(global.__basedir + "/src/Entity/News");
var ObjectId = require('mongodb').ObjectId;
// Import middleware upload
var upload = require(global.__basedir + "/src/Middlewares/CloudinaryUpload");
var { verifyToken, requireAdmin } = require(global.__basedir + "/src/Middlewares/AuthMiddleware");

// API Thêm tin tức có ảnh
// 'Image' trong upload.single('Image') là tên key mà bạn phải gửi từ Postman/Form
router.post("/insert-news", verifyToken, requireAdmin, upload.single('Image'), async function(req, res) {
    try {
        var newsService = new NewsService();
        var news = new News();
        
        // Mapping dữ liệu văn bản
        news.Title = req.body.Title; 
        news.Content = req.body.Content;
        news.Author = req.body.Author;

        // Logic xử lý ảnh linh hoạt:
        if (req.file) {
            // Trường hợp 1: Chọn file từ máy tính (đã qua Cloudinary)
            news.Image = req.file.path; 
        } else if (req.body.ImageUrl) {
            // Trường hợp 2: Gửi link ảnh trực tiếp (tên key là ImageUrl hoặc tùy bạn đặt)
            news.Image = req.body.ImageUrl;
        } else {
            news.Image = ""; 
        }

        var result = await newsService.insertNews(news);
        res.json({ status: true, message: "Thêm tin tức thành công", data: result });
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

        const result = await newsService.getNewsWithPagination(page, limit);
        
        // Trả về kết quả kèm thông tin phân trang
        res.json(result); 
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// API Cập nhật tin tức
router.post("/update-news", verifyToken, requireAdmin, upload.single('Image'), async function(req, res) {
    try {
        var newsService = new NewsService();
        var news = new News();

        if (!req.body.Id) {
            return res.status(400).json({ status: false, message: "Thiếu ID tin tức!" });
        }

        news._id = new ObjectId(req.body.Id); 
        news.Title = req.body.Title;
        news.Content = req.body.Content;
        news.Author = req.body.Author;

        // Xử lý ảnh khi cập nhật:
        if (req.file) {
            // Nếu có upload file mới -> lấy path mới
            news.Image = req.file.path; 
        } else if (req.body.ImageUrl) {
            // Nếu gửi link ảnh mới thay thế
            news.Image = req.body.ImageUrl;
        } else {
            // Nếu không gửi file và không gửi link, xóa thuộc tính Image 
            // để NewsRepository sử dụng $set mà không làm mất ảnh cũ trong DB
            delete news.Image; 
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