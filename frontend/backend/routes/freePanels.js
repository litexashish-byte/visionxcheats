const express = require('express');
const FreePanel = require('../models/FreePanel');
const Rating = require('../models/Rating');
const Download = require('../models/Download');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const admin = require('../middleware/admin');
const { shortenUrl } = require('../utils/shortener');

const router = express.Router();

async function withAutoShortener(data, settings, existingPanel = null) {
  const payload = { ...data };
  const downloadLink = payload.downloadLink ?? existingPanel?.downloadLink;
  const currentShortenerLink = payload.shortenerLink ?? existingPanel?.shortenerLink;
  const downloadLinkChanged = payload.downloadLink !== undefined && payload.downloadLink !== existingPanel?.downloadLink;

  if (downloadLink && (!currentShortenerLink || downloadLinkChanged)) {
    payload.shortenerLink = await shortenUrl(downloadLink, settings, payload.name || existingPanel?.name || existingPanel?._id);
  }

  return payload;
}

// @route   GET /api/free-panels
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, featured } = req.query;
    
    if (req.isDemoMode) {
      let panels = req.demoDB.getFreePanels({ isActive: true, category, search, isFeatured: featured === 'true' });
      const total = panels.length;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      panels = panels.slice(skip, skip + parseInt(limit));
      return res.json({
        success: true,
        data: panels,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      });
    }

    const query = { isActive: true };
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (search) query.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const panels = await FreePanel.find(query).sort({ isFeatured: -1, createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await FreePanel.countDocuments(query);

    res.json({
      success: true,
      data: panels,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.error('Get free panels error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/free-panels/featured
router.get('/featured', async (req, res) => {
  try {
    if (req.isDemoMode) {
      return res.json({ success: true, data: req.demoDB.freePanels.filter(p => p.isActive && p.isFeatured).slice(0, 6) });
    }
    const panels = await FreePanel.find({ isActive: true, isFeatured: true }).sort({ createdAt: -1 }).limit(6);
    res.json({ success: true, data: panels });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/free-panels/latest
router.get('/latest', async (req, res) => {
  try {
    if (req.isDemoMode) {
      const panels = [...req.demoDB.freePanels].filter(p => p.isActive).reverse().slice(0, 8);
      return res.json({ success: true, data: panels });
    }
    const panels = await FreePanel.find({ isActive: true }).sort({ createdAt: -1 }).limit(8);
    res.json({ success: true, data: panels });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/free-panels/popular
router.get('/popular', async (req, res) => {
  try {
    if (req.isDemoMode) {
      const panels = [...req.demoDB.freePanels].filter(p => p.isActive).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 8);
      return res.json({ success: true, data: panels });
    }
    const panels = await FreePanel.find({ isActive: true }).sort({ createdAt: -1 }).limit(8);
    res.json({ success: true, data: panels });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/free-panels/:id
router.get('/:id', async (req, res) => {
  try {
    if (req.isDemoMode) {
      const panel = req.demoDB.findFreePanelById(req.params.id);
      if (!panel) return res.status(404).json({ success: false, message: 'Panel not found' });
      return res.json({ success: true, data: panel });
    }
    const panel = await FreePanel.findById(req.params.id);
    if (!panel) return res.status(404).json({ success: false, message: 'Panel not found' });
    res.json({ success: true, data: panel });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/free-panels/:id/download
router.post('/:id/download', optionalAuth, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const panel = req.demoDB.findFreePanelById(req.params.id);
      if (!panel) return res.status(404).json({ success: false, message: 'Panel not found' });
      if (panel.linkExpiry && new Date() > new Date(panel.linkExpiry)) {
        return res.status(400).json({ success: false, message: 'Download link has expired.', linkExpired: true });
      }
      // Auto-generate shortener link using API settings
      if (!panel.shortenerLink) {
        panel.shortenerLink = await shortenUrl(
          panel.downloadLink,
          req.siteSettings,
          panel.name || panel._id
        );
      }
      return res.json({
        success: true,
        requiresShortener: true,
        shortenerLink: panel.shortenerLink,
        message: 'Please complete the shortener step',
        panelName: panel.name,
        version: panel.version,
      });
    }
    // MongoDB version
    const panel = await FreePanel.findById(req.params.id);
    if (!panel) return res.status(404).json({ success: false, message: 'Panel not found' });
    if (panel.linkExpiry && new Date() > panel.linkExpiry) {
      panel.isLinkExpired = true; await panel.save();
      return res.status(400).json({ success: false, message: 'Download link has expired.', linkExpired: true });
    }
    if (!panel.shortenerLink) {
      panel.shortenerLink = await shortenUrl(
        panel.downloadLink,
        req.siteSettings,
        panel.name || panel._id
      );
      await panel.save();
    }
    await Download.create({ panelId: panel._id, panelName: panel.name, userId: req.user?._id || null, ipAddress: req.ip, userAgent: req.get('User-Agent'), shortenerLink: panel.shortenerLink });
    return res.json({
      success: true,
      requiresShortener: true,
      shortenerLink: panel.shortenerLink,
      message: 'Please complete the shortener step',
      panelName: panel.name,
      version: panel.version,
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/free-panels/:id/confirm-download
router.post('/:id/confirm-download', optionalAuth, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const panel = req.demoDB.findFreePanelById(req.params.id);
      if (!panel) return res.status(404).json({ success: false, message: 'Panel not found' });
      panel.downloadCount += 1;
      // Record download with timestamp
      const download = req.demoDB.recordDownload(panel._id, panel.name, req.user?._id || 'anonymous');
      return res.json({
        success: true,
        downloadLink: panel.downloadLink,
        message: 'Download started',
        download: {
          id: download._id,
          panelName: panel.name,
          downloadedAt: download.createdAt,
        },
      });
    }
    const panel = await FreePanel.findById(req.params.id);
    if (!panel) return res.status(404).json({ success: false, message: 'Panel not found' });
    panel.downloadCount += 1; await panel.save();
    const download = await Download.create({ panelId: panel._id, panelName: panel.name, userId: req.user?._id || null, ipAddress: req.ip, userAgent: req.get('User-Agent'), shortenerCompleted: true, downloadCompleted: true });
    if (req.user) {
      req.user.downloadHistory.push({ panelId: panel._id, panelName: panel.name, downloadedAt: new Date() }); await req.user.save();
    }
    res.json({
      success: true,
      downloadLink: panel.downloadLink,
      message: 'Download started',
      download: {
        id: download._id,
        panelName: panel.name,
        downloadedAt: download.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin Routes
router.post('/', auth, admin, async (req, res) => {
  try {
    const payload = await withAutoShortener(req.body, req.siteSettings);
    if (req.isDemoMode) {
      const panel = req.demoDB.addFreePanel(payload);
      return res.status(201).json({ success: true, data: panel });
    }
    const panel = await FreePanel.create(payload);
    res.status(201).json({ success: true, data: panel });
  } catch (error) {
    console.error('Create panel error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

router.put('/:id', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const existingPanel = req.demoDB.findFreePanelById(req.params.id);
      if (!existingPanel) return res.status(404).json({ success: false, message: 'Panel not found' });
      const payload = await withAutoShortener(req.body, req.siteSettings, existingPanel);
      const panel = req.demoDB.updateFreePanel(req.params.id, payload);
      if (!panel) return res.status(404).json({ success: false, message: 'Panel not found' });
      return res.json({ success: true, data: panel });
    }
    const existingPanel = await FreePanel.findById(req.params.id);
    if (!existingPanel) return res.status(404).json({ success: false, message: 'Panel not found' });
    const payload = await withAutoShortener(req.body, req.siteSettings, existingPanel);
    const panel = await FreePanel.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!panel) return res.status(404).json({ success: false, message: 'Panel not found' });
    res.json({ success: true, data: panel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

router.delete('/:id', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const deleted = req.demoDB.deleteFreePanel(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Panel not found' });
      return res.json({ success: true, message: 'Panel deleted' });
    }
    const panel = await FreePanel.findByIdAndDelete(req.params.id);
    if (!panel) return res.status(404).json({ success: false, message: 'Panel not found' });
    res.json({ success: true, message: 'Panel deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be 1-5' });

    if (req.isDemoMode) {
      const panel = req.demoDB.findFreePanelById(req.params.id);
      if (!panel) return res.status(404).json({ success: false, message: 'Panel not found' });
      const userId = req.user._id;
      const existing = req.demoDB.getUserRating(userId, req.params.id);
      if (existing > 0) {
        return res.status(400).json({ success: false, message: 'You have already rated this panel', userRating: existing });
      }
      req.demoDB.addUserRating(userId, req.params.id, 'free', rating);
      const allRatings = req.demoDB.ratings.filter(r => r.panelId === req.params.id);
      const totalRatings = allRatings.length;
      panel.rating = totalRatings > 0 ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings : 0;
      panel.totalRatings = totalRatings;
      return res.json({ success: true, data: { rating: panel.rating, totalRatings: panel.totalRatings, userRating: rating } });
    }

    const existing = await Rating.findOne({ userId: req.user.id, panelId: req.params.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already rated this panel', userRating: existing.rating });
    }
    await Rating.create({ userId: req.user.id, panelId: req.params.id, panelType: 'free', rating });

    const allRatings = await Rating.find({ panelId: req.params.id });
    const totalRatings = allRatings.length;
    const avgRating = totalRatings > 0 ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings : 0;

    await FreePanel.findByIdAndUpdate(req.params.id, { rating: avgRating, totalRatings });

    res.json({ success: true, data: { rating: avgRating, totalRatings, userRating: rating } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:id/my-rating', auth, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const userRating = req.demoDB.getUserRating(req.user._id, req.params.id);
      return res.json({ success: true, data: { userRating } });
    }
    const rating = await Rating.findOne({ userId: req.user.id, panelId: req.params.id });
    res.json({ success: true, data: { userRating: rating ? rating.rating : 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
