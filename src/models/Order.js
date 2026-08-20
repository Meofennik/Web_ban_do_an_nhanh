const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  customerInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    deliveryNote: { type: String, default: '' }
  },

  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
      imageUrl: { type: String },
      note: { type: String, default: '' }
    }
  ],

  totalAmount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['COD', 'BANK_TRANSFER'], 
    default: 'COD' 
  },
  isPaid: { type: Boolean, default: false },

  status: { 
    type: String, 
    enum: ['Pending', 'Preparing', 'Shipping', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);