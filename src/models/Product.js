const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  storeName: { 
    type: String, default: 'Không có thông tin cửa hàng'
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  category: {
    type: String,
    required: true
  },

  imageUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  storeAddress: {
    type: String,
    default: 'Địa chỉ chưa cập nhật' // Giá trị mặc định đề phòng bị trống
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Liên kết với bảng User
    required: true // Bắt buộc phải có chủ
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  // Mã băm chông trùng lặp ảnh
  imageHash: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});
module.exports = mongoose.model('Product', productSchema);