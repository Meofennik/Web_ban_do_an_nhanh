const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để thực hiện!' });
  }
  next();
};

router.post('/add', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user._id || req.session.user.id;
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity) || 1;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ productId, quantity: qty }]
      });
    } else {
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += qty;
      } else {
        cart.items.push({ productId, quantity: qty });
      }
    }

    await cart.save();

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({ success: true, message: 'Đã thêm vào giỏ hàng!', totalItems });
  } catch (error) {
    console.error('Lỗi thêm giỏ hàng:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi thêm giỏ hàng!' });
  }
});

router.get('/', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const cart = await Cart.findOne({ userId: req.session.user.id }).populate('items.productId');

    res.render('pages/cart', { cart: cart || { items: [] } });
  } catch (error) {
    console.error('Lỗi tải giỏ hàng:', error);
    res.status(500).send('Lỗi máy chủ khi tải giỏ hàng');
  }
});

router.post('/update', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user._id || req.session.user.id;
    const { productId, quantity } = req.body;
    let qty = parseInt(quantity);

    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > 999) qty = 999;

    const cart = await Cart.findOne({ userId });
    if (cart) {
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = qty;
        await cart.save();
      }
    }

    res.json({ success: true, message: 'Đã cập nhật số lượng!' });
  } catch (error) {
    console.error('Lỗi cập nhật giỏ hàng:', error);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật giỏ hàng!' });
  }
});

router.post('/remove', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user._id || req.session.user.id;
    const { productId } = req.body;

    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
      await cart.save();
    }

    res.json({ success: true, message: 'Đã xóa món khỏi giỏ hàng!' });
  } catch (error) {
    console.error('Lỗi xóa sản phẩm khỏi giỏ:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa sản phẩm!' });
  }
});

router.post('/update-note', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
    }

    const { productId, note } = req.body;
    const userId = req.session.user._id || req.session.user.id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giỏ hàng' });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].note = note;
      await cart.save();
      return res.json({ success: true, message: 'Đã cập nhật ghi chú' });
    } else {
      return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn trong giỏ' });
    }
  } catch (error) {
    console.error('Lỗi cập nhật ghi chú giỏ hàng:', error);
    res.status(500).json({ success: false, message: 'Đã xảy ra lỗi' });
  }
});

module.exports = router;