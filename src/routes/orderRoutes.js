const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart'); 
const Order = require('../models/Order'); 

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

router.post('/create', async (req, res) => {
  try {
    // 1. Kiểm tra trạng thái đăng nhập
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const userId = req.session.user._id || req.session.user.id;

    // 2. Lấy dữ liệu từ Form (checkout.ejs) gửi lên
    const { name, phone, address, deliveryNote, paymentMethod } = req.body;

    // 3. Kéo dữ liệu Giỏ hàng của người dùng ra để xử lý
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    
    // Nếu giỏ hàng trống hoặc không tồn tại thì chặn lại
    if (!cart || cart.items.length === 0) {
      return res.status(400).send('Giỏ hàng của bạn đang trống!');
    }

    // 4. Tính toán lại Tổng tiền và định hình mảng món ăn
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (item.productId) {
        // Cộng dồn tiền (lấy giá gốc trong DB nhân với số lượng để chống hacker sửa HTML)
        const itemTotal = item.productId.price * item.quantity;
        totalAmount += itemTotal;

        // Đẩy từng món vào mảng của Order
        orderItems.push({
          productId: item.productId._id,
          name: item.productId.name,
          price: item.productId.price,
          quantity: item.quantity,
          imageUrl: item.productId.imageUrl,
          note: item.note || '' // Lấy trọn vẹn ghi chú từng món ăn
        });
      }
    }

    // 5. Khởi tạo Đơn hàng mới
    const newOrder = new Order({
      userId: userId,
      customerInfo: {
        name: name,
        phone: phone,
        address: address,
        deliveryNote: deliveryNote || '' // Ghi chú cho shipper
      },
      items: orderItems,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      status: 'Pending' // Trạng thái mặc định là "Chờ xác nhận"
    });

    // Lưu vào MongoDB
    await newOrder.save();

    // 6. Xóa sạch Giỏ hàng (Clear Cart) sau khi đã đặt hàng thành công
    cart.items = [];
    await cart.save();

    // 7. Hoàn tất & Điều hướng
    // Tạm thời hiển thị một dòng text thông báo đơn giản.
    res.send(`
        <div style="text-align: center; margin-top: 50px; font-family: sans-serif;">
            <h1 style="color: #28a745;">🎉 Đặt hàng thành công!</h1>
            <p>Cảm ơn bạn đã đặt món. Mã đơn hàng của bạn là: <strong>${newOrder._id}</strong></p>
            <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #ee4d2d; color: white; text-decoration: none; border-radius: 5px;">Quay về Trang chủ</a>
        </div>
    `);

  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    res.status(500).send('Đã xảy ra lỗi trong quá trình xử lý đơn hàng!');
  }
});


module.exports = router;