// ==========================================
// 1. IMPORTS & KHỞI TẠO
// ==========================================
const express = require('express');
const path = require('path');
require('dotenv').config();
const session = require('express-session');
const mongoSanitize = require('express-mongo-sanitize');

// Import Modules nội bộ
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const Cart = require('./models/Cart');
const orderRoutes = require('./routes/orderRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// ==========================================
// 2. KẾT NỐI CƠ SỞ DỮ LIỆU
// ==========================================
connectDB();

// ==========================================
// 3. MIDDLEWARES HỆ THỐNG & BẢO MẬT
// ==========================================
// Cho phép Express đọc dữ liệu từ Form (x-www-form-urlencoded) và JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Quét và xóa sạch mọi ký tự $ hoặc . đáng ngờ từ người dùng gửi lên để chống NoSQL Injection
app.use(mongoSanitize()); 

// Cấu hình thư mục tĩnh (public)
app.use(express.static(path.join(__dirname, '..', 'public')));

// ==========================================
// 4. CẤU HÌNH VIEW ENGINE (EJS)
// ==========================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ==========================================
// 5. CẤU HÌNH SESSION (Bắt buộc phải đứng trên Middleware tùy chỉnh)
// ==========================================
app.use(session({
  secret: 'khoa_bao_mat_foodeats_123', // Khóa bí mật để mã hóa
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // Lưu đăng nhập trong 24 giờ
}));

// ==========================================
// 6. MIDDLEWARES TÙY CHỈNH (Biến toàn cục cho EJS)
// ==========================================
app.use(async (req, res, next) => {
  // Gộp chung: Khởi tạo các giá trị mặc định cho EJS
  res.locals.user = req.session ? req.session.user : null;
  res.locals.cartItemCount = 0; 

  // Nếu người dùng đã đăng nhập, đi tìm giỏ hàng của họ
  if (req.session && req.session.user) {
    try {
      const currentUserId = req.session.user._id || req.session.user.id;
      const cart = await Cart.findOne({ userId: currentUserId });
      if (cart && cart.items) {
        // Tính tổng số lượng tất cả các món
        const total = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        res.locals.cartItemCount = total; // Gắn vào biến toàn cục
      }
    } catch (error) {
      console.error('Lỗi đếm giỏ hàng:', error);
    }
  }
  
  next(); // Bắt buộc phải có next() để chuyển sang xử lý Routes
});

// ==========================================
// 7. ROUTERS
// ==========================================
// Routes dạng API / Module
app.use('/products', productRoutes);
app.use('/', authRoutes);
app.use('/cart', cartRoutes);
app.use('/order', orderRoutes);
app.use('/profile', profileRoutes);

// Routes render các trang tĩnh
app.get('/', (req, res) => {
  res.redirect('/products');
});
app.get('/add-product', (req, res) => res.render('pages/add-product'));
app.get('/login', (req, res) => res.render('pages/login'));
app.get('/register', (req, res) => res.render('pages/register'));
app.get('/location', (req, res) => res.render('pages/location'));
app.get('/manage', (req, res) => res.render('pages/manage'));
app.get('/product-detail', (req, res) => res.render('pages/product-detail'));
app.get('/edit-product', (req, res) => res.render('pages/edit-product'));

// ==========================================
// 8. EXPORT APP CHO SERVER.JS
// ==========================================
module.exports = app;