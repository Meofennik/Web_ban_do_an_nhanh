const express = require('express');
const path = require('path');
const connectDB = require('./config/db'); // Đường dẫn tới file kết nối MongoDB
require('dotenv').config();

const app = express();

// 1. Khởi chạy kết nối Database
connectDB();

// 2. Cấu hình middleware (File tĩnh)
// (Lưu ý: Nếu folder public nằm cùng cấp với app.js thì sửa thành path.join(__dirname, 'public'))
app.use(express.static(path.join(__dirname, '..', 'public')));

// 3. Cấu hình view engine EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 4. Route trang chủ
app.get('/', (req, res) => {
  res.render('pages/index');
});

// 5. QUAN TRỌNG NHẤT: Bắt buộc xuất biến app ra để server.js có thể sử dụng
module.exports = app;