const express = require('express');
const Rating = require('../models/Rating');
const FreePanel = require('../models/FreePanel');
const PaidPanel = require('../models/PaidPanel');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    if (req.isDemoMode) {
      const ratings = req.demoDB.getAllRatings();
      return res.json({ success: true, data: ratings });
    }
    const ratings = await Rating.find()
      .populate('userId', 'username email avatar')
      .sort({ createdAt: -1 })
      .limit(200);

    const enriched = await Promise.all(ratings.map(async (r) => {
      let panelName = 'Unknown Panel';
      try {
        if (r.panelType === 'free') {
          const panel = await FreePanel.findById(r.panelId).select('name');
          if (panel) panelName = panel.name;
        } else {
          const panel = await PaidPanel.findById(r.panelId).select('name');
          if (panel) panelName = panel.name;
        }
      } catch (e) {}
      return { ...r.toObject(), panelName };
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Ratings fetch error:', error);
    res.json({ success: true, data: [] });
  }
});

router.delete('/:id', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const deleted = req.demoDB.deleteRating(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Rating not found' });
      return res.json({ success: true, message: 'Rating deleted' });
    }
    const rating = await Rating.findByIdAndDelete(req.params.id);
    if (!rating) return res.status(404).json({ success: false, message: 'Rating not found' });

    const allRatings = await Rating.find({ panelId: rating.panelId });
    const totalRatings = allRatings.length;
    const avgRating = totalRatings > 0 ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings : 0;

    if (rating.panelType === 'free') {
      await FreePanel.findByIdAndUpdate(rating.panelId, { rating: avgRating, totalRatings });
    } else {
      await PaidPanel.findByIdAndUpdate(rating.panelId, { rating: avgRating, totalRatings });
    }

    res.json({ success: true, message: 'Rating deleted' });
  } catch (error) {
    console.error('Rating delete error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
