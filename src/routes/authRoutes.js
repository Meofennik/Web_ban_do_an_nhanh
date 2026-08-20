const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const upload = require('../middlewares/uploadMiddleware');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'bạn đã nhập sai quá nhiều lần. vui lòng thử lại sau 15 phút nữa!' }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { message: 'bạn đã tạo quá nhiều tài khoản. vui lòng thử lại sau 1 giờ!' }
});


router.post('/register', registerLimiter, upload.single('businessLicense'), async (req, res) => {
  try {
    const { role, fullName, dob, phone, password, address, username, storeName, taxId } = req.body;

    if (!phone || !password || !fullName) {
      return res.status(400).json({ message: 'vui lòng điền đầy đủ thông tin bắt buộc!' });
    }
    if (password.length <= 6) {
      return res.status(400).json({ message: 'mật khẩu phải dài hơn 6 ký tự!' });
    }
    if (role === 'seller' && !address) {
      return res.status(400).json({ message: 'cửa hàng bắt buộc phải có địa chỉ!' });
    }

    const existingUser = await User.findOne({ phone: phone });
    if (existingUser) {
      return res.status(400).json({ message: 'số điện thoại này đã được đăng ký! vui lòng dùng số khác.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let licenseUrl = '';
    if (req.file && req.file.path) {
      licenseUrl = req.file.path;
    }

    const newUser = new User({
      role: role,
      fullName: fullName,
      dob: dob,
      phone: phone,
      password: hashedPassword,

      username: role === 'buyer' ? username : undefined,
      storeName: role === 'seller' ? storeName : undefined,
      businessLicense: role === 'seller' ? licenseUrl : undefined,
      taxId: role === 'seller' ? taxId : undefined,
      address: role === 'seller' ? address : undefined
    });

    await newUser.save();

    res.status(200).json({ message: 'đăng ký thành công!' });

  } catch (error) {
    console.error('lỗi đăng ký:', error);
    res.status(500).json({ message: 'có lỗi xảy ra khi đăng ký!' });
  }
});


router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone: phone });

    if (!user) {
      return res.status(400).json({ message: 'số điện thoại không tồn tại!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'sai mật khẩu!' });
    }

    const displayName = user.username || user.storeName || user.fullName;

    req.session.user = {
      id: user._id,
      name: displayName,
      role: user.role // rất quan trọng để phân quyền sau này
    };

    res.status(200).json({ message: 'đăng nhập thành công!' });
  } catch (error) {
    console.error('lỗi đăng nhập:', error);
    res.status(500).json({ message: 'lỗi hệ thống!' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);

    res.redirect('/');
  });
});

module.exports = router;