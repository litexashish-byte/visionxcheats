const express = require('express');
const ResellProduct = require('../models/ResellProduct');
const ResellCombo = require('../models/ResellCombo');
const UIDBypassResell = require('../models/UIDBypassResell');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// ============ RESELL PRODUCTS ============

// GET all resell products (admin)
router.get('/products', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      return res.json({ success: true, data: req.demoDB.resellProducts || [] });
    }
    const products = await ResellProduct.find().sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST create resell product
router.post('/products', auth, admin, async (req, res) => {
  try {
    const productData = req.body;
    if (req.isDemoMode) {
      const product = {
        _id: 'rp-' + Date.now(),
        ...productData,
        totalSales: 0,
        totalRevenue: 0,
        isActive: productData.isActive !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      req.demoDB.resellProducts = req.demoDB.resellProducts || [];
      req.demoDB.resellProducts.push(product);
      return res.status(201).json({ success: true, data: product });
    }
    const product = await ResellProduct.create(productData);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// PUT update resell product
router.put('/products/:id', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const idx = (req.demoDB.resellProducts || []).findIndex(p => p._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
      req.demoDB.resellProducts[idx] = { ...req.demoDB.resellProducts[idx], ...req.body, updatedAt: new Date().toISOString() };
      return res.json({ success: true, data: req.demoDB.resellProducts[idx] });
    }
    const product = await ResellProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE resell product
router.delete('/products/:id', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      req.demoDB.resellProducts = (req.demoDB.resellProducts || []).filter(p => p._id !== req.params.id);
      return res.json({ success: true, message: 'Deleted' });
    }
    await ResellProduct.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT toggle product active status
router.put('/products/:id/toggle', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const product = (req.demoDB.resellProducts || []).find(p => p._id === req.params.id);
      if (!product) return res.status(404).json({ success: false, message: 'Not found' });
      product.isActive = !product.isActive;
      return res.json({ success: true, data: product });
    }
    const product = await ResellProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Not found' });
    product.isActive = !product.isActive;
    await product.save();
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ RESELL COMBOS ============

// GET all combos (admin)
router.get('/combos', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      return res.json({ success: true, data: req.demoDB.resellCombos || [] });
    }
    const combos = await ResellCombo.find().sort({ createdAt: -1 });
    res.json({ success: true, data: combos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST create combo
router.post('/combos', auth, admin, async (req, res) => {
  try {
    const comboData = req.body;
    if (req.isDemoMode) {
      const combo = {
        _id: 'rc-' + Date.now(),
        ...comboData,
        totalSales: 0,
        totalRevenue: 0,
        isActive: comboData.isActive !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      req.demoDB.resellCombos = req.demoDB.resellCombos || [];
      req.demoDB.resellCombos.push(combo);
      return res.status(201).json({ success: true, data: combo });
    }
    const combo = await ResellCombo.create(comboData);
    res.status(201).json({ success: true, data: combo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// PUT update combo
router.put('/combos/:id', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const idx = (req.demoDB.resellCombos || []).findIndex(c => c._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
      req.demoDB.resellCombos[idx] = { ...req.demoDB.resellCombos[idx], ...req.body, updatedAt: new Date().toISOString() };
      return res.json({ success: true, data: req.demoDB.resellCombos[idx] });
    }
    const combo = await ResellCombo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!combo) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: combo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE combo
router.delete('/combos/:id', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      req.demoDB.resellCombos = (req.demoDB.resellCombos || []).filter(c => c._id !== req.params.id);
      return res.json({ success: true, message: 'Deleted' });
    }
    await ResellCombo.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT toggle combo active status
router.put('/combos/:id/toggle', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const combo = (req.demoDB.resellCombos || []).find(c => c._id === req.params.id);
      if (!combo) return res.status(404).json({ success: false, message: 'Not found' });
      combo.isActive = !combo.isActive;
      return res.json({ success: true, data: combo });
    }
    const combo = await ResellCombo.findById(req.params.id);
    if (!combo) return res.status(404).json({ success: false, message: 'Not found' });
    combo.isActive = !combo.isActive;
    await combo.save();
    res.json({ success: true, data: combo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ UID BYPASS RESELL ============

// GET all UID bypass products (admin)
router.get('/uid-bypass', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      return res.json({ success: true, data: req.demoDB.uidBypassResells || [] });
    }
    const items = await UIDBypassResell.find().sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST create UID bypass product
router.post('/uid-bypass', auth, admin, async (req, res) => {
  try {
    const itemData = req.body;
    if (req.isDemoMode) {
      const item = {
        _id: 'ub-' + Date.now(),
        ...itemData,
        totalSales: 0,
        totalRevenue: 0,
        currentUids: 0,
        isActive: itemData.isActive !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      req.demoDB.uidBypassResells = req.demoDB.uidBypassResells || [];
      req.demoDB.uidBypassResells.push(item);
      return res.status(201).json({ success: true, data: item });
    }
    const item = await UIDBypassResell.create(itemData);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// PUT update UID bypass product
router.put('/uid-bypass/:id', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const idx = (req.demoDB.uidBypassResells || []).findIndex(p => p._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
      req.demoDB.uidBypassResells[idx] = { ...req.demoDB.uidBypassResells[idx], ...req.body, updatedAt: new Date().toISOString() };
      return res.json({ success: true, data: req.demoDB.uidBypassResells[idx] });
    }
    const item = await UIDBypassResell.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE UID bypass product
router.delete('/uid-bypass/:id', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      req.demoDB.uidBypassResells = (req.demoDB.uidBypassResells || []).filter(p => p._id !== req.params.id);
      return res.json({ success: true, message: 'Deleted' });
    }
    await UIDBypassResell.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT toggle UID bypass active status
router.put('/uid-bypass/:id/toggle', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const item = (req.demoDB.uidBypassResells || []).find(p => p._id === req.params.id);
      if (!item) return res.status(404).json({ success: false, message: 'Not found' });
      item.isActive = !item.isActive;
      return res.json({ success: true, data: item });
    }
    const item = await UIDBypassResell.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    item.isActive = !item.isActive;
    await item.save();
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ STATS ============

router.get('/stats', auth, admin, async (req, res) => {
  try {
    if (req.isDemoMode) {
      const products = req.demoDB.resellProducts || [];
      const combos = req.demoDB.resellCombos || [];
      const uidResells = req.demoDB.uidBypassResells || [];
      return res.json({
        success: true,
        data: {
          totalProducts: products.length,
          activeProducts: products.filter(p => p.isActive).length,
          totalCombos: combos.length,
          activeCombos: combos.filter(c => c.isActive).length,
          totalUidProducts: uidResells.length,
          activeUidProducts: uidResells.filter(p => p.isActive).length,
          totalRevenue: products.reduce((s, p) => s + (p.totalRevenue || 0), 0) + combos.reduce((s, c) => s + (c.totalRevenue || 0), 0) + uidResells.reduce((s, p) => s + (p.totalRevenue || 0), 0),
          totalSales: products.reduce((s, p) => s + (p.totalSales || 0), 0) + combos.reduce((s, c) => s + (c.totalSales || 0), 0) + uidResells.reduce((s, p) => s + (p.totalSales || 0), 0),
        },
      });
    }
    const [products, combos, uidResells] = await Promise.all([
      ResellProduct.find(),
      ResellCombo.find(),
      UIDBypassResell.find(),
    ]);
    res.json({
      success: true,
      data: {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.isActive).length,
        totalCombos: combos.length,
        activeCombos: combos.filter(c => c.isActive).length,
        totalUidProducts: uidResells.length,
        activeUidProducts: uidResells.filter(p => p.isActive).length,
        totalRevenue: products.reduce((s, p) => s + (p.totalRevenue || 0), 0) + combos.reduce((s, c) => s + (c.totalRevenue || 0), 0) + uidResells.reduce((s, p) => s + (p.totalRevenue || 0), 0),
        totalSales: products.reduce((s, p) => s + (p.totalSales || 0), 0) + combos.reduce((s, c) => s + (c.totalSales || 0), 0) + uidResells.reduce((s, p) => s + (p.totalSales || 0), 0),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
