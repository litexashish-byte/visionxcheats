const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/profile', auth, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const user = req.demoDB.findUserById(req.user._id || req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      const { password: _, ...userWithoutPassword } = user;
      return res.json({ success: true, data: userWithoutPassword });
    }
    const user = await User.findById(req.user._id).populate('downloadHistory.panelId').populate('savedLicenses.panelId');
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ success: true, data: userWithoutPassword });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { username, avatar } = req.body;
    if (req.isDemoMode) {
      const user = req.demoDB.findUserById(req.user._id || req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      if (username) user.username = username;
      if (avatar !== undefined) user.avatar = avatar;
      const { password: _, ...userWithoutPassword } = user;
      return res.json({ success: true, data: userWithoutPassword });
    }
    const user = await User.findById(req.user._id);
    if (username) user.username = username;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();
    const { password: _, ...userWithout } = user.toObject();
    res.json({ success: true, data: userWithout });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.get('/download-history', auth, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const user = req.demoDB.findUserById(req.user._id || req.user.id);
      if (!user) return res.json({ success: true, data: [] });
      return res.json({ success: true, data: user.downloadHistory || [] });
    }
    const user = await User.findById(req.user._id).populate('downloadHistory.panelId');
    const history = user.downloadHistory.sort((a, b) => b.downloadedAt - a.downloadedAt);
    res.json({ success: true, data: history });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.get('/licenses', auth, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const user = req.demoDB.findUserById(req.user._id || req.user.id);
      if (!user) return res.json({ success: true, data: [] });
      return res.json({ success: true, data: user.savedLicenses || [] });
    }
    const user = await User.findById(req.user._id).populate('savedLicenses.panelId');
    res.json({ success: true, data: user.savedLicenses });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

module.exports = router;