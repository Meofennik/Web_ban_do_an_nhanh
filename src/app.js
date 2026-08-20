// ==========================================
// 1. IMPORTS & KHỞI TẠO CƠ BẢN
// ==========================================
const express = require('express');
const path = require('path');
require('dotenv').config(); // Gọi 1 lần duy nhất ở đây, dùng cho toàn bộ dự án
const session = require('express-session');
const mongoSanitize = require('express-mongo-sanitize');

// Import Modules nội bộ (Database & Routes)
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const Cart = require('./models/Cart');
const orderRoutes = require('./routes/orderRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// ==========================================
// 2. KẾT NỐI DATABASE
// ==========================================
connectDB(); // Gọi hàm kết nối tới MongoDB Atlas

// ==========================================
// 3. MIDDLEWARES BẢO MẬT & XỬ LÝ DỮ LIỆU
// ==========================================
// Cho phép Express đọc dữ liệu từ Form (x-www-form-urlencoded) và dạng JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Quét và xóa sạch mọi ký tự $ hoặc . đáng ngờ từ người dùng gửi lên để chống NoSQL Injection
app.use(mongoSanitize()); 

// Khai báo thư mục chứa file tĩnh (CSS, JS, Images, Videos)
app.use(express.static(path.join(__dirname, '..', 'public')));

// ==========================================
// 4. CẤU HÌNH GIAO DIỆN (VIEW ENGINE)
// ==========================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ==========================================
// 5. CẤU HÌNH SESSION (PHIÊN ĐĂNG NHẬP)
// ==========================================
// FIX: Dùng biến môi trường cho Secret Key để bảo mật tuyệt đối
app.use(session({
  secret: process.env.SESSION_SECRET || 'khoa_du_phong_foodeats_123456789', 
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // Phiên đăng nhập tồn tại trong 24 giờ
}));

// ==========================================
// 6. MIDDLEWARE TOÀN CỤC (DỮ LIỆU CHO HEADER/EJS)
// ==========================================
app.use(async (req, res, next) => {
  // Khởi tạo các giá trị mặc định cho EJS để không bị lỗi undefined
  res.locals.user = req.session ? req.session.user : null;
  res.locals.cartItemCount = 0; 

  // Nếu người dùng đã đăng nhập, tính toán số lượng món ăn trong giỏ hàng
  if (req.session && req.session.user) {
    try {
      const currentUserId = req.session.user._id || req.session.user.id;
      const cart = await Cart.findOne({ userId: currentUserId });
      
      if (cart && cart.items) {
        // Cộng dồn tổng số lượng món ăn
        const total = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        res.locals.cartItemCount = total; 
      }
    } catch (error) {
      console.error('Lỗi đếm giỏ hàng:', error);
    }
  }
  
  next(); // Bắt buộc phải có next() để Express đi tiếp xuống các Router bên dưới
});

// ==========================================
// 7. ĐỊNH TUYẾN CHÍNH (ROUTERS TỪ THƯ MỤC ROUTES)
// ==========================================
app.use('/products', productRoutes);
app.use('/', authRoutes);
app.use('/cart', cartRoutes);
app.use('/order', orderRoutes);
app.use('/profile', profileRoutes);

// ==========================================
// 8. ĐỊNH TUYẾN TRANG TĨNH & PHÂN QUYỀN ĐƠN LẺ
// ==========================================
// Điều hướng mặc định khi vào tên miền gốc
app.get('/', (req, res) => res.redirect('/products'));

// Các trang không cần kiểm tra quyền
app.get('/login', (req, res) => res.render('pages/login'));
app.get('/register', (req, res) => res.render('pages/register'));
app.get('/location', (req, res) => res.render('pages/location'));

// Middleware tạo khiên bảo vệ cho chức năng Cửa hàng
const requireSeller = (req, res, next) => {
    if (!req.session || !req.session.user) return res.redirect('/login');
    if (req.session.user.role !== 'seller') return res.status(403).send('Chỉ cửa hàng mới có quyền truy cập trang này!');
    next();
};

// Trang thêm sản phẩm bắt buộc phải có khiên bảo vệ requireSeller
app.get('/add-product', requireSeller, (req, res) => res.render('pages/add-product'));

// ==========================================
// 9. LƯỚI HỨNG LỖI 404 (SAI ĐƯỜNG DẪN URL)
// ==========================================
// Bắt buộc phải để ở cuối cùng, khi không có route nào ở trên khớp với URL của khách
app.use((req, res, next) => {
    res.status(404).send(`
      <div style="text-align: center; margin-top: 100px; font-family: sans-serif;">
        <h1 style="font-size: 50px; margin-bottom: 10px;">404</h1>
        <h2 style="color: #555;">Ối! Lạc đường rồi 🛑</h2>
        <p style="color: #777; margin-bottom: 20px;">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.</p>
        <a href="/" style="padding: 12px 24px; background: #ee4d2d; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Quay về Trang chủ</a>
      </div>
    `);
});

// ==========================================
// 10. XUẤT MODULE
// ==========================================
module.exports = app;