const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  try {
    const allProducts = await Product.find({});

    const groupedCategories = {};

    allProducts.forEach((product) => {
      if (!groupedCategories[product.category]) {
        groupedCategories[product.category] = [];
      }
      groupedCategories[product.category].push(product);
    });

    res.render('pages/index', {
      categoriesData: groupedCategories,
      customCss: '/css/home.css',
      customJs: '/js/home.js'
    });
  } catch (error) {
    console.error('Lỗi tải trang chủ:', error);
    res.status(500).send('Lỗi máy chủ');
  }
});

router.post('/add', async (req, res) => {
  try {
    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      imageUrl: req.body.imageUrl || '/images/default-product.jpg',
      category: req.body.category || 'Khác',
      description: req.body.description || ''
    });

    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error('Lỗi thêm sản phẩm:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;