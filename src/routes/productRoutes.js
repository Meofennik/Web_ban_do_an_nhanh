const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const cloudinary = require('cloudinary').v2; 
const crypto = require('crypto');
const fs = require('fs');

// FIX: Lấy middleware Cloudinary đã viết sẵn để dùng cho chức năng Đánh giá
const upload = require('../middlewares/uploadMiddleware'); 

// FIX: Giới hạn dung lượng thư mục tạm (Chống tràn ổ cứng)
const multer = require('multer');
const uploadTemp = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 2 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    cb(null, true);
  }
});

// Middleware bảo vệ các route của Cửa hàng
const requireSeller = (req, res, next) => {
    if (!req.session || !req.session.user) return res.redirect('/login');
    if (req.session.user.role !== 'seller') return res.status(403).send('Chỉ cửa hàng mới có quyền!');
    next();
};

// ==========================================
// 1. TRANG CHỦ SẢN PHẨM (Public)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const allProducts = await Product.find({ isAvailable: true }).sort({ createdAt: -1 });
    const groupedCategories = {};

    allProducts.forEach((product) => {
      const categoryName = product.category || 'Chưa phân loại';
      if (!groupedCategories[categoryName]) groupedCategories[categoryName] = [];
      groupedCategories[categoryName].push(product);
    });

    res.render('pages/index', {
      categoriesData: groupedCategories,
      customCss: '/css/home.css',
      customJs: '/js/home.js'
    });
  } catch (error) {
    res.status(500).send('Lỗi tải trang sản phẩm');
  }
});

// ==========================================
// 2. QUẢN LÝ SẢN PHẨM (Chỉ Cửa Hàng)
// FIX: Thêm requireSeller
// ==========================================
router.get('/manage', requireSeller, async (req, res) => {
  try {
    const myProducts = await Product.find({ ownerId: req.session.user.id }).sort({ createdAt: -1 });
    res.render('pages/manage', { products: myProducts });
  } catch (error) {
    res.status(500).send('Lỗi tải trang quản lý');
  }
});

// ==========================================
// 3. GIAO DIỆN SỬA SẢN PHẨM (Chỉ Cửa Hàng)
// FIX: Thêm requireSeller
// ==========================================
router.get('/edit/:id', requireSeller, async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, ownerId: req.session.user.id });
    if (!product) return res.status(403).send('Không tìm thấy sản phẩm!');
    
    res.render('pages/edit-product', { product: product });
  } catch (error) {
    res.status(500).send('Lỗi máy chủ');
  }
});

// ==========================================
// 4. THÊM MỚI SẢN PHẨM (Chỉ Cửa Hàng)
// FIX: Thêm requireSeller
// ==========================================
router.post('/add', requireSeller, uploadTemp.single('productImage'), async (req, res) => {
  try {
    let imageUrl = '/images/default-product.jpg';
    let imageHash = '';

    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      imageHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
      const existingProductImage = await Product.findOne({ imageHash: imageHash });

      if (existingProductImage && existingProductImage.imageUrl) {
        imageUrl = existingProductImage.imageUrl; // Tái sử dụng ảnh
      } else {
        const cloudRes = await cloudinary.uploader.upload(req.file.path, { folder: 'FoodEats', quality: 'auto' });
        imageUrl = cloudRes.secure_url;
      }
      fs.unlinkSync(req.file.path); // Xóa file tạm
    }

    const userId = req.session.user._id || req.session.user.id;
    const storeOwner = await User.findById(userId);
    const currentStoreName = req.session.user.storeName || req.session.user.fullName || req.session.user.name || 'Tên cửa hàng chưa rõ';

    const newProduct = new Product({
      name: req.body.name,
      storeName: currentStoreName,
      price: req.body.price,
      category: req.body.category,
      description: req.body.description || '',
      imageUrl: imageUrl,
      imageHash: imageHash,
      storeAddress: storeOwner ? storeOwner.address : 'Đang cập nhật',
      ownerId: req.session.user.id
    });

    await newProduct.save();
    res.redirect('/products/manage');
  } catch (error) {
    res.status(500).send('Lỗi thêm sản phẩm!');
  }
});

// ==========================================
// 5. ẨN/HIỆN & XÓA SẢN PHẨM (Chỉ Cửa Hàng)
// FIX: Thêm requireSeller
// ==========================================
router.post('/toggle/:id', requireSeller, async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, ownerId: req.session.user.id });
    if (!product) return res.status(403).send('Không có quyền!');

    product.isAvailable = !product.isAvailable;
    await product.save();
    res.redirect('/products/manage');
  } catch (error) {
    res.status(500).send('Lỗi xử lý');
  }
});

router.post('/delete/:id', requireSeller, async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, ownerId: req.session.user.id });
    if (!product) return res.status(403).send('Bạn không có quyền xóa món này!');

    // Xóa ảnh trên Cloudinary nếu có
    if (product.imageUrl && product.imageUrl.includes('cloudinary')) {
      const urlParts = product.imageUrl.split('/');
      const publicId = urlParts[urlParts.length - 1].split('.')[0]; 
      await cloudinary.uploader.destroy(`FoodEats/${publicId}`);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/products/manage');
  } catch (error) {
    res.status(500).send('Lỗi xóa sản phẩm');
  }
});

// ==========================================
// 6. LƯU CHỈNH SỬA SẢN PHẨM (Chỉ Cửa Hàng)
// FIX: Thêm requireSeller
// ==========================================
router.post('/edit/:id', requireSeller, uploadTemp.single('productImage'), async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, ownerId: req.session.user.id });
    if (!product) return res.status(403).send('Bạn không có quyền sửa món này!');

    product.name = req.body.name;
    product.price = req.body.price;
    product.category = req.body.category;
    product.description = req.body.description || '';

    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      const newImageHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
      const existingProductImage = await Product.findOne({ imageHash: newImageHash });

      if (existingProductImage && existingProductImage.imageUrl) {
        product.imageUrl = existingProductImage.imageUrl;
        product.imageHash = newImageHash;
      } else {
        const cloudRes = await cloudinary.uploader.upload(req.file.path, { folder: 'FoodEats', quality: 'auto' });
        product.imageUrl = cloudRes.secure_url;
        product.imageHash = newImageHash;
      }
      fs.unlinkSync(req.file.path);
    }

    await product.save();
    res.redirect('/products/manage');
  } catch (error) {
    res.status(500).send('Không thể cập nhật sản phẩm!');
  }
});

// ==========================================
// 7. TRANG CHI TIẾT SẢN PHẨM (Public)
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send('Không tìm thấy sản phẩm!');

    const reviews = await Review.find({ productId: req.params.id })
                                .populate('userId', 'fullName')
                                .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
      : 0;

    res.render('pages/product-detail', { 
      product: product, 
      reviews: reviews, 
      avgRating: avgRating, 
      totalReviews: reviews.length 
    });
  } catch (error) {
    res.status(500).send('Lỗi hệ thống khi tải trang chi tiết sản phẩm');
  }
});

// ==========================================
// 8. ĐÁNH GIÁ SẢN PHẨM (Chỉ User đăng nhập)
// FIX: Sử dụng uploadMiddleware để tải ảnh lên Cloud
// ==========================================
router.post('/:id/review', upload.array('reviewImages', 5), async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).send('Bạn cần đăng nhập để đánh giá món ăn này!');
    }

    // Nhặt ra đường link ảnh trên Cloudinary thay vì lấy đường dẫn ảo
    const imageUrls = req.files && req.files.length > 0 
      ? req.files.map(file => file.path) 
      : [];

    const newReview = new Review({
      productId: req.params.id,
      userId: req.session.user.id,
      rating: Number(req.body.rating),
      comment: req.body.comment,
      images: imageUrls
    });

    await newReview.save();
    res.redirect(`/products/${req.params.id}`);
  } catch (error) {
    res.status(500).send('Có lỗi xảy ra khi gửi đánh giá của bạn!');
  }
});

module.exports = router;