const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const cloudinary = require('cloudinary').v2; // Đảm bảo bạn đã require cloudinary
const crypto = require('crypto');
const fs = require('fs');

// Cấu hình Multer LƯU TẠM vào thư mục gốc để băm MD5 (Thay thế uploadMiddleware cũ)
const multer = require('multer');
const uploadTemp = multer({ dest: 'uploads/' });
const upload = multer({ dest: 'uploads/' });

// ==========================================
// 1. TRANG CHÍNH /products
// ==========================================
router.get('/', async (req, res) => {
  try {
    // 1. Lấy tất cả sản phẩm đang bật bán từ Database
    const allProducts = await Product.find({ isAvailable: true }).sort({ createdAt: -1 });

    const groupedCategories = {};

    // 2. Tự động phân loại dựa trên dữ liệu THỰC TẾ
    allProducts.forEach((product) => {
      // Lấy tên danh mục của sản phẩm, nếu trống thì gán là 'Chưa phân loại'
      const categoryName = product.category || 'Chưa phân loại';

      // Nếu danh mục này chưa từng xuất hiện trong object, khởi tạo nó là 1 mảng rỗng
      if (!groupedCategories[categoryName]) {
        groupedCategories[categoryName] = [];
      }

      // Đẩy sản phẩm vào đúng mảng danh mục của nó
      groupedCategories[categoryName].push(product);
    });

    // 3. Render ra giao diện
    res.render('pages/index', {
      categoriesData: groupedCategories,
      customCss: '/css/home.css',
      customJs: '/js/home.js'
    });
  } catch (error) {
    console.error('Lỗi tải trang sản phẩm:', error);
    res.status(500).send('Lỗi tải trang sản phẩm');
  }
});

// ==========================================
// 2. GIAO DIỆN QUẢN LÝ SẢN PHẨM CỦA CỬA HÀNG
// ==========================================
router.get('/manage', async (req, res) => {
  try {
    // Chỉ lấy những món ăn do chính người này đăng
    const myProducts = await Product.find({ ownerId: req.session.user.id }).sort({ createdAt: -1 });
    res.render('pages/manage', { products: myProducts });
  } catch (error) {
    res.status(500).send('Lỗi tải trang quản lý');
  }
});
// ==========================================
// 1. GIAO DIỆN TRANG CHỈNH SỬA SẢN PHẨM (GET /products/edit/:id)
// ==========================================
router.get('/edit/:id', async (req, res) => {
  try {
    // Tìm món ăn đúng ID và bắt buộc phải do chính tài khoản này đăng
    const product = await Product.findOne({ 
      _id: req.params.id, 
      ownerId: req.session.user.id 
    });

    if (!product) {
      return res.status(403).send('Không tìm thấy sản phẩm hoặc bạn không có quyền sửa món này!');
    }

    // Mở trang chỉnh sửa và truyền dữ liệu món ăn cũ sang
    res.render('pages/edit-product', { product: product });
  } catch (error) {
    console.error('Lỗi mở trang sửa:', error);
    res.status(500).send('Lỗi máy chủ');
  }
});

// ==========================================
// 2. THÊM SẢN PHẨM (Kèm thuật toán Băm MD5 tối ưu Cloudinary)
// ==========================================
router.post('/add', uploadTemp.single('productImage'), async (req, res) => {
  try {
    let imageUrl = '/images/default-product.jpg';
    let imageHash = '';

    if (req.file) {
      // BƯỚC A: Đọc file và tạo mã Băm MD5
      const fileBuffer = fs.readFileSync(req.file.path);
      imageHash = crypto.createHash('md5').update(fileBuffer).digest('hex');

      // BƯỚC B: Tìm xem có ảnh nào trên Server trùng mã MD5 này không
      const existingProductImage = await Product.findOne({ imageHash: imageHash });

      if (existingProductImage && existingProductImage.imageUrl) {
        // NẾU TRÙNG: Lấy luôn link ảnh cũ dùng lại (Tiết kiệm bộ nhớ)
        imageUrl = existingProductImage.imageUrl;
      } else {
        // NẾU CHƯA CÓ: Bắt đầu up lên Cloudinary
        const cloudRes = await cloudinary.uploader.upload(req.file.path, {
          folder: 'FoodEats',
          quality: 'auto'
        });
        imageUrl = cloudRes.secure_url;
      }

      // BƯỚC C: Xóa file tạm trong máy chủ nội bộ cho nhẹ máy
      fs.unlinkSync(req.file.path);
    }
    const userId = req.session.user._id || req.session.user.id;
    // Lấy địa chỉ của chủ quán
    let address = 'Đang cập nhật';
    const storeOwner = await User.findById(userId);
    const currentStoreName = req.session.user.storeName || req.session.user.fullName || req.session.user.name || 'Tên cửa hàng chưa rõ';
    if (storeOwner) address = storeOwner.address;

    // Lưu vào Database
    const newProduct = new Product({
      name: req.body.name,
      storeName: currentStoreName,
      price: req.body.price,
      category: req.body.category,
      description: req.body.description || '',
      imageUrl: imageUrl,
      imageHash: imageHash,
      storeAddress: address,
      ownerId: req.session.user.id
    });

    await newProduct.save();
    res.redirect('/products/manage');
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi thêm sản phẩm!');
  }
});

// ==========================================
// 3. ẨN / HIỆN SẢN PHẨM
// ==========================================
router.post('/toggle/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, ownerId: req.session.user.id });
    if (!product) return res.status(403).send('Không có quyền!');

    product.isAvailable = !product.isAvailable; // Đảo ngược trạng thái
    await product.save();
    res.redirect('/products/manage');
  } catch (error) {
    res.status(500).send('Lỗi xử lý');
  }
});

// ==========================================
// 4. XÓA SẢN PHẨM (Kèm tiêu hủy ảnh trên Cloudinary)
// ==========================================
router.post('/delete/:id', async (req, res) => {
  try {
    // Phải kiểm tra đúng ownerId mới cho xóa
    const product = await Product.findOne({ _id: req.params.id, ownerId: req.session.user.id });
    
    if (!product) {
      return res.status(403).send('Bạn không có quyền xóa món này!');
    }

    // Nếu món ăn có link ảnh và không phải ảnh mặc định, ra lệnh xóa trên Cloud
    if (product.imageUrl && product.imageUrl.includes('cloudinary')) {
      // Tách mã ID của ảnh từ đường link URL của Cloudinary
      const urlParts = product.imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const publicId = fileName.split('.')[0]; 
      
      await cloudinary.uploader.destroy(`FoodEats/${publicId}`);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/products/manage');
  } catch (error) {
    res.status(500).send('Lỗi xóa sản phẩm');
  }
});
// ==========================================
// 2. XỬ LÝ LƯU THÔNG TIN MỚI (POST /products/edit/:id)
// ==========================================
router.post('/edit/:id', uploadTemp.single('productImage'), async (req, res) => {
  try {
    const product = await Product.findOne({ 
      _id: req.params.id, 
      ownerId: req.session.user.id 
    });

    if (!product) {
      return res.status(403).send('Bạn không có quyền sửa món này!');
    }

    // 1. Cập nhật các thông tin chữ cơ bản
    product.name = req.body.name;
    product.price = req.body.price;
    product.category = req.body.category;
    product.description = req.body.description || '';

    // 2. Xử lý nếu người dùng có tải lên ẢNH MỚI
    if (req.file) {
      // Tạo mã MD5 băm ảnh mới để kiểm tra trùng
      const fileBuffer = fs.readFileSync(req.file.path);
      const newImageHash = crypto.createHash('md5').update(fileBuffer).digest('hex');

      // Kiểm tra xem ảnh mới này đã có trên hệ thống chưa
      const existingProductImage = await Product.findOne({ imageHash: newImageHash });

      if (existingProductImage && existingProductImage.imageUrl) {
        product.imageUrl = existingProductImage.imageUrl;
        product.imageHash = newImageHash;
      } else {
        // Up ảnh mới lên Cloudinary
        const cloudRes = await cloudinary.uploader.upload(req.file.path, {
          folder: 'FoodEats',
          quality: 'auto'
        });
        product.imageUrl = cloudRes.secure_url;
        product.imageHash = newImageHash;
      }

      // Xóa file tạm
      fs.unlinkSync(req.file.path);
    }

    // 3. Lưu vào Database
    await product.save();
    res.redirect('/products/manage');

  } catch (error) {
    console.error('Lỗi cập nhật sản phẩm:', error);
    res.status(500).send('Không thể cập nhật sản phẩm!');
  }
});
// ==========================================
// 5. HIỂN THỊ TRANG CHI TIẾT & ĐÁNH GIÁ (GET /:id)
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // 1. Tìm thông tin món ăn trong Database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send('Không tìm thấy sản phẩm!');
    }

    // 2. Lấy tất cả đánh giá của món ăn này
    // Dùng .populate('userId', 'fullName') để kéo theo Họ Tên của người viết đánh giá từ bảng User
    const reviews = await Review.find({ productId: productId })
                                .populate('userId', 'fullName')
                                .sort({ createdAt: -1 }); // Sắp xếp mới nhất lên đầu

    // 3. Thuật toán tính điểm trung bình (Ví dụ: 4.5 sao)
    let totalRating = 0;
    let avgRating = 0;
    if (reviews.length > 0) {
      reviews.forEach(review => { 
        totalRating += review.rating; 
      });
      avgRating = (totalRating / reviews.length).toFixed(1); // Làm tròn 1 chữ số thập phân
    }

    // 4. Đóng gói dữ liệu và gửi sang file giao diện product-detail.ejs
    res.render('pages/product-detail', { 
      product: product, 
      reviews: reviews, 
      avgRating: avgRating, 
      totalReviews: reviews.length 
    });
  } catch (error) {
    console.error('Lỗi tải trang chi tiết:', error);
    res.status(500).send('Lỗi hệ thống khi tải trang chi tiết sản phẩm');
  }
});

// ==========================================
// 6. XỬ LÝ GỬI ĐÁNH GIÁ KÈM ẢNH (POST /:id/review)
// ==========================================
router.post('/:id/review', upload.array('reviewImages', 5), async (req, res) => {
  try {
    // Chặn ngay lập tức nếu chưa đăng nhập
    if (!req.session || !req.session.user) {
      return res.status(401).send('Bạn cần đăng nhập để đánh giá món ăn này!');
    }

    const productId = req.params.id;
    const { rating, comment } = req.body;

    // Lọc mảng các đường link ảnh đã được đẩy lên Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      // req.files là một mảng, ta dùng hàm map() để nhặt ra đúng đường link (path) của từng ảnh
      imageUrls = req.files.map(file => file.path); 
    }

    // Tạo bản ghi Đánh giá mới
    const newReview = new Review({
      productId: productId,
      userId: req.session.user.id, // Lưu ID của khách hàng đang đăng nhập
      rating: Number(rating),
      comment: comment,
      images: imageUrls
    });

    // Lưu vào Database
    await newReview.save();

    // Lưu xong thì tự động load lại đúng trang chi tiết của món ăn đó để khách thấy bình luận của mình
    res.redirect(`/products/${productId}`);

  } catch (error) {
    console.error('Lỗi gửi đánh giá:', error);
    res.status(500).send('Có lỗi xảy ra khi gửi đánh giá của bạn!');
  }
});

module.exports = router;