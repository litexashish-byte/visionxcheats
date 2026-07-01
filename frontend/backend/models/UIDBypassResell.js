const mongoose = require('mongoose');

const uidBypassResellSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  
  // GTC API config
  gtcApiKey: { type: String, default: '' },
  gtcApiLink: { type: String, default: 'https://gtccheats.xyz/Api/uidbypassapi/api_user.php' },
  
  // Pricing
  resellPrice: { type: Number, required: true },
  minResellPrice: { type: Number, default: 0 },
  gtcCostPerDay: { type: Number, default: 0 }, // cost from GTC per day
  
  // Duration options
  durationOptions: [{
    days: Number,
    price: Number,
    label: String, // e.g. "7 Days", "30 Days", "Lifetime"
  }],
  
  // Features
  features: [String],
  image: { type: String, default: '' },
  
  // Stats
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  
  // UID limits
  maxUids: { type: Number, default: -1 }, // -1 = unlimited
  currentUids: { type: Number, default: 0 },
  
  createdBy: { type: String, default: 'admin' },
}, { timestamps: true });

module.exports = mongoose.models.UIDBypassResell || mongoose.model('UIDBypassResell', uidBypassResellSchema);
