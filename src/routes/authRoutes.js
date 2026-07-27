const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const upload = require('../middlewares/uploadMiddleware'); 
// ==========================================
// 1. XỬ LÝ ĐĂNG KÝ (POST /register)
// Dùng upload.single('businessLicense') để đón file ảnh giấy phép nếu có
// ==========================================
router.post('/register', upload.single('businessLicense'), async (req, res) => {
  try {
    // Rút gọn các thông tin gửi lên từ Form
    const { role, fullName, dob, phone, password, username, storeName, taxId } = req.body;

    // 1. Kiểm tra xem số điện thoại này đã có ai dùng chưa
    const existingUser = await User.findOne({ phone: phone });
    if (existingUser) {
      return res.status(400).send('Số điện thoại này đã được đăng ký! Vui lòng dùng số khác.');
    }

    // 2. Mã hóa mật khẩu siêu bảo mật
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Lấy link ảnh Giấy phép kinh doanh (nếu người dùng tải lên)
    let licenseUrl = '';
    if (req.file && req.file.path) {
      licenseUrl = req.file.path;
    }

    // 4. Tạo tài khoản mới, chỉ lưu những dữ liệu phù hợp với vai trò
    const newUser = new User({
      role: role,
      fullName: fullName,
      dob: dob,
      phone: phone,
      password: hashedPassword, // Lưu mật khẩu ĐÃ BỊ MÃ HÓA
      
      // Kỹ thuật gán giá trị: Nếu đúng vai trò thì lưu, sai thì để trống
      username: role === 'buyer' ? username : undefined,
      storeName: role === 'seller' ? storeName : undefined,
      businessLicense: role === 'seller' ? licenseUrl : undefined,
      taxId: role === 'seller' ? taxId : undefined
    });

    // 5. Lưu vào Database
    await newUser.save();
    
    // Thành công! Đẩy người dùng sang trang đăng nhập để họ đăng nhập thử
    res.redirect('/login');

  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).send('Có lỗi xảy ra khi đăng ký!');
  }
});

// ==========================================
// 2. XỬ LÝ ĐĂNG NHẬP (POST /login)
// ==========================================

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone: phone });
    
    if (!user) {
      return res.status(400).send('Số điện thoại không tồn tại!');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Sai mật khẩu!');
    }

    // Lưu thông tin vào Session
    // Ưu tiên hiển thị: Tên tài khoản -> Tên quán -> Họ tên thật
    const displayName = user.username || user.storeName || user.fullName;

    req.session.user = {
      id: user._id,
      name: displayName,
      role: user.role // Quan trọng để phân quyền
    };

    res.redirect('/');
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).send('Lỗi hệ thống!');
  }
});

// ROUTE ĐĂNG XUẤT 
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect('/'); // Xóa session xong thì đẩy về trang chủ
  });
});

module.exports = router;