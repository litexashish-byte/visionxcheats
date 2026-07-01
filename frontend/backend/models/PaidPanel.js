const mongoose = require('mongoose');

const paidPanelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Panel name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  image: {
    type: String,
    required: [true, 'Panel image is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  originalPrice: {
    type: Number,
    default: null,
  },
  features: [{
    type: String,
    required: true,
  }],
  category: {
    type: String,
    required: true,
    enum: ['EXTERNAL-ESP-MAX', 'EXTERNAL-ESP-BASIC', 'STREAMER-PANEL', 'AIMBOT-VISIBLE', 'UID-BYPASS', 'EMULATOR-BYPASS', 'NORMAL-PANEL', 'COVER-AIMKILL', 'AIMSILENT-COVER', 'SOURCE-CODE'],
    default: 'NORMAL-PANEL',
  },
  contactDiscord: {
    type: String,
    default: '',
  },
  contactTelegram: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  salesCount: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  tags: [String],
}, {
  timestamps: true,
});

paidPanelSchema.index({ name: 'text', description: 'text', tags: 'text' });
paidPanelSchema.index({ category: 1, isActive: 1 });
paidPanelSchema.index({ isFeatured: 1, createdAt: -1 });

module.exports = mongoose.model('PaidPanel', paidPanelSchema);