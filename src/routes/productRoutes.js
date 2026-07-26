const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// BƯỚC 1: Gọi middleware xử lý upload ảnh 
const upload = require('../middlewares/uploadMiddleware'); 

router.get('/', async (req, res) => {
  try {
    const allProducts = await Product.find({}).sort({ createdAt: -1 });

    const groupedCategories = {
      'Cơm Văn Phòng': [],
      'Đồ Ăn Nhanh': [],
      'Trà Sữa': [],
      'Bún/Phở': [],
      'Pizza': [],
      'Món Ngon': []
    };

    allProducts.forEach((product) => {
      const category = product.category || 'Món Ngon';
      if (!groupedCategories[category]) {
        groupedCategories[category] = [];
      }
      groupedCategories[category].push(product);
    });

    res.render('pages/index', {
      categoriesData: groupedCategories,
      customCss: '/css/home.css',
      customJs: '/js/home.js'
    });
  } catch (error) {
    console.error('Lỗi tải trang chủ:', error);
    res.status(500).send('Lỗi máy chủ');
  }
});

// BƯỚC 2: Thêm upload.single('productImage') vào giữa đường dẫn và function xử lý
router.post('/add', upload.single('productImage'), async (req, res) => {
  try {
    // 1. Kiểm tra xem quá trình upload ảnh có thành công không
    let uploadedImageUrl = '/images/default-product.jpg';
    if (req.file && req.file.path) {
      uploadedImageUrl = req.file.path; // Lấy link ảnh từ Cloudinary trả về
    }

    // 2. Lưu dữ liệu vào Database
    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      imageUrl: uploadedImageUrl, // Dùng link ảnh vừa lấy được
      category: req.body.category || 'Khác',
      description: req.body.description || ''
    });

    await newProduct.save();
    
    // Đã lưu thành công! Chuyển hướng người dùng về trang chủ thay vì trả về JSON
    res.redirect('/');
    
  } catch (error) {
    console.error('Lỗi thêm sản phẩm:', error);
    res.status(500).send('Có lỗi xảy ra khi thêm sản phẩm!');
  }
});

module.exports = router;