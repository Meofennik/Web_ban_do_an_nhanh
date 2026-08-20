const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs'); 

router.use((req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/login');
    }
    next();
});

router.get('/', async (req, res) => {
    try {
        const userId = req.session.user._id || req.session.user.id;
        
        const user = await User.findById(userId);
        
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

router.post('/update-info', async (req, res) => {
    try {
        const userId = req.session.user._id || req.session.user.id;
        
        const { name, fullName, phone } = req.body;

        await User.findByIdAndUpdate(userId, { 
            name: name, 
            fullName: fullName,
            phone: phone
        });
        
        req.session.user.name = name;
        req.session.user.fullName = fullName;
        if(phone) req.session.user.phone = phone;

        res.redirect('/profile');
    } catch (error) {
        console.error('Lỗi cập nhật hồ sơ:', error);
        res.status(500).send('Lỗi cập nhật thông tin');
    }
});

router.post('/change-password', async (req, res) => {
    try {
        const userId = req.session.user._id || req.session.user.id;
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(userId);

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).send('Mật khẩu cũ không chính xác!');
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.redirect('/profile');
    } catch (error) {
        res.status(500).send('Lỗi đổi mật khẩu');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/profile');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

router.post('/cancel-order/:id', async (req, res) => {
    try {
        const userId = req.session.user._id || req.session.user.id;
        const orderId = req.params.id;

        const order = await Order.findOne({ _id: orderId, userId: userId });

        if (!order) {
            return res.status(404).send('Không tìm thấy đơn hàng hoặc bạn không có quyền!');
        }

        if (order.status === 'Pending') {
            order.status = 'Cancelled';
            await order.save();
        }

        res.redirect('/profile');
    } catch (error) {
        console.error('Lỗi khi hủy đơn hàng:', error);
        res.status(500).send('Đã xảy ra lỗi hệ thống!');
    }
});

module.exports = router;