const mongoose = require('mongoose');

const resellComboSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  
  // Products included in this combo
  products: [{
    productId: { type: String, required: true },
    productName: String,
    licenseType: { type: String, default: 'standard' },
  }],
  
  // Pricing
  originalPrice: { type: Number, default: 0 },
  comboPrice: { type: Number, required: true },
  minResellPrice: { type: Number, default: 0 },
  discount: { type: Number, default: 0 }, // percentage
  
  // Stats
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  
  // Display
  image: { type: String, default: '' },
  badge: { type: String, default: '' }, // e.g. "BEST VALUE"
  features: [String],
  
  createdBy: { type: String, default: 'admin' },
}, { timestamps: true });

module.exports = mongoose.models.ResellCombo || mongoose.model('ResellCombo', resellComboSchema);
