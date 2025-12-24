// 1. Bản mới BẮT BUỘC dùng .v2
const cloudinary = require('cloudinary').v2; 

// 2. Bản mới BẮT BUỘC có dấu ngoặc nhọn { }
const { CloudinaryStorage } = require('multer-storage-cloudinary'); 
const multer = require('multer');

const config = require(global.__basedir + "/src/configs/Setting.json");

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'news_images',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    // Lưu ý: bản mới dùng hàm filename (hoặc public_id tùy version, nhưng format dưới đây là chuẩn v4)
    public_id: (req, file) => {
        // Trả về tên file mong muốn (không bao gồm đuôi file)
        return Date.now() + '-' + file.originalname.split('.')[0];
    }
  },
});

const upload = multer({ storage: storage });

module.exports = upload;