const mongoose = require('mongoose');

const freePanelSchema = new mongoose.Schema({
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
  version: {
    type: String,
    required: true,
    default: '1.0.0',
  },
  category: {
    type: String,
    required: true,
    enum: ['EXTERNAL-ESP-MAX', 'EXTERNAL-ESP-BASIC', 'STREAMER-PANEL', 'AIMBOT-VISIBLE', 'UID-BYPASS', 'EMULATOR-BYPASS', 'NORMAL-PANEL', 'COVER-AIMKILL', 'AIMSILENT-COVER', 'SOURCE-CODE'],
    default: 'NORMAL-PANEL',
  },
  downloadLink: {
    type: String,
    default: '',
  },
  shortenerLink: {
    type: String,
    default: '',
  },
  keyLink: {
    type: String,
    default: '',
  },
  sellerApiLink: {
    type: String,
    default: '',
  },
  sellerAppName: {
    type: String,
    default: '',
  },
  sellerOwner: {
    type: String,
    default: '',
  },
  sellerKey: {
    type: String,
    default: '',
  },
  licenseDuration: {
    type: Number,
    default: 1,
  },
  sellerVersion: {
    type: String,
    default: '1.0',
  },
  videoLink: {
    type: String,
    default: '',
  },
  linkExpiry: {
    type: Date,
    default: null,
  },
  isLinkExpired: {
    type: Boolean,
    default: false,
  },
  downloadCount: {
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
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  tags: [String],
}, {
  timestamps: true,
});

freePanelSchema.index({ name: 'text', description: 'text', tags: 'text' });
freePanelSchema.index({ category: 1, isActive: 1 });
freePanelSchema.index({ isFeatured: 1, createdAt: -1 });

module.exports = mongoose.model('FreePanel', freePanelSchema);