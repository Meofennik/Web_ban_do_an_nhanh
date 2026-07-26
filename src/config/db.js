const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Kết nối tới MongoDB bằng biến môi trường
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Đã kết nối thành công tới MongoDB Atlas!');
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error.message);
    process.exit(1); // Dừng server nếu không kết nối được DB
  }
};

module.exports = connectDB;