const mongoose = require('mongoose');

const uidSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  resellerId: { type: String, required: true },
  resellerName: { type: String, default: '' },
  duration: { type: String, default: 'daily' },
  status: { type: String, enum: ['active', 'expired', 'banned'], default: 'active' },
  licenseKey: { type: String, default: '' },
  expiresAt: { type: Date },
  bannedAt: { type: Date },
  banReason: { type: String, default: '' },
}, { timestamps: true });

uidSchema.index({ uid: 1, resellerId: 1 });

module.exports = mongoose.model('UID', uidSchema);
