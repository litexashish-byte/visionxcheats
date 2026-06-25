const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const resellerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  gtcApiKey: { type: String, required: true },
  uidLimit: { type: Number, default: 10 },
  uidUsed: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  allowedKeyTypes: [{ type: String, enum: ['daily', 'weekly', 'fifteen_day', 'monthly'] }],
  totalEarnings: { type: Number, default: 0 },
  lastActive: { type: Date },
}, { timestamps: true });

resellerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

resellerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Reseller', resellerSchema);
