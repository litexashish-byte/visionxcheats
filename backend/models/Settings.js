const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'VISION X CHEATS',
  },
  siteDescription: {
    type: String,
    default: 'Your trusted source for premium digital panels',
  },
  shortenerApiKey: {
    type: String,
    default: () => process.env.INDIAN_SHORTNER_API_KEY || process.env.SHORTENER_API_KEY || '',
  },
  shortenerApiUrl: {
    type: String,
    default: () => process.env.INDIAN_SHORTNER_API_URL || 'https://indianshortner.com/api',
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  allowRegistration: {
    type: Boolean,
    default: true,
  },
  discordLink: { type: String, default: 'https://discord.gg/visionxstore' },
  youtubeLink: { type: String, default: 'https://youtube.com/@visionxstore' },
  instagramLink: { type: String, default: 'https://instagram.com/visionxstore' },
  whatsappLink: { type: String, default: 'https://wa.me/919999999999' },
  telegramLink: { type: String, default: 'https://t.me/visionxstore' },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Settings', settingsSchema);
