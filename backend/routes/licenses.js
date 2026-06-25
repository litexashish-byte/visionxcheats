const express = require('express');
const License = require('../models/License');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

router.post('/generate', auth, admin, async (req, res) => {
  try {
    const { panelId, panelName, email, expiresInDays, quantity = 1 } = req.body;
    if (!panelId || !panelName) return res.status(400).json({ success: false, message: 'Panel ID and name required' });

    if (req.isDemoMode) {
      const licenses = req.demoDB.generateLicense({ panelId, panelName, quantity });
      return res.status(201).json({ success: true, data: quantity === 1 ? licenses[0] : licenses, message: `${quantity} license(s) generated` });
    }

    const expiresAt = expiresInDays ? new Date(Date.now() + parseInt(expiresInDays) * 86400000) : null;
    const licenses = [];
    for (let i = 0; i < quantity; i++) {
      licenses.push(await License.create({ panelId, panelName, email: email || '', expiresAt }));
    }
    res.status(201).json({ success: true, data: quantity === 1 ? licenses[0] : licenses, message: `${quantity} license(s) generated` });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.get('/', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) return res.json({ success: true, data: req.demoDB.licenses, pagination: { page: 1, limit: 20, total: req.demoDB.licenses.length, pages: 1 } });
    const { page = 1, limit = 20, panelId, isActive } = req.query;
    const query = {};
    if (panelId) query.panelId = panelId;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const licenses = await License.find(query).populate('panelId').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await License.countDocuments(query);
    res.json({ success: true, data: licenses, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.put('/:id/disable', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const lic = req.demoDB.licenses.find(l => l._id === req.params.id);
      if (!lic) return res.status(404).json({ success: false, message: 'License not found' });
      lic.isDisabled = true; lic.isActive = false;
      return res.json({ success: true, data: lic, message: 'License disabled' });
    }
    const license = await License.findByIdAndUpdate(req.params.id, { isDisabled: true, isActive: false }, { new: true });
    if (!license) return res.status(404).json({ success: false, message: 'License not found' });
    res.json({ success: true, data: license, message: 'License disabled' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.put('/:id/enable', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const lic = req.demoDB.licenses.find(l => l._id === req.params.id);
      if (!lic) return res.status(404).json({ success: false, message: 'License not found' });
      lic.isDisabled = false; lic.isActive = true;
      return res.json({ success: true, data: lic, message: 'License enabled' });
    }
    const license = await License.findByIdAndUpdate(req.params.id, { isDisabled: false, isActive: true }, { new: true });
    if (!license) return res.status(404).json({ success: false, message: 'License not found' });
    res.json({ success: true, data: license, message: 'License enabled' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.get('/verify/:key', async (req, res) => {
  try {
    if (req.isDemoMode) {
      const lic = req.demoDB.licenses.find(l => l.licenseKey === req.params.key);
      if (!lic) return res.status(404).json({ success: false, message: 'Invalid license key' });
      if (lic.isDisabled) return res.status(400).json({ success: false, message: 'License disabled' });
      return res.json({ success: true, data: lic, message: 'License valid' });
    }
    const license = await License.findOne({ licenseKey: req.params.key }).populate('panelId');
    if (!license) return res.status(404).json({ success: false, message: 'Invalid license key' });
    if (license.isDisabled) return res.status(400).json({ success: false, message: 'License disabled' });
    if (license.expiresAt && new Date() > license.expiresAt) {
      license.isActive = false; await license.save();
      return res.status(400).json({ success: false, message: 'License expired' });
    }
    res.json({ success: true, data: license, message: 'License valid' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

module.exports = router;