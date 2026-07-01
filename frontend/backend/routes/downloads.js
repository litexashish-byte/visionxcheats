const express = require('express');
const Download = require('../models/Download');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

router.get('/', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const { page = 1, limit = 20, status } = req.query;
      let downloads = [...req.demoDB.downloads];
      if (status === 'completed') {
        downloads = downloads.filter(d => d.downloadCompleted);
      } else if (status === 'pending') {
        downloads = downloads.filter(d => !d.downloadCompleted);
      }
      downloads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const enriched = downloads.map(d => ({
        ...d,
        userId: typeof d.userId === 'string' ? req.demoDB.findUserById(d.userId) || { username: 'Guest' } : d.userId,
      }));
      const total = req.demoDB.downloads.length;
      const totalDownloads = req.demoDB.downloads.filter(d => d.downloadCompleted).length;
      const pending = req.demoDB.downloads.filter(d => !d.downloadCompleted).length;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const paged = enriched.slice(skip, skip + parseInt(limit));
      return res.json({ success: true, data: paged, stats: { total, totalDownloads, pending }, pagination: { page: parseInt(page), limit: parseInt(limit), total: downloads.length, pages: Math.ceil(downloads.length / parseInt(limit)) } });
    }
    const { page = 1, limit = 20, panelId, status } = req.query;
    const query = {};
    if (panelId) query.panelId = panelId;
    if (status === 'completed') {
      query.downloadCompleted = true;
    } else if (status === 'pending') {
      query.downloadCompleted = false;
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const downloads = await Download.find(query).populate('panelId').populate('userId', 'username email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await Download.countDocuments(panelId ? { panelId } : {});
    const totalDownloads = await Download.countDocuments({ downloadCompleted: true });
    const pending = await Download.countDocuments({ downloadCompleted: false });
    res.json({ success: true, data: downloads, stats: { total, totalDownloads, pending }, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.delete('/', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      req.demoDB.downloads = [];
      return res.json({ success: true, message: 'All downloads reset' });
    }
    await Download.deleteMany({});
    res.json({ success: true, message: 'All downloads reset' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.get('/stats', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) return res.json({ success: true, data: { totalDownloads: 0, todayDownloads: 0, dailyStats: [] } });
    const totalDownloads = await Download.countDocuments({ downloadCompleted: true });
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayDownloads = await Download.countDocuments({ downloadCompleted: true, createdAt: { $gte: todayStart } });
    const stats = await Download.aggregate([
      { $match: { downloadCompleted: true } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);
    res.json({ success: true, data: { totalDownloads, todayDownloads, dailyStats: stats } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

module.exports = router;