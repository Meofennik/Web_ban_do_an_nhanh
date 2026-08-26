const express = require('express');
const path = require('path');
require('dotenv').config(); 
const session = require('express-session');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const Cart = require('./models/Cart');
const orderRoutes = require('./routes/orderRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();
app.set('trust proxy', 1);

connectDB(); 

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(mongoSanitize()); 

app.use(express.static(path.join(__dirname, '..', 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'khoa_du_phong_foodeats_123456789', 
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } 
}));

app.use(async (req, res, next) => {
  res.locals.user = req.session ? req.session.user : null;
  res.locals.cartItemCount = 0; 

  // Full header only on homepage and search results page
  const currentUrl = req.originalUrl || req.url || '';
  res.locals.showFullHeader = (currentUrl === '/' || currentUrl === '/products' || currentUrl === '/products/' || currentUrl.startsWith('/products/search'));

  if (req.session && req.session.user) {
    try {
      const currentUserId = req.session.user._id || req.session.user.id;
      const cart = await Cart.findOne({ userId: currentUserId });
      
      if (cart && cart.items) {
        const total = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        res.locals.cartItemCount = total; 
      }
    } catch (error) {
      console.error('Lỗi đếm giỏ hàng:', error);
    }
  }
  
  next(); 
});

app.use('/products', productRoutes);
app.use('/', authRoutes);
app.use('/cart', cartRoutes);
app.use('/order', orderRoutes);
app.use('/profile', profileRoutes);

app.get('/', (req, res) => res.redirect('/products'));

app.get('/login', (req, res) => res.render('pages/login'));
app.get('/register', (req, res) => res.render('pages/register'));
app.get('/location', (req, res) => res.render('pages/location'));

const requireSeller = (req, res, next) => {
    if (!req.session || !req.session.user) return res.redirect('/login');
    if (req.session.user.role !== 'seller') return res.status(403).send('Chỉ cửa hàng mới có quyền truy cập trang này!');
    next();
};

app.get('/add-product', requireSeller, (req, res) => res.render('pages/add-product'));

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

module.exports = app;