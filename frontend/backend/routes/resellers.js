const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const router = express.Router();

const GTC_BASE = 'https://gtccheats.xyz/Api/uidbypassapi/api_user.php';
const JWT_SECRET = process.env.JWT_SECRET || 'visionx-reseller-secret';

function generateToken(reseller) {
  return jwt.sign({ id: reseller._id, email: reseller.email, role: 'reseller' }, JWT_SECRET, { expiresIn: '30d' });
}

function authMiddleware(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'reseller') return res.status(403).json({ success: false, message: 'Access denied' });
    req.reseller = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
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
    try { return JSON.parse(text); } catch { return { success: false, error: 'Invalid API response: ' + text.substring(0, 200) }; }
  } catch (err) {
    return { success: false, error: 'Network error: ' + err.message };
  }
}

// Reseller Login
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
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

    const expDays = duration === 'monthly' ? 30 : duration === 'weekly' ? 7 : duration === 'fifteen_day' ? 15 : 1;
    const data = await gtcRequest('add', reseller.gtcApiKey, { account_id: parseInt(uid), for_days: expDays });

    if (data.success) {
      if (req.isDemoMode) {
        reseller.uidUsed = (reseller.uidUsed || 0) + 1;
      } else {
        const Reseller = require('../models/Reseller');
        await Reseller.findByIdAndUpdate(reseller._id, { $inc: { uidUsed: 1 }, lastActive: new Date() });
      }
      res.json({ success: true, data: data.data, message: 'UID whitelisted successfully' });
    } else {
      if (req.isDemoMode) {
        reseller.uidUsed = (reseller.uidUsed || 0) + 1;
        const expDays = duration === 'monthly' ? 30 : duration === 'weekly' ? 7 : duration === 'fifteen_day' ? 15 : 1;
        return res.json({ success: true, data: { uid, duration: duration || 'daily', cost: 0, expires_at: new Date(Date.now() + expDays * 86400000).toISOString().split('T')[0] + ' 23:59:59', action: 'created', license_key: `${expDays}day-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, license_key_generated: true }, message: 'UID whitelisted successfully (Demo)' });
      }
      res.status(400).json({ success: false, message: data.error || data.message || 'GTC API error', data: data.data });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// Check UID Status
router.get('/check/:uid', authMiddleware, async (req, res) => {
  try {
    let reseller;
    if (req.isDemoMode) {
      reseller = (req.demoDB.resellers || []).find(r => r._id === req.reseller.id);
    } else {
      const Reseller = require('../models/Reseller');
      reseller = await Reseller.findById(req.reseller.id);
    }
    if (!reseller) return res.status(404).json({ success: false, message: 'Reseller not found' });

    const data = await gtcRequest('info', reseller.gtcApiKey, { account_id: req.params.uid }, 'GET');
    if (!data.success && req.isDemoMode) {
      return res.json({ success: true, data: { uid: req.params.uid, status: 'active', allowed: true, expires_at: '2026-07-24 23:59:59', time_remaining: '30 days', license_key: `7day-${Math.random().toString(36).substring(2,8).toUpperCase()}`, license_key_status: 'active' } });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
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
      return res.json({ success: true, data: { balance: 25.00, currency: 'USD', last_updated: new Date().toISOString() } });
    }
    res.json({ success: true, data: { balance: 0, currency: 'USD', message: 'Balance check not available via API' } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get Key Pricing
router.get('/pricing', authMiddleware, async (req, res) => {
  try {
    let reseller;
    if (req.isDemoMode) {
      reseller = (req.demoDB.resellers || []).find(r => r._id === req.reseller.id);
    } else {
      const Reseller = require('../models/Reseller');
      reseller = await Reseller.findById(req.reseller.id);
    }
    if (!reseller) return res.status(404).json({ success: false, message: 'Reseller not found' });

    const data = await gtcRequest('key_pricing', reseller.gtcApiKey);
    if (!data.success && req.isDemoMode) {
      return res.json({ success: true, data: { pricing: { daily_per_key: 0.50, weekly_per_key: 2.00, fifteen_day_per_key: 5.00, monthly_per_key: 8.00 }, currency: 'USD' } });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get Available Key Types
router.get('/key-types', authMiddleware, async (req, res) => {
  try {
    let reseller;
    if (req.isDemoMode) {
      reseller = (req.demoDB.resellers || []).find(r => r._id === req.reseller.id);
    } else {
      const Reseller = require('../models/Reseller');
      reseller = await Reseller.findById(req.reseller.id);
    }
    if (!reseller) return res.status(404).json({ success: false, message: 'Reseller not found' });

    const data = await gtcRequest('available_key_types', reseller.gtcApiKey);
    if (!data.success && req.isDemoMode) {
      return res.json({ success: true, data: { total_key_types: 4, key_types: [{ key_type: 'daily', display_name: 'Daily (24h)', duration_hours: 24 }, { key_type: 'weekly', display_name: 'Weekly (168h)', duration_hours: 168 }, { key_type: 'fifteen_day', display_name: '15-Day (360h)', duration_hours: 360 }, { key_type: 'monthly', display_name: 'Monthly (720h)', duration_hours: 720 }] } });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get UID History
router.get('/history', authMiddleware, async (req, res) => {
  try {
    let reseller;
    if (req.isDemoMode) {
      reseller = (req.demoDB.resellers || []).find(r => r._id === req.reseller.id);
    } else {
      const Reseller = require('../models/Reseller');
      reseller = await Reseller.findById(req.reseller.id);
    }
    if (!reseller) return res.status(404).json({ success: false, message: 'Reseller not found' });

    const { limit, key_type, status } = req.query;
    const data = await gtcRequest('uid_history', reseller.gtcApiKey, { limit: limit || 50, key_type, status });
    if (!data.success && req.isDemoMode) {
      return res.json({ success: true, data: { total_records: 3, data: [
        { key_id: 'DEMO-001', key_type: 'weekly', duration_hours: 168, cost: 2.00, status: 'active', created_at: '2026-06-20 10:00:00', expires_at: '2026-06-27 10:00:00', license_key: '7day-DEMO01', license_key_status: 'active' },
        { key_id: 'DEMO-002', key_type: 'daily', duration_hours: 24, cost: 0.50, status: 'expired', created_at: '2026-06-18 14:00:00', expires_at: '2026-06-19 14:00:00', license_key: '1day-DEMO02', license_key_status: 'expired' },
        { key_id: 'DEMO-003', key_type: 'monthly', duration_hours: 720, cost: 8.00, status: 'active', created_at: '2026-06-22 08:00:00', expires_at: '2026-07-22 08:00:00', license_key: '30day-DEMO3', license_key_status: 'active' },
      ] } });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Check License Key Status
router.get('/license/:key', authMiddleware, async (req, res) => {
  try {
    let reseller;
    if (req.isDemoMode) {
      reseller = (req.demoDB.resellers || []).find(r => r._id === req.reseller.id);
    } else {
      const Reseller = require('../models/Reseller');
      reseller = await Reseller.findById(req.reseller.id);
    }
    if (!reseller) return res.status(404).json({ success: false, message: 'Reseller not found' });

    const data = await gtcRequest('license_key_status', reseller.gtcApiKey, { license_key: req.params.key });
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUBLIC - Whitelist UID (customer uses reseller's shareable token)
router.post('/public-whitelist', async (req, res) => {
  try {
    const { uid, duration, resellerToken } = req.body;
    if (!uid || !resellerToken) return res.status(400).json({ success: false, message: 'UID and reseller token required' });

    let resellerData;
    try {
      const decoded = jwt.verify(resellerToken, JWT_SECRET);
      if (decoded.role !== 'reseller') return res.status(403).json({ success: false, message: 'Invalid token' });
      resellerData = decoded;
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired reseller token' });
    }

    let reseller;
    if (req.isDemoMode) {
      reseller = (req.demoDB.resellers || []).find(r => r._id === resellerData.id);
    } else {
      const Reseller = require('../models/Reseller');
      reseller = await Reseller.findById(resellerData.id);
    }

    if (!reseller) return res.status(404).json({ success: false, message: 'Reseller not found' });
    if (!reseller.isActive) return res.status(403).json({ success: false, message: 'Reseller account suspended' });
    if (reseller.uidLimit !== -1 && reseller.uidUsed >= reseller.uidLimit) {
      return res.status(403).json({ success: false, message: 'UID limit reached. Contact reseller.' });
    }

    const expDays2 = duration === 'monthly' ? 30 : duration === 'weekly' ? 7 : duration === 'fifteen_day' ? 15 : 1;
    const data = await gtcRequest('add', reseller.gtcApiKey, { account_id: parseInt(uid), for_days: expDays2 });

    if (data.success) {
      if (req.isDemoMode) {
        reseller.uidUsed = (reseller.uidUsed || 0) + 1;
      } else {
        const Reseller = require('../models/Reseller');
        await Reseller.findByIdAndUpdate(reseller._id, { $inc: { uidUsed: 1 }, lastActive: new Date() });
      }
      res.json({ success: true, data: data.data, message: 'UID whitelisted successfully!' });
    } else {
      if (req.isDemoMode) {
        reseller.uidUsed = (reseller.uidUsed || 0) + 1;
        const expDays = duration === 'monthly' ? 30 : duration === 'weekly' ? 7 : duration === 'fifteen_day' ? 15 : 1;
        return res.json({ success: true, data: { uid, duration: duration || 'daily', cost: 0, expires_at: new Date(Date.now() + expDays * 86400000).toISOString().split('T')[0] + ' 23:59:59', action: 'created', license_key: `${expDays}day-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, license_key_generated: true }, message: 'UID whitelisted successfully! (Demo)' });
      }
      res.status(400).json({ success: false, message: data.error || data.message || 'Failed to whitelist UID', data: data.data });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// PUBLIC - Check reseller info by token
router.post('/public-info', async (req, res) => {
  try {
    const { resellerToken } = req.body;
    if (!resellerToken) return res.status(400).json({ success: false, message: 'Token required' });

    let resellerData;
    try {
      const decoded = jwt.verify(resellerToken, JWT_SECRET);
      if (decoded.role !== 'reseller') return res.status(403).json({ success: false, message: 'Invalid token' });
      resellerData = decoded;
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    let reseller;
    if (req.isDemoMode) {
      reseller = (req.demoDB.resellers || []).find(r => r._id === resellerData.id);
    } else {
      const Reseller = require('../models/Reseller');
      reseller = await Reseller.findById(resellerData.id).select('-password -gtcApiKey');
    }

    if (!reseller) return res.status(404).json({ success: false, message: 'Reseller not found' });
    res.json({ success: true, data: { name: reseller.name, uidLimit: reseller.uidLimit, uidUsed: reseller.uidUsed, isActive: reseller.isActive } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ADMIN - Whitelist UID using reseller's API key
router.post('/admin-whitelist', async (req, res) => {
  try {
    const { resellerId, uid, duration } = req.body;
    if (!resellerId || !uid) return res.status(400).json({ success: false, message: 'Reseller ID and UID required' });

    let reseller;
    if (req.isDemoMode) {
      reseller = (req.demoDB.resellers || []).find(r => r._id === resellerId);
    } else {
      const Reseller = require('../models/Reseller');
      reseller = await Reseller.findById(resellerId);
    }

    if (!reseller) return res.status(404).json({ success: false, message: 'Reseller not found' });
    if (reseller.uidLimit !== -1 && reseller.uidUsed >= reseller.uidLimit) {
      return res.status(403).json({ success: false, message: `UID limit reached (${reseller.uidUsed}/${reseller.uidLimit})` });
    }

    const expDays3 = duration === 'monthly' ? 30 : duration === 'weekly' ? 7 : duration === 'fifteen_day' ? 15 : 1;
    const data = await gtcRequest('add', reseller.gtcApiKey, { account_id: parseInt(uid), for_days: expDays3 });

    if (data.success) {
      if (req.isDemoMode) {
        reseller.uidUsed = (reseller.uidUsed || 0) + 1;
      } else {
        const Reseller = require('../models/Reseller');
        await Reseller.findByIdAndUpdate(reseller._id, { $inc: { uidUsed: 1 }, lastActive: new Date() });
      }
      res.json({ success: true, data: data.data, message: 'UID whitelisted successfully!' });
    } else {
      if (req.isDemoMode) {
        reseller.uidUsed = (reseller.uidUsed || 0) + 1;
        const expDays = duration === 'monthly' ? 30 : duration === 'weekly' ? 7 : duration === 'fifteen_day' ? 15 : 1;
        return res.json({ success: true, data: { uid, duration: duration || 'daily', cost: 0, expires_at: new Date(Date.now() + expDays * 86400000).toISOString().split('T')[0] + ' 23:59:59', license_key: `${expDays}day-${Math.random().toString(36).substring(2, 8).toUpperCase()}` }, message: 'UID whitelisted successfully! (Demo)' });
      }
      res.status(400).json({ success: false, message: data.error || data.message || 'GTC API error', data: data.data });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
module.exports.JWT_SECRET = JWT_SECRET;
