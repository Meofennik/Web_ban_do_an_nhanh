const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // 1. Món ăn nào đang bị đánh giá? (Liên kết với bảng Product)
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  // 2. Ai là người viết đánh giá này? (Liên kết với bảng User)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 3. Số sao đánh giá (Bắt buộc nhập từ 1 đến 5)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  // 4. Nội dung bình luận / Phản ánh (Có thể để trống nếu khách chỉ vote sao)
  comment: {
    type: String,
    default: ''
  },
  
  // 5. MẢNG LƯU ẢNH PHẢN ÁNH (Khách có thể up 1 hoặc nhiều ảnh)
  images: [{
    type: String // Sẽ lưu các đường link ảnh từ Cloudinary
  }]
}, {
  // Tự động sinh ra ngày giờ đánh giá (createdAt)
  timestamps: true 
});
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
module.exports = mongoose.model('Review', reviewSchema);