const mongoose = require('mongoose');

const resellProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['free', 'paid'], default: 'paid' },
  
  // Pricing
  originalPrice: { type: Number, default: 0 },
  resellPrice: { type: Number, required: true },
  minResellPrice: { type: Number, default: 0 },
  
  // KeyAuth config for this resell product
  keyauthAppName: { type: String, default: '' },
  keyauthOwner: { type: String, default: '' },
  keyauthSecret: { type: String, default: '' },
  keyauthApiLink: { type: String, default: '' },
  
  // License settings
  licenseDuration: { type: Number, default: 30 }, // days
  licenseTypes: [{
    name: String,
    duration: Number, // days
    price: Number
  }],
  
  // Features
  features: [String],
  image: { type: String, default: '' },
  
  // Stats
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  
  // Which panel this resell product links to
  linkedPanelId: { type: String, default: '' },
  linkedPanelType: { type: String, enum: ['free', 'paid', ''], default: '' },
  
  createdBy: { type: String, default: 'admin' },
}, { timestamps: true });

module.exports = mongoose.models.ResellProduct || mongoose.model('ResellProduct', resellProductSchema);
