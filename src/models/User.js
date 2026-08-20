const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['buyer', 'seller'],
    default: 'buyer'
  },

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
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },

  username: { 
    type: String, 
    unique: true, 
    sparse: true 
  },

  storeName: { 
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },

  businessLicense: { 
    type: String 
  },
  taxId: { 
    type: String 
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);