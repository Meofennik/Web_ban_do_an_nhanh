const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Cấu hình kết nối Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình lưu trữ và tự động ép kiểu sang WebP
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'thuong_mai_dien_tu/products', 
    format: async (req, file) => 'webp',   
    public_id: (req, file) => {
      // FIX: Xóa ký tự đặc biệt và dấu cách để tránh lỗi URL ảnh
      const originalName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
      return `${originalName}-${Date.now()}`;
    },
  },
});

// Middleware multer có giới hạn dung lượng và loại file
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Tối đa 2MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Chỉ chấp nhận file ảnh!'), false);
        }
        cb(null, true);
    }
});

module.exports = upload;