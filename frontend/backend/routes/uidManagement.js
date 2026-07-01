const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

const GTC_BASE = 'https://gtccheats.xyz/Api/uidbypassapi/api_user.php';
const JWT_SECRET = process.env.JWT_SECRET || 'visionx-reseller-secret';

function generateToken(reseller) {
  return jwt.sign({ id: reseller._id, email: reseller.email, role: 'reseller' }, JWT_SECRET, { expiresIn: '30d' });
}

function authMiddleware(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'reseller') return res.status(403).json({ success: false, message: 'Access denied' });
    req.reseller = decoded;
    next();
  } catch (err) { res.status(401).json({ success: false, message: 'Invalid token' }); }
}

async function gtcRequest(endpoint, apiKey, params = {}, method = 'POST') {
  const url = new URL(GTC_BASE);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('action', endpoint);
  try {
    const options = {
      method,
      headers: { 'Accept': 'application/json' },
    };
    if (method === 'POST' && params && Object.keys(params).length > 0) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(params);
    } else if (method === 'GET') {
      Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) url.searchParams.set(k, v); });
    }
    const res = await fetch(url.toString(), options);
    const text = await res.text();
    try { return JSON.parse(text); } catch { return { success: false, error: 'Invalid response: ' + text.substring(0, 200) }; }
  } catch (err) { return { success: false, error: err.message }; }
}

function getDemoDB(req) { return req.demoDB; }

// Reseller Login (same as resellers.js but re-exposed here)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    let reseller;
    if (req.isDemoMode) {
      reseller = (req.demoDB.resellers || []).find(r => r.email === email);
    } else {
      const Reseller = require('../models/Reseller');
      reseller = await Reseller.findOne({ email });
    }

    if (!reseller) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!reseller.isActive) return res.status(403).json({ success: false, message: 'Account suspended' });

    const isMatch = reseller.password === password || (reseller.comparePassword && await reseller.comparePassword(password));
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(reseller);
    res.json({ success: true, data: { token, reseller: { id: reseller._id, name: reseller.name, email: reseller.email, uidLimit: reseller.uidLimit, uidUsed: reseller.uidUsed } } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Get Reseller Profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    let reseller;
    if (req.isDemoMode) {
      reseller = (req.demoDB.resellers || []).find(r => r._id === req.reseller.id);
    } else {
      const Reseller = require('../models/Reseller');
      reseller = await Reseller.findById(req.reseller.id).select('-password');
    }
    if (!reseller) return res.status(404).json({ success: false, message: 'Reseller not found' });
    res.json({ success: true, data: reseller });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Whitelist UID
router.post('/whitelist', authMiddleware, async (req, res) => {
  try {
    const { uid, duration } = req.body;
    if (!uid) return res.status(400).json({ success: false, message: 'UID required' });

    let reseller;
    if (req.isDemoMode) {
      reseller = (req.demoDB.resellers || []).find(r => r._id === req.reseller.id);
    } else {
      const Reseller = require('../models/Reseller');
      reseller = await Reseller.findById(req.reseller.id);
    }

    if (!reseller) return res.status(404).json({ success: false, message: 'Reseller not found' });
    if (!reseller.isActive) return res.status(403).json({ success: false, message: 'Account suspended' });
    if (reseller.uidLimit !== -1 && reseller.uidUsed >= reseller.uidLimit) {
      return res.status(403).json({ success: false, message: `UID limit reached (${reseller.uidUsed}/${reseller.uidLimit})` });
    }

    // Check if UID already exists and is active
    const db = getDemoDB(req);
    const existingUID = (db.uids || []).find(u => u.uid === uid && u.resellerId === String(reseller._id) && u.status === 'active');
    if (existingUID) return res.status(400).json({ success: false, message: 'UID already whitelisted' });

    const expDays = duration === 'monthly' ? 30 : duration === 'weekly' ? 7 : duration === 'fifteen_day' ? 15 : 1;

    const data = await gtcRequest('add', reseller.gtcApiKey, { account_id: parseInt(uid), for_days: expDays });

    // Always succeed in demo mode
    const success = data.success || req.isDemoMode;
    if (success) {
      const licenseKey = `${expDays}day-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const expiresAt = new Date(Date.now() + expDays * 86400000);

      // Save UID to DB
      db.uids = db.uids || [];
      db.uids.push({
        _id: 'uid-' + Date.now(),
        uid,
        resellerId: String(reseller._id),
        resellerName: reseller.name,
        duration: duration || 'daily',
        status: 'active',
        licenseKey,
        expiresAt,
        createdAt: new Date(),
      });

      // Update reseller uidUsed
      if (req.isDemoMode) {
        reseller.uidUsed = (reseller.uidUsed || 0) + 1;
      } else {
        const Reseller = require('../models/Reseller');
        await Reseller.findByIdAndUpdate(reseller._id, { $inc: { uidUsed: 1 }, lastActive: new Date() });
      }

      res.json({ success: true, data: { uid, duration: duration || 'daily', license_key: licenseKey, expires_at: expiresAt.toISOString().split('T')[0] + ' 23:59:59' }, message: 'UID whitelisted successfully!' });
    } else {
      res.status(400).json({ success: false, message: data.error || 'API error' });
    }
  } catch (error) { res.status(500).json({ success: false, message: 'Server error: ' + error.message }); }
});

// Get all UIDs for this reseller
router.get('/uids', authMiddleware, async (req, res) => {
  try {
    const db = getDemoDB(req);
    const uids = (db.uids || []).filter(u => u.resellerId === String(req.reseller.id));
    res.json({ success: true, data: uids });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Ban UID
router.post('/uids/ban', authMiddleware, async (req, res) => {
  try {
    const { uid, reason } = req.body;
    const db = getDemoDB(req);
    const uidEntry = (db.uids || []).find(u => u.uid === uid && u.resellerId === String(req.reseller.id));
    if (!uidEntry) return res.status(404).json({ success: false, message: 'UID not found' });
    uidEntry.status = 'banned';
    uidEntry.bannedAt = new Date();
    uidEntry.banReason = reason || 'Banned by reseller';
    res.json({ success: true, message: 'UID banned successfully' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Unban UID
router.post('/uids/unban', authMiddleware, async (req, res) => {
  try {
    const { uid } = req.body;
    const db = getDemoDB(req);
    const uidEntry = (db.uids || []).find(u => u.uid === uid && u.resellerId === String(req.reseller.id));
    if (!uidEntry) return res.status(404).json({ success: false, message: 'UID not found' });
    uidEntry.status = 'active';
    uidEntry.bannedAt = null;
    uidEntry.banReason = '';
    res.json({ success: true, message: 'UID unbanned successfully' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Delete UID
router.delete('/uids/:uid', authMiddleware, async (req, res) => {
  try {
    const db = getDemoDB(req);
    const idx = (db.uids || []).findIndex(u => u.uid === req.params.uid && u.resellerId === String(req.reseller.id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'UID not found' });
    db.uids.splice(idx, 1);
    res.json({ success: true, message: 'UID deleted successfully' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Check UID status
router.get('/check/:uid', authMiddleware, async (req, res) => {
  try {
    const db = getDemoDB(req);
    const uidEntry = (db.uids || []).find(u => u.uid === req.params.uid && u.resellerId === String(req.reseller.id));
    if (!uidEntry) return res.json({ success: true, data: { uid: req.params.uid, status: 'not_found' } });
    res.json({ success: true, data: uidEntry });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// Get Balance
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    let reseller;
    if (req.isDemoMode) {
      reseller = (req.demoDB.resellers || []).find(r => r._id === req.reseller.id);
    } else {
      const Reseller = require('../models/Reseller');
      reseller = await Reseller.findById(req.reseller.id);
    }
    if (!reseller) return res.status(404).json({ success: false, message: 'Reseller not found' });
    // Balance not available in this API - use demo fallback
    if (req.isDemoMode) {
      return res.json({ success: true, data: { balance: 25.00, currency: 'USD' } });
    }
    res.json({ success: true, data: { balance: 0, currency: 'USD', message: 'Balance check not available via API' } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// PUBLIC - Whitelist UID (customer)
router.post('/public-whitelist', async (req, res) => {
  try {
    const { uid, duration, resellerToken } = req.body;
    if (!uid || !resellerToken) return res.status(400).json({ success: false, message: 'UID and token required' });

    let resellerData;
    try {
      const decoded = jwt.verify(resellerToken, JWT_SECRET);
      if (decoded.role !== 'reseller') return res.status(403).json({ success: false, message: 'Invalid token' });
      resellerData = decoded;
    } catch { return res.status(401).json({ success: false, message: 'Invalid token' }); }

    let reseller;
    if (req.isDemoMode) {
      reseller = (req.demoDB.resellers || []).find(r => r._id === resellerData.id);
    } else {
      const Reseller = require('../models/Reseller');
      reseller = await Reseller.findById(resellerData.id);
    }

    if (!reseller) return res.status(404).json({ success: false, message: 'Reseller not found' });
    if (!reseller.isActive) return res.status(403).json({ success: false, message: 'Suspended' });
    if (reseller.uidLimit !== -1 && reseller.uidUsed >= reseller.uidLimit) {
      return res.status(403).json({ success: false, message: 'UID limit reached' });
    }

    const db = getDemoDB(req);
    const existingUID = (db.uids || []).find(u => u.uid === uid && u.resellerId === String(reseller._id) && u.status === 'active');
    if (existingUID) return res.status(400).json({ success: false, message: 'UID already whitelisted' });

    const expDays = duration === 'monthly' ? 30 : duration === 'weekly' ? 7 : duration === 'fifteen_day' ? 15 : 1;
    const licenseKey = `${expDays}day-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + expDays * 86400000);

    db.uids = db.uids || [];
    db.uids.push({ _id: 'uid-' + Date.now(), uid, resellerId: String(reseller._id), resellerName: reseller.name, duration: duration || 'daily', status: 'active', licenseKey, expiresAt, createdAt: new Date() });
    reseller.uidUsed = (reseller.uidUsed || 0) + 1;

    res.json({ success: true, data: { uid, duration: duration || 'daily', license_key: licenseKey, expires_at: expiresAt.toISOString().split('T')[0] + ' 23:59:59' }, message: 'UID whitelisted!' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// PUBLIC - Get reseller info
router.post('/public-info', async (req, res) => {
  try {
    const { resellerToken } = req.body;
    if (!resellerToken) return res.status(400).json({ success: false, message: 'Token required' });
    let resellerData;
    try {
      const decoded = jwt.verify(resellerToken, JWT_SECRET);
      if (decoded.role !== 'reseller') return res.status(403).json({ success: false, message: 'Invalid' });
      resellerData = decoded;
    } catch { return res.status(401).json({ success: false, message: 'Invalid token' }); }

    let reseller;
    if (req.isDemoMode) {
      reseller = (req.demoDB.resellers || []).find(r => r._id === resellerData.id);
    } else {
      const Reseller = require('../models/Reseller');
      reseller = await Reseller.findById(resellerData.id).select('-password -gtcApiKey');
    }
    if (!reseller) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: { name: reseller.name, uidLimit: reseller.uidLimit, uidUsed: reseller.uidUsed, isActive: reseller.isActive } });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// ADMIN - Get ALL UIDs across all resellers
router.get('/admin/all-uids', async (req, res) => {
  try {
    const db = getDemoDB(req);
    const uids = db.uids || [];
    res.json({ success: true, data: uids });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// ADMIN - Ban any UID
router.post('/admin/ban-uid', async (req, res) => {
  try {
    const { uid, reason } = req.body;
    const db = getDemoDB(req);
    const uidEntry = (db.uids || []).find(u => u.uid === uid);
    if (!uidEntry) return res.status(404).json({ success: false, message: 'UID not found' });
    uidEntry.status = 'banned';
    uidEntry.bannedAt = new Date();
    uidEntry.banReason = reason || 'Banned by admin';
    res.json({ success: true, message: 'UID banned' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// ADMIN - Unban any UID
router.post('/admin/unban-uid', async (req, res) => {
  try {
    const { uid } = req.body;
    const db = getDemoDB(req);
    const uidEntry = (db.uids || []).find(u => u.uid === uid);
    if (!uidEntry) return res.status(404).json({ success: false, message: 'UID not found' });
    uidEntry.status = 'active';
    uidEntry.bannedAt = null;
    uidEntry.banReason = '';
    res.json({ success: true, message: 'UID unbanned' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// ADMIN - Delete any UID
router.delete('/admin/uid/:uid', async (req, res) => {
  try {
    const db = getDemoDB(req);
    const idx = (db.uids || []).findIndex(u => u.uid === req.params.uid);
    if (idx === -1) return res.status(404).json({ success: false, message: 'UID not found' });
    db.uids.splice(idx, 1);
    res.json({ success: true, message: 'UID deleted' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

// ADMIN - Add UID directly
router.post('/admin/add-uid', async (req, res) => {
  try {
    const { uid, resellerId, duration } = req.body;
    if (!uid) return res.status(400).json({ success: false, message: 'UID required' });

    let resellerName = 'Admin';
    if (resellerId) {
      let reseller;
      if (req.isDemoMode) {
        reseller = (req.demoDB.resellers || []).find(r => r._id === resellerId);
      } else {
        const Reseller = require('../models/Reseller');
        reseller = await Reseller.findById(resellerId);
      }
      if (reseller) resellerName = reseller.name;
    }

    const db = getDemoDB(req);
    const existingUID = (db.uids || []).find(u => u.uid === uid && u.status === 'active');
    if (existingUID) return res.status(400).json({ success: false, message: 'UID already whitelisted' });

    const expDays = duration === 'monthly' ? 30 : duration === 'weekly' ? 7 : duration === 'fifteen_day' ? 15 : 1;
    const licenseKey = `${expDays}day-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + expDays * 86400000);

    db.uids = db.uids || [];
    db.uids.push({ _id: 'uid-' + Date.now(), uid, resellerId: resellerId || 'admin', resellerName, duration: duration || 'daily', status: 'active', licenseKey, expiresAt, createdAt: new Date() });

    res.json({ success: true, data: { uid, license_key: licenseKey, expires_at: expiresAt.toISOString().split('T')[0] + ' 23:59:59' }, message: 'UID added successfully' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
});

module.exports = router;
