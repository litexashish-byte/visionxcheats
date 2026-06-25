const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const licenseSchema = new mongoose.Schema({
  licenseKey: {
    type: String,
    required: true,
    unique: true,
    default: () => 'VX-' + uuidv4().toUpperCase().split('-').join('').substring(0, 16),
  },
  panelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaidPanel',
    required: true,
  },
  panelName: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  email: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  activatedAt: {
    type: Date,
    default: null,
  },
  hwid: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

licenseSchema.index({ userId: 1 });
licenseSchema.index({ panelId: 1 });
licenseSchema.index({ isActive: 1, expiresAt: 1 });

module.exports = mongoose.model('License', licenseSchema);
