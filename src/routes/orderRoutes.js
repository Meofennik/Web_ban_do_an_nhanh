const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart'); 
const Order = require('../models/Order'); 
const Product = require('../models/Product'); 

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
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }

    const userId = req.session.user._id || req.session.user.id;

    const { name, phone, address, deliveryNote, paymentMethod } = req.body;

    const cart = await Cart.findOne({ userId }).populate('items.productId');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).send('Giỏ hàng của bạn đang trống!');
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (item.productId) {
        const itemTotal = item.productId.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          productId: item.productId._id,
          name: item.productId.name,
          price: item.productId.price,
          quantity: item.quantity,
          imageUrl: item.productId.imageUrl,
          note: item.note || '' 
        });
      }
    }

    const newOrder = new Order({
      userId: userId,
      customerInfo: {
        name: name,
        phone: phone,
        address: address,
        deliveryNote: deliveryNote || '' 
      },
      items: orderItems,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      status: 'Pending' 
    });

    await newOrder.save();

    cart.items = [];
    await cart.save();

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



router.get('/store-orders', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.redirect('/login');
        }

        const userId = req.session.user._id || req.session.user.id;

        const myProducts = await Product.find({ ownerId: userId }).select('_id');
        const myProductIds = myProducts.map(p => p._id);

        const storeOrders = await Order.find({
            'items.productId': { $in: myProductIds }
        }).sort({ createdAt: -1 });

        res.render('pages/store-orders', { orders: storeOrders });

    } catch (error) {
        console.error('Lỗi tải trang quản lý đơn hàng:', error);
        res.status(500).send('Lỗi máy chủ');
    }
});

router.post('/update-status/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        const { action } = req.body; 

        let currentStatusCondition = '';
        let newStatus = '';

        if (action === 'accept') {
            currentStatusCondition = 'Pending';
            newStatus = 'Preparing';
        } else if (action === 'reject') {
            currentStatusCondition = 'Pending';
            newStatus = 'Cancelled';
        } else if (action === 'ship') {
            currentStatusCondition = 'Preparing';
            newStatus = 'Shipping';
        } else if (action === 'complete') {
            currentStatusCondition = 'Shipping';
            newStatus = 'Delivered';
        }

        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId, status: currentStatusCondition },
            { status: newStatus },
            { returnDocument: 'after' }
        );

        if (!updatedOrder) {
            return res.status(400).send(`
                <script>
                    alert('Thao tác thất bại! Đơn hàng này đã bị khách hủy hoặc đã được xử lý bởi thiết bị khác.');
                    window.location.href = '/order/store-orders';
                </script>
            `);
        }

        res.redirect('/order/store-orders');
    } catch (error) {
        console.error('Lỗi cập nhật trạng thái đơn:', error);
        res.status(500).send('Lỗi hệ thống');
    }
});

module.exports = router;