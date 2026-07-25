// src/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }], // Link ảnh lưu từ Cloudinary
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);