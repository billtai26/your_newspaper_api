var express = require("express");
var router = express.Router();

// Sử dụng authenticatecontroller cho các tác vụ đăng nhập/đăng ký
router.use("/authenticate", require(__dirname + "/api/authenticatecontroller"));

// Sử dụng UseradminController cho các tác vụ quản lý user của Admin
router.use("/admin/user", require(__dirname + "/admin/UseradminController"));

// Các route khác như News, Category...
router.use("/admin/news", require(__dirname + "/admin/NewsController"));
router.use("/admin/category", require(__dirname + "/admin/CategoryController"));

module.exports = router;