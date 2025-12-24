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
        
        // Mapping dữ liệu text
        news.Title = req.body.Title; 
        news.Content = req.body.Content;
        news.Author = req.body.Author;

        // Xử lý ảnh: Nếu upload thành công, Cloudinary trả về đường dẫn trong req.file.path
        if (req.file) {
            console.log("Ảnh đã lên Cloudinary:", req.file.path);
            news.Image = req.file.path; 
        } else {
            news.Image = ""; // Hoặc để null tùy bạn
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

        // Validate ID
        if (!req.body.Id) {
            return res.status(400).json({ status: false, message: "Thiếu ID tin tức!" });
        }

        news._id = new ObjectId(req.body.Id); 
        news.Title = req.body.Title;
        news.Content = req.body.Content;
        news.Author = req.body.Author;

        // --- ĐOẠN CODE QUAN TRỌNG CẦN SỬA ---
        if (req.file) {
            // Trường hợp 1: Có upload ảnh mới -> Gán đường dẫn mới
            news.Image = req.file.path; 
        } else {
            // Trường hợp 2: Không upload ảnh -> XÓA thuộc tính Image
            // Việc này giúp MongoDB hiểu là "đừng đụng vào trường Image cũ trong database"
            delete news.Image; 
        }
        // -------------------------------------

        // Lưu ý: Cần đảm bảo Repository dùng $set: news
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

module.exports = router; 