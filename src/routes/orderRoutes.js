const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart'); // Cần gọi Model Cart để lấy thông tin giỏ
// const Order = require('../models/Order'); // Tí nữa mình sẽ bật cái này lên sau

// GET: Hiển thị trang Thanh toán (Đường dẫn thực tế sẽ là /order/checkout)
router.get('/checkout', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const userId = req.session.user._id || req.session.user.id;
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return res.redirect('/cart');
    }

    res.render('pages/checkout', { 
      cart: cart,
      user: req.session.user 
    });

  } catch (error) {
    console.error('Lỗi khi mở trang thanh toán:', error);
    res.status(500).send('Đã xảy ra lỗi!');
  }
});

module.exports = router;