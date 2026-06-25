const express = require('express');
const User = require('../models/User');
const FreePanel = require('../models/FreePanel');
const PaidPanel = require('../models/PaidPanel');
const License = require('../models/License');
const Download = require('../models/Download');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { shortenUrl } = require('../utils/shortener');

const router = express.Router();

// @route   GET /api/admin/dashboard
router.get('/dashboard', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const stats = req.demoDB.getStats();
      const recentUsers = req.demoDB.getUsers().slice(0, 5).map(u => ({ _id: u._id, username: u.username, email: u.email, role: u.role, isBanned: u.isBanned, avatar: u.avatar, createdAt: new Date() }));
      const recentDownloads = req.demoDB.downloads
        .filter(d => d.downloadCompleted)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(d => ({
          ...d,
          userId: typeof d.userId === 'string' ? req.demoDB.findUserById(d.userId) || { username: 'Guest' } : d.userId,
        }));
      return res.json({ success: true, data: { stats, recentUsers, recentDownloads } });
    }

    const [totalUsers, totalDownloads, freePanelCount, paidPanelCount, totalLicenses, activeLicenses, recentUsers, recentDownloads] = await Promise.all([
      User.countDocuments(), Download.countDocuments({ downloadCompleted: true }),
      FreePanel.countDocuments(), PaidPanel.countDocuments(),
      License.countDocuments(), License.countDocuments({ isActive: true, isDisabled: false }),
      User.find().sort({ createdAt: -1 }).limit(5).select('-password'),
      Download.find({ downloadCompleted: true }).populate('userId', 'username').sort({ createdAt: -1 }).limit(5),
    ]);

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayUsers = await User.countDocuments({ createdAt: { $gte: todayStart } });
    const todayDownloads = await Download.countDocuments({ downloadCompleted: true, createdAt: { $gte: todayStart } });

    res.json({
      success: true,
      data: {
        stats: { totalUsers, totalDownloads, freePanelCount, paidPanelCount, totalLicenses, activeLicenses, todayUsers, todayDownloads },
        recentUsers, recentDownloads,
      },
    });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// @route   GET /api/admin/users
router.get('/users', auth, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    if (req.isDemoMode) {
      let users = req.demoDB.getUsers().map(u => ({ _id: u._id, username: u.username, email: u.email, role: u.role, isBanned: u.isBanned, avatar: u.avatar, createdAt: u.createdAt, updatedAt: u.updatedAt }));
      if (search) {
        const s = search.toLowerCase();
        users = users.filter(u => u.username.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
      }
      return res.json({ success: true, data: users, pagination: { page: 1, limit, total: users.length, pages: 1 } });
    }

    const query = {};
    if (search) query.$or = [{ username: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, data: users, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.put('/users/:id/ban', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const user = req.demoDB.findUserById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot ban admin user' });
      user.isBanned = true;
      return res.json({ success: true, data: { _id: user._id, username: user.username, isBanned: user.isBanned }, message: 'User banned' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user, message: 'User banned' });
  } catch (error) { console.error('Ban error:', error); res.status(500).json({ success: false, message: 'Server error' }); }
});

router.put('/users/:id/unban', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const user = req.demoDB.findUserById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      user.isBanned = false;
      return res.json({ success: true, data: { _id: user._id, username: user.username, isBanned: user.isBanned }, message: 'User unbanned' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: false }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user, message: 'User unbanned' });
  } catch (error) { console.error('Unban error:', error); res.status(500).json({ success: false, message: 'Server error' }); }
});

router.delete('/users/:id', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const idx = req.demoDB.users.findIndex(u => u._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'User not found' });
      req.demoDB.users.splice(idx, 1);
      return res.json({ success: true, message: 'User deleted' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.get('/panels/free', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) return res.json({ success: true, data: req.demoDB.freePanels });
    const panels = await FreePanel.find().sort({ createdAt: -1 });
    res.json({ success: true, data: panels });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.get('/panels/paid', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) return res.json({ success: true, data: req.demoDB.paidPanels });
    const panels = await PaidPanel.find().sort({ createdAt: -1 });
    res.json({ success: true, data: panels });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.post('/shorten', auth, admin, async (req, res) => {
  try {
    const { url, alias } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL is required' });
    const shortenedUrl = await shortenUrl(url, req.siteSettings, alias);
    res.json({ success: true, data: { shortenedUrl } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to shorten URL' });
  }
});

// @route   GET /api/admin/settings
router.get('/settings', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      return res.json({ success: true, data: req.demoDB.settings });
    }
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// @route   PUT /api/admin/settings
router.put('/settings', auth, admin, async (req, res) => {
  try {
    const { shortenerApiKey, shortenerApiUrl, siteName, siteDescription, maintenanceMode, allowRegistration, discordLink, youtubeLink, instagramLink, whatsappLink, telegramLink } = req.body;
    
    if (req.isDemoMode) {
      Object.assign(req.demoDB.settings, {
        shortenerApiKey: shortenerApiKey ?? req.demoDB.settings.shortenerApiKey,
        shortenerApiUrl: shortenerApiUrl ?? req.demoDB.settings.shortenerApiUrl,
        siteName: siteName ?? req.demoDB.settings.siteName,
        siteDescription: siteDescription ?? req.demoDB.settings.siteDescription,
        maintenanceMode: maintenanceMode !== undefined ? maintenanceMode : req.demoDB.settings.maintenanceMode,
        allowRegistration: allowRegistration !== undefined ? allowRegistration : req.demoDB.settings.allowRegistration,
        discordLink: discordLink ?? req.demoDB.settings.discordLink,
        youtubeLink: youtubeLink ?? req.demoDB.settings.youtubeLink,
        instagramLink: instagramLink ?? req.demoDB.settings.instagramLink,
        whatsappLink: whatsappLink ?? req.demoDB.settings.whatsappLink,
        telegramLink: telegramLink ?? req.demoDB.settings.telegramLink,
      });
      return res.json({ success: true, data: req.demoDB.settings, message: 'Settings updated' });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    if (shortenerApiKey !== undefined) settings.shortenerApiKey = shortenerApiKey;
    if (shortenerApiUrl !== undefined) settings.shortenerApiUrl = shortenerApiUrl;
    if (siteName !== undefined) settings.siteName = siteName;
    if (siteDescription !== undefined) settings.siteDescription = siteDescription;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (allowRegistration !== undefined) settings.allowRegistration = allowRegistration;
    if (discordLink !== undefined) settings.discordLink = discordLink;
    if (youtubeLink !== undefined) settings.youtubeLink = youtubeLink;
    if (instagramLink !== undefined) settings.instagramLink = instagramLink;
    if (whatsappLink !== undefined) settings.whatsappLink = whatsappLink;
    if (telegramLink !== undefined) settings.telegramLink = telegramLink;
    settings.updatedBy = req.user._id;
    
    await settings.save();
    res.json({ success: true, data: settings, message: 'Settings updated' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

module.exports = router;
