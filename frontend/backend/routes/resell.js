const express = require('express');
const ResellProduct = require('../models/ResellProduct');
const ResellCombo = require('../models/ResellCombo');
const UIDBypassResell = require('../models/UIDBypassResell');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// GET /api/resell/products - Public: list active resell products
router.get('/products', async (req, res) => {
  try {
    if (req.isDemoMode) {
      const products = (req.demoDB.resellProducts || []).filter(p => p.isActive);
      return res.json({ success: true, data: products });
    }
    const products = await ResellProduct.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/resell/products/:id
router.get('/products/:id', async (req, res) => {
  try {
    if (req.isDemoMode) {
      const product = (req.demoDB.resellProducts || []).find(p => p._id === req.params.id);
      if (!product) return res.status(404).json({ success: false, message: 'Not found' });
      return res.json({ success: true, data: product });
    }
    const product = await ResellProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/resell/combos - Public: list active combos
router.get('/combos', async (req, res) => {
  try {
    if (req.isDemoMode) {
      const combos = (req.demoDB.resellCombos || []).filter(c => c.isActive);
      return res.json({ success: true, data: combos });
    }
    const combos = await ResellCombo.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: combos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/resell/uid-bypass - Public: list active UID bypass products
router.get('/uid-bypass', async (req, res) => {
  try {
    if (req.isDemoMode) {
      const items = (req.demoDB.uidBypassResells || []).filter(p => p.isActive);
      return res.json({ success: true, data: items });
    }
    const items = await UIDBypassResell.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/resell/purchase - Purchase a resell product (creates license)
router.post('/purchase', async (req, res) => {
  try {
    const { productId, productType, licenseType, buyerEmail, buyerName } = req.body;
    if (!productId || !productType) {
      return res.status(400).json({ success: false, message: 'Product ID and type required' });
    }

    // In demo mode, simulate purchase
    if (req.isDemoMode) {
      const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      return res.json({
        success: true,
        data: {
          orderId,
          productId,
          productType,
          status: 'pending_payment',
          message: 'Order created. Complete payment to activate.',
          createdAt: new Date().toISOString(),
        },
      });
    }

    const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    res.json({
      success: true,
      data: {
        orderId,
        productId,
        productType,
        status: 'pending_payment',
        message: 'Order created. Complete payment to activate.',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
