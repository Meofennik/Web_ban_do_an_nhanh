const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware'); 
// Route xử lý việc Admin thêm món ăn mới
// 'productImage' chính là thuộc tính name="productImage" trong thẻ <input type="file"> ở form HTML
router.post('/add-product', upload.single('productImage'), (req, res) => {
  const imageUrl = req.file.path; 
  
  console.log("Đường dẫn ảnh WebP:", imageUrl);

  // Tại đây, bạn sẽ code tiếp phần lưu thông tin món ăn (Tên, Giá, imageUrl) vào Database (MongoDB)
  
  res.send('Tải ảnh thành công và đã convert sang WebP!');
});