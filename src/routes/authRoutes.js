const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const upload = require('../middlewares/uploadMiddleware'); 
const rateLimit = require('express-rate-limit');

// tạo lá chắn cho đăng nhập: tối đa 5 lần thử sai trong 15 phút
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { message: 'bạn đã nhập sai quá nhiều lần. vui lòng thử lại sau 15 phút nữa!' }
});

// tạo lá chắn cho đăng ký: tối đa 3 tài khoản trong 1 giờ từ cùng 1 mạng (chống spam)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 3, 
  message: { message: 'bạn đã tạo quá nhiều tài khoản. vui lòng thử lại sau 1 giờ!' }
});

// ==========================================
// 1. xử lý đăng ký (post /register)
// ==========================================

// gắn lá chắn registerLimiter vào ngay cửa ngõ route này
router.post('/register', registerLimiter, upload.single('businessLicense'), async (req, res) => {
  try {
    // lấy toàn bộ dữ liệu từ form (đã bổ sung đầy đủ các biến bị thiếu)
    const { role, fullName, dob, phone, password, address, username, storeName, taxId } = req.body; 

    // bức tường bảo vệ ở backend (kiểm tra tính hợp lệ của dữ liệu)
    if (!phone || !password || !fullName) {
      return res.status(400).json({ message: 'vui lòng điền đầy đủ thông tin bắt buộc!' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'mật khẩu phải dài hơn 6 ký tự!' });
    }
    if (role === 'seller' && !address) {
      return res.status(400).json({ message: 'cửa hàng bắt buộc phải có địa chỉ!' });
    }

    // kiểm tra xem số điện thoại này đã có ai dùng chưa (đã khôi phục lại đoạn này)
    const existingUser = await User.findOne({ phone: phone });
    if (existingUser) {
      return res.status(400).json({ message: 'số điện thoại này đã được đăng ký! vui lòng dùng số khác.' });
    }

    // mã hóa mật khẩu để bảo vệ người dùng
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // lấy link ảnh giấy phép kinh doanh (nếu người dùng tải lên)
    let licenseUrl = '';
    if (req.file && req.file.path) {
      licenseUrl = req.file.path;
    }

    // tạo tài khoản mới, chỉ lưu những dữ liệu phù hợp với vai trò
    const newUser = new User({
      role: role,
      fullName: fullName,
      dob: dob,
      phone: phone,
      password: hashedPassword,
      
      // kỹ thuật gán giá trị: nếu đúng vai trò thì lưu, sai thì để trống
      username: role === 'buyer' ? username : undefined,
      storeName: role === 'seller' ? storeName : undefined,
      businessLicense: role === 'seller' ? licenseUrl : undefined,
      taxId: role === 'seller' ? taxId : undefined,
      address: role === 'seller' ? address : undefined
    });

    // lưu vào database
    await newUser.save();
    
    // trả về kết quả thành công cho trình duyệt
    res.status(200).json({ message: 'đăng ký thành công!' });

  } catch (error) {
    console.error('lỗi đăng ký:', error);
    res.status(500).json({ message: 'có lỗi xảy ra khi đăng ký!' });
  }
});

// ==========================================
// 2. xử lý đăng nhập (post /login)
// ==========================================

// gắn lá chắn loginLimiter vào route này để chống dò mật khẩu
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    // tìm người dùng trong database
    const user = await User.findOne({ phone: phone });
    
    if (!user) {
      // đồng bộ dùng res.json để chuẩn bị cho việc hiện toast lỗi đăng nhập
      return res.status(400).json({ message: 'số điện thoại không tồn tại!' });
    }

    // so sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'sai mật khẩu!' });
    }
    
    // lưu thông tin vào session
    // ưu tiên hiển thị: tên tài khoản -> tên quán -> họ tên thật
    const displayName = user.username || user.storeName || user.fullName;

    req.session.user = {
      id: user._id,
      name: displayName,
      role: user.role // rất quan trọng để phân quyền sau này
    };

    // trả về json báo thành công
    res.status(200).json({ message: 'đăng nhập thành công!' });
  } catch (error) {
    console.error('lỗi đăng nhập:', error);
    res.status(500).json({ message: 'lỗi hệ thống!' });
  }
});

// ==========================================
// 3. xử lý đăng xuất (get /logout)
// ==========================================
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    
    // riêng đăng xuất thì điều hướng thẳng về trang chủ là hợp lý nhất
    res.redirect('/'); 
  });
});

module.exports = router;