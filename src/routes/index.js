const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware'); 
router.post('/add-product', upload.single('productImage'), (req, res) => {
  const imageUrl = req.file.path; 
  
  console.log("Đường dẫn ảnh WebP:", imageUrl);
  res.send('Tải ảnh thành công và đã convert sang WebP!');
});