const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
require('dotenv').config();

const app = express();

// 1. Khởi chạy kết nối Database
connectDB();

// 2. Cấu hình middleware cho file tĩnh
app.use(express.static(path.join(__dirname, '..', 'public')));

// 3. Cấu hình view engine EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 4. Route trang chủ
app.get('/', (req, res) => {
  res.redirect('/products');
});

// 5. Route thêm sản phẩm
app.get('/add-product', (req, res) => {
  res.render('pages/add-product');
});

// 6. Sử dụng route sản phẩm
app.use('/products', productRoutes);

// 7. Xuất app để server.js sử dụng
module.exports = app;