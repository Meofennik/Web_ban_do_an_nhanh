const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// 1. Cấu hình kết nối Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Cấu hình kho lưu trữ và tự động ép kiểu sang WebP
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'thuong_mai_dien_tu/products', // Tên thư mục sẽ tạo trên Cloudinary
    format: async (req, file) => 'webp',   // BÍ QUYẾT: Tự động convert mọi ảnh (JPG/PNG) sang WebP
    public_id: (req, file) => {
      // Đổi tên file để không bị trùng lặp
      const originalName = file.originalname.split('.')[0];
      return `${originalName}-${Date.now()}`;
    },
  },
});

// 3. Khởi tạo middleware multer
const upload = multer({ storage: storage });

module.exports = upload;