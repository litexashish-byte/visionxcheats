const express = require('express');
const PaidPanel = require('../models/PaidPanel');
const Rating = require('../models/Rating');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, featured } = req.query;
    
    if (req.isDemoMode) {
      let panels = req.demoDB.getPaidPanels({ isActive: true, category, search, isFeatured: featured === 'true' });
      const total = panels.length;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      panels = panels.slice(skip, skip + parseInt(limit));
      return res.json({ success: true, data: panels, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
    }

    const query = { isActive: true };
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (search) query.$text = { $search: search };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const panels = await PaidPanel.find(query).sort({ isFeatured: -1, createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await PaidPanel.countDocuments(query);
    res.json({ success: true, data: panels, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.get('/featured', async (req, res) => {
  try {
    if (req.isDemoMode) return res.json({ success: true, data: req.demoDB.paidPanels.filter(p => p.isActive && p.isFeatured).slice(0, 6) });
    const panels = await PaidPanel.find({ isActive: true, isFeatured: true }).sort({ createdAt: -1 }).limit(6);
    res.json({ success: true, data: panels });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    if (req.isDemoMode) {
      const panel = req.demoDB.findPaidPanelById(req.params.id);
      if (!panel) return res.status(404).json({ success: false, message: 'Panel not found' });
      return res.json({ success: true, data: panel });
    }
    const panel = await PaidPanel.findById(req.params.id);
    if (!panel) return res.status(404).json({ success: false, message: 'Panel not found' });
    res.json({ success: true, data: panel });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.post('/', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) return res.status(201).json({ success: true, data: req.demoDB.addPaidPanel(req.body) });
    const panel = await PaidPanel.create(req.body);
    res.status(201).json({ success: true, data: panel });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.put('/:id', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const panel = req.demoDB.updatePaidPanel(req.params.id, req.body);
      if (!panel) return res.status(404).json({ success: false, message: 'Panel not found' });
      return res.json({ success: true, data: panel });
    }
    const panel = await PaidPanel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!panel) return res.status(404).json({ success: false, message: 'Panel not found' });
    res.json({ success: true, data: panel });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.delete('/:id', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      if (!req.demoDB.deletePaidPanel(req.params.id)) return res.status(404).json({ success: false, message: 'Panel not found' });
      return res.json({ success: true, message: 'Panel deleted' });
    }
    const panel = await PaidPanel.findByIdAndDelete(req.params.id);
    if (!panel) return res.status(404).json({ success: false, message: 'Panel not found' });
    res.json({ success: true, message: 'Panel deleted' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be 1-5' });

    if (req.isDemoMode) {
      const panel = req.demoDB.findPaidPanelById(req.params.id);
      if (!panel) return res.status(404).json({ success: false, message: 'Panel not found' });
      const userId = req.user._id;
      const existing = req.demoDB.getUserRating(userId, req.params.id);
      if (existing > 0) {
        return res.status(400).json({ success: false, message: 'You have already rated this panel', userRating: existing });
      }
      req.demoDB.addUserRating(userId, req.params.id, 'paid', rating);
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
    await Rating.create({ userId: req.user.id, panelId: req.params.id, panelType: 'paid', rating });

    const allRatings = await Rating.find({ panelId: req.params.id });
    const totalRatings = allRatings.length;
    const avgRating = totalRatings > 0 ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings : 0;

    await PaidPanel.findByIdAndUpdate(req.params.id, { rating: avgRating, totalRatings });

    res.json({ success: true, data: { rating: avgRating, totalRatings, userRating: rating } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

router.get('/:id/my-rating', auth, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const userRating = req.demoDB.getUserRating(req.user._id, req.params.id);
      return res.json({ success: true, data: { userRating } });
    }
    const rating = await Rating.findOne({ userId: req.user.id, panelId: req.params.id });
    res.json({ success: true, data: { userRating: rating ? rating.rating : 0 } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

module.exports = router;