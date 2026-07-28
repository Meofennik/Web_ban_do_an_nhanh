const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();
const session = require('express-session');
const app = express();

const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const mongoSanitize = require('express-mongo-sanitize');

// 1. Khởi chạy kết nối Database
connectDB();
// Cho phép Express đọc dữ liệu từ Form (x-www-form-urlencoded) và JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(mongoSanitize()); // Nó sẽ quét và xóa sạch mọi ký tự $ hoặc . đáng ngờ từ người dùng gửi lên
// 2. Cấu hình middleware cho file tĩnh
app.use(express.static(path.join(__dirname, '..', 'public')));

// 3. Cấu hình view engine EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: 'khoa_bao_mat_foodeats_123', // Khóa bí mật để mã hóa (bạn có thể đổi tùy ý)
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // Lưu đăng nhập trong 24 giờ
}));

// 4. Route trang chủ
app.get('/', (req, res) => {
  res.redirect('/products');
});

// 5. Route thêm sản phẩm
app.get('/add-product', (req, res) => {
  res.render('pages/add-product');
});

app.get('/login', (req, res) => {
  res.render('pages/login');
});

app.get('/register', (req, res) => {
  res.render('pages/register');
});

// 6. Route chọn địa điểm
app.get('/location', (req, res) => {
  res.render('pages/location');
});

app.get('/manage', (req, res) => {
  res.render('pages/manage');
});

app.get('/product-detail', (req, res) => {
  res.render('pages/product-detail');
});

app.get('/edit-product', (req, res) => {
  res.render('pages/edit-product');
});

app.use((req, res, next) => {
  res.locals.user = req.session.user || null; 
  next();
});

// 7. Sử dụng route sản phẩm
app.use('/products', productRoutes);
app.use('/', authRoutes);

// 7. Xuất app để server.js sử dụng
module.exports = app;