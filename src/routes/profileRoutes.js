const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs'); // Dùng để kiểm tra và mã hóa mật khẩu

// Middleware kiểm tra đăng nhập (Áp dụng cho toàn bộ file này)
router.use((req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/login');
    }
    next();
});

// 1. TRANG CHỦ HỒ SƠ & LỊCH SỬ ĐẶT HÀNG
router.get('/', async (req, res) => {
    try {
        const userId = req.session.user._id || req.session.user.id;
        
        // Lấy thông tin user mới nhất
        const user = await User.findById(userId);
        
        // Lấy lịch sử đơn hàng mà người này đã MUA
        const myOrders = await Order.find({ userId: userId }).sort({ createdAt: -1 });

        res.render('pages/profile', { 
            userInfo: user, 
            orders: myOrders 
        });
    } catch (error) {
        console.error('Lỗi tải hồ sơ:', error);
        res.status(500).send('Lỗi máy chủ');
    }
});

// 2. XỬ LÝ CẬP NHẬT HỒ SƠ CHUNG
router.post('/update-info', async (req, res) => {
    try {
        const userId = req.session.user._id || req.session.user.id;
        
        // Nhận 3 trường dữ liệu từ Form EJS
        const { name, fullName, phone } = req.body;

        // Cập nhật Database
        await User.findByIdAndUpdate(userId, { 
            name: name, 
            fullName: fullName,
            phone: phone
        });
        
        // Cập nhật lại Session để góc phải màn hình đổi tên theo
        req.session.user.name = name;
        req.session.user.fullName = fullName;
        if(phone) req.session.user.phone = phone;

        res.redirect('/profile');
    } catch (error) {
        console.error('Lỗi cập nhật hồ sơ:', error);
        res.status(500).send('Lỗi cập nhật thông tin');
    }
});

// 3. XỬ LÝ ĐỔI MẬT KHẨU
router.post('/change-password', async (req, res) => {
    try {
        const userId = req.session.user._id || req.session.user.id;
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(userId);

        // Kiểm tra mật khẩu cũ
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).send('Mật khẩu cũ không chính xác!');
        }

        // Mã hóa và lưu mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.redirect('/profile');
    } catch (error) {
        res.status(500).send('Lỗi đổi mật khẩu');
    }
});

// 4. XỬ LÝ ĐĂNG XUẤT
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/profile');
        }
        res.clearCookie('connect.sid'); // Xóa cookie phiên làm việc
        res.redirect('/login');
    });
});

// 5. XỬ LÝ HỦY ĐƠN HÀNG TỪ NGƯỜI MUA
router.post('/cancel-order/:id', async (req, res) => {
    try {
        const userId = req.session.user._id || req.session.user.id;
        const orderId = req.params.id;

        // 1. Tìm đơn hàng đúng ID và phải do chính người này đặt (bảo mật chéo)
        const order = await Order.findOne({ _id: orderId, userId: userId });

        if (!order) {
            return res.status(404).send('Không tìm thấy đơn hàng hoặc bạn không có quyền!');
        }

        // 2. Chốt chốt chặn cuối cùng: Chỉ cho phép hủy nếu trạng thái vẫn là Pending
        if (order.status === 'Pending') {
            order.status = 'Cancelled'; // Chuyển trạng thái sang Đã hủy
            await order.save();
        }

        // 3. Xử lý xong thì tải lại trang
        res.redirect('/profile');
    } catch (error) {
        console.error('Lỗi khi hủy đơn hàng:', error);
        res.status(500).send('Đã xảy ra lỗi hệ thống!');
    }
});

module.exports = router;