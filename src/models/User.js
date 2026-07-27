const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // 1. Phân loại tài khoản (Chỉ nhận 1 trong 2 giá trị: buyer hoặc seller)
  role: {
    type: String,
    enum: ['buyer', 'seller'],
    default: 'buyer'
  },

  // 2. Thông tin chung 
  fullName: { 
    type: String, 
    required: true,
    trim: true
  },
  dob: { 
    type: Date, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true, 
    unique: true // Đảm bảo mỗi số điện thoại chỉ được đăng ký 1 tài khoản
  },
  password: { 
    type: String, 
    required: true 
  },

  // 3. Thông tin dành riêng cho NGƯỜI MUA
  username: { 
    type: String, 
    unique: true, 
    sparse: true // Cho phép bỏ trống nếu là tài khoản Cửa hàng, nhưng nếu đã điền thì không được trùng lặp
  },

  // 4. Thông tin dành riêng cho CỬA HÀNG
  storeName: { 
    type: String,
    trim: true
  },
  businessLicense: { 
    type: String // Sẽ lưu đường dẫn ảnh (giống như ảnh món ăn)
  },
  taxId: { 
    type: String 
  }
}, {
  timestamps: true // Tự động thêm cột ngày tạo (createdAt) và ngày cập nhật (updatedAt)
});

module.exports = mongoose.model('User', userSchema);