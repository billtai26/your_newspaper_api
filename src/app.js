// 1. Khai báo path để xử lý đường dẫn
const path = require('path');

// 2. Định nghĩa __basedir trỏ về thư mục GỐC (lùi ra khỏi folder src)
global.__basedir = path.join(__dirname, '..'); 

var express = require('express');
var bodyParser = require('body-parser'); 
const DatabaseConnection = require('./Database/Database'); // Require class

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); 
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json()); 

// Routes
// 1. Khai báo controller tổng (trỏ vào thư mục controllers)
var mainController = require(__dirname + "/controllers/index");

// 2. Sử dụng controller này cho mọi request bắt đầu từ root "/"
app.use("/", mainController);

// Hàm khởi động server
const startServer = async () => {
    try {
        // 3. Gọi hàm connect từ Singleton (Xem Bước 2 để sửa file Database.js)
        await DatabaseConnection.connect(); 
        
        app.listen(PORT, () => {
            console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Không thể khởi động server:', error);
        process.exit(1);
    }
};

startServer();