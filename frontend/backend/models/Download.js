const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
  panelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FreePanel',
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
  ipAddress: {
    type: String,
    default: '',
  },
  shortenerCompleted: {
    type: Boolean,
    default: false,
  },
  downloadCompleted: {
    type: Boolean,
    default: false,
  },
  shortenerLink: {
    type: String,
    default: '',
  },
  userAgent: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

downloadSchema.index({ panelId: 1, createdAt: -1 });
downloadSchema.index({ userId: 1 });
downloadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Download', downloadSchema);