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
        // XỬ LÝ ẢNH LINH HOẠT:
        if (req.file) {
            // TH1: Người dùng upload file từ máy tính
            news.Image = req.file.path; 
        } else {
            // TH2: Người dùng gửi link ảnh (Ưu tiên ImageUrl, sau đó đến Image trong body)
            news.Image = req.body.ImageUrl || req.body.Image || ""; 
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
            news.Image = req.file.path; 
        } else {
            // Lấy link mới từ ImageUrl hoặc Image nếu có gửi lên
            const newLink = req.body.ImageUrl || req.body.Image;
            if (newLink) {
                news.Image = newLink;
            } else {
                // Nếu không gửi gì cả, xóa thuộc tính Image để không ghi đè ảnh cũ trong DB
                delete news.Image; 
            }
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