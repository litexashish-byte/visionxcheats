const express = require('express');
const router = express.Router();

// Helper to get reseller from demoDB or MongoDB
async function getResellers(req) {
  if (req.isDemoMode) return req.demoDB.resellers || [];
  const Reseller = require('../models/Reseller');
  return Reseller.find().select('-password').sort({ createdAt: -1 });
}

// @route   GET /api/admin/resellers
router.get('/', async (req, res) => {
  try {
    const resellers = await getResellers(req);
    res.json({ success: true, data: resellers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/resellers
router.post('/', async (req, res) => {
  try {
    const { name, email, password, gtcApiKey, uidLimit } = req.body;
    if (!name || !email || !password || !gtcApiKey) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and GTC API key required' });
    }

    if (req.isDemoMode) {
      const exists = (req.demoDB.resellers || []).find(r => r.email === email);
      if (exists) return res.status(400).json({ success: false, message: 'Email already exists' });

      const newReseller = {
        _id: 'reseller-' + Date.now(),
        name, email, password, gtcApiKey,
        uidLimit: uidLimit || 10,
        uidUsed: 0,
        isActive: true,
        allowedKeyTypes: ['daily', 'weekly', 'fifteen_day', 'monthly'],
        totalEarnings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      req.demoDB.resellers = req.demoDB.resellers || [];
      req.demoDB.resellers.push(newReseller);
      const { password: _, ...safe } = newReseller;
      return res.json({ success: true, data: safe, message: 'Reseller created' });
    }

    const Reseller = require('../models/Reseller');
    const exists = await Reseller.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already exists' });

    const reseller = await Reseller.create({ name, email, password, gtcApiKey, uidLimit: uidLimit || 10, allowedKeyTypes: ['daily', 'weekly', 'fifteen_day', 'monthly'] });
    const { password: _, ...safe } = reseller.toObject();
    res.json({ success: true, data: safe, message: 'Reseller created' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// @route   PUT /api/admin/resellers/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, email, gtcApiKey, uidLimit, uidUsed, isActive, allowedKeyTypes } = req.body;

    if (req.isDemoMode) {
      const idx = (req.demoDB.resellers || []).findIndex(r => r._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Reseller not found' });
      const r = req.demoDB.resellers[idx];
      if (name !== undefined) r.name = name;
      if (email !== undefined) r.email = email;
      if (gtcApiKey !== undefined) r.gtcApiKey = gtcApiKey;
      if (uidLimit !== undefined) r.uidLimit = uidLimit;
      if (uidUsed !== undefined) r.uidUsed = uidUsed;
      if (isActive !== undefined) r.isActive = isActive;
      if (allowedKeyTypes !== undefined) r.allowedKeyTypes = allowedKeyTypes;
      r.updatedAt = new Date();
      const { password: _, ...safe } = r;
      return res.json({ success: true, data: safe, message: 'Reseller updated' });
    }

    const Reseller = require('../models/Reseller');
    const update = {};
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (gtcApiKey !== undefined) update.gtcApiKey = gtcApiKey;
    if (uidLimit !== undefined) update.uidLimit = uidLimit;
    if (uidUsed !== undefined) update.uidUsed = uidUsed;
    if (isActive !== undefined) update.isActive = isActive;
    if (allowedKeyTypes !== undefined) update.allowedKeyTypes = allowedKeyTypes;

    const reseller = await Reseller.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!reseller) return res.status(404).json({ success: false, message: 'Reseller not found' });
    res.json({ success: true, data: reseller, message: 'Reseller updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/resellers/:id
router.delete('/:id', async (req, res) => {
  try {
    if (req.isDemoMode) {
      req.demoDB.resellers = (req.demoDB.resellers || []).filter(r => r._id !== req.params.id);
      return res.json({ success: true, message: 'Reseller deleted' });
    }

    const Reseller = require('../models/Reseller');
    const reseller = await Reseller.findByIdAndDelete(req.params.id);
    if (!reseller) return res.status(404).json({ success: false, message: 'Reseller not found' });
    res.json({ success: true, message: 'Reseller deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/resellers/stats
router.get('/stats', async (req, res) => {
  try {
    const resellers = await getResellers(req);
    const totalResellers = resellers.length;
    const activeResellers = resellers.filter(r => r.isActive).length;
    const totalUidsUsed = resellers.reduce((sum, r) => sum + (r.uidUsed || 0), 0);
    const totalUidLimit = resellers.reduce((sum, r) => sum + (r.uidLimit === -1 ? 0 : r.uidLimit), 0);
    res.json({ success: true, data: { totalResellers, activeResellers, totalUidsUsed, totalUidLimit } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
