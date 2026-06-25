const express = require('express');
const crypto = require('crypto');
const md5 = require('md5');

const router = express.Router();

router.post('/generate-key', async (req, res) => {
  try {
    const { panelId, username } = req.body;
    if (!panelId) return res.status(400).json({ success: false, message: 'Panel ID required' });

    let panel;
    if (req.isDemoMode) {
      panel = (req.demoDB.freePanels || []).find(p => p._id === panelId);
    } else {
      const FreePanel = require('../models/FreePanel');
      panel = await FreePanel.findById(panelId);
    }

    if (!panel) return res.status(404).json({ success: false, message: 'Panel not found' });
    if (!panel.sellerApiLink) return res.status(400).json({ success: false, message: 'No seller API configured for this panel' });

    const generatedUsername = username || ('VX-' + Math.random().toString(36).substring(2, 8).toUpperCase());
    const licenseDur = panel.licenseDuration || 1;
    const sellerApiLink = panel.sellerApiLink;

    if (sellerApiLink.includes('/api/seller/')) {
      const url = new URL(sellerApiLink);
      url.searchParams.set('expiry', String(licenseDur));
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { success: true, license: text.trim() };
      }

      const key = data.license || data.key || data.session || data.data || (typeof data === 'string' ? data : '');
      if (key) {
        res.json({
          success: true,
          data: {
            username: generatedUsername,
            key: key,
            duration: licenseDur,
          },
        });
      } else {
        return res.status(500).json({ success: false, message: data.message || data.error || 'KeyAuth seller API failed: No key returned' });
      }
    } else {
      const ownerid = panel.sellerOwner || 'DD3EccXCXj';
      const secret = panel.sellerKey || '';
      const appName = panel.sellerAppName || 'VISION X';
      const version = panel.sellerVersion || '1.0';

      const initBody = new URLSearchParams({ type: 'init', ver: version, name: appName, ownerid, secret });
      const initRes = await fetch(sellerApiLink, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: initBody.toString(),
      });
      const initData = await initRes.json();

      if (!initData.success) {
        return res.status(500).json({ success: false, message: 'KeyAuth init failed: ' + (initData.message || 'Unknown error') });
      }

      const sessionid = initData.sessionid;
      const generatedKey = md5(crypto.randomBytes(16).toString('hex'));
      const expirySeconds = licenseDur * 86400;

      const addBody = new URLSearchParams({
        type: 'addUser', sessionid, ownerid, secret,
        username: generatedUsername, key: generatedKey,
        expiry: String(expirySeconds), subs: '0', hwid: '', name: '', email: '', password: '',
      });
      const addRes = await fetch(sellerApiLink, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: addBody.toString(),
      });
      const addData = await addRes.json();

      if (!addData.success) {
        return res.status(500).json({ success: false, message: 'Failed to create key: ' + (addData.message || 'Unknown error') });
      }

      res.json({
        success: true,
        data: {
          username: generatedUsername,
          key: generatedKey,
          duration: licenseDur,
        },
      });
    }
  } catch (error) {
    console.error('KeyAuth generate-key error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

router.post('/verify-key', async (req, res) => {
  try {
    const { panelId, key, hwid } = req.body;
    if (!panelId || !key) return res.status(400).json({ success: false, message: 'Panel ID and key required' });

    let panel;
    if (req.isDemoMode) {
      panel = (req.demoDB.freePanels || []).find(p => p._id === panelId);
    } else {
      const FreePanel = require('../models/FreePanel');
      panel = await FreePanel.findById(panelId);
    }

    if (!panel || !panel.sellerApiLink) {
      return res.status(400).json({ success: false, message: 'Seller API not configured' });
    }

    res.json({ success: true, data: { key, panelId, verified: true } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
