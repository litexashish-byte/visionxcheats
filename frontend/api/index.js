const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const backendPath = path.join(__dirname, '..', 'backend');
process.chdir(backendPath);

const dotenv = require('dotenv');
dotenv.config({ path: path.join(backendPath, '.env') });

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Try MongoDB connection, fallback to demo mode if it fails
global.isDemoMode = true;
global._mongoReady = false;
if (process.env.MONGODB_URI) {
  const mongoose = require('mongoose');
  mongoose.set('bufferCommands', false);
  mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  }).then(() => {
    global.isDemoMode = false;
    global._mongoReady = true;
    console.log('[DB] MongoDB connected - PRODUCTION mode');
  }).catch((e) => {
    global.isDemoMode = true;
    global._mongoReady = false;
    console.log('[DB] MongoDB failed, using DEMO mode:', e.message);
  });
}

// ========== DEMO DB with persistence ==========
function makeId(prefix) { return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6); }
const DB_FILE = '/tmp/visionx-db.json';

function loadFromFile() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const data = JSON.parse(raw);
      // Revive Date objects
      const revive = (obj) => {
        if (obj && typeof obj === 'object') {
          if (obj.__t === 'Date' && obj.v) return new Date(obj.v);
          for (const k of Object.keys(obj)) obj[k] = revive(obj[k]);
        }
        return obj;
      };
      revive(data);
      return data;
    }
  } catch (e) { /* ignore */ }
  return null;
}

function saveToFile(db) {
  try {
    const clone = JSON.parse(JSON.stringify(db, (k, v) => {
      if (v instanceof Date) return { __t: 'Date', v: v.toISOString() };
      if (typeof v === 'function') return undefined;
      return v;
    }));
    fs.writeFileSync(DB_FILE, JSON.stringify(clone), 'utf8');
  } catch (e) { /* ignore */ }
}

function createSeedDB() {
  return {
    settings: {
      siteName: 'VISION X CHEATS', siteDescription: 'Your trusted source for premium digital panels',
      maintenanceMode: false, allowRegistration: true,
      discordLink: 'https://discord.gg/visionxstore', youtubeLink: 'https://youtube.com/@visionxstore',
      instagramLink: 'https://instagram.com/visionxstore', whatsappLink: 'https://wa.me/919999999999',
      telegramLink: 'https://t.me/visionxstore',
    },
    users: [
      { _id: 'admin-user-1', username: 'admin', email: 'litexashish@gmail.com', password: 'Ashish@2025', role: 'admin', isBanned: false, avatar: '/logo.png', downloadHistory: [], savedLicenses: [], createdAt: new Date(), updatedAt: new Date() },
    ],
    freePanels: [
      { _id: 'panel-1', name: 'ESP Pro Max', description: 'Advanced external ESP panel with wallhack, glow, and radar features.', image: '', version: '3.1.0', category: 'EXTERNAL-ESP-MAX', downloadLink: 'https://example.com/downloads/esp-pro-max.zip', shortenerLink: 'https://shorter.link/esp-max', keyLink: '', videoLink: '', isFeatured: true, isActive: true, downloadCount: 28450, rating: 4.8, totalRatings: 1560, tags: ['esp', 'wallhack'], author: 'VisionX Admin', updatedAt: new Date(), createdAt: new Date() },
      { _id: 'panel-2', name: 'ESP Lite', description: 'Lightweight external ESP panel with essential features.', image: '', version: '2.2.0', category: 'EXTERNAL-ESP-BASIC', downloadLink: 'https://example.com/downloads/esp-lite.zip', shortenerLink: 'https://shorter.link/esp-basic', keyLink: '', videoLink: '', isFeatured: true, isActive: true, downloadCount: 19200, rating: 4.5, totalRatings: 980, tags: ['esp', 'basic'], author: 'Dev Team', updatedAt: new Date(), createdAt: new Date() },
      { _id: 'panel-3', name: 'Streamer Mode Pro', description: 'Professional streamer panel with anti-stream-snipe protection.', image: '', version: '4.0.0', category: 'STREAMER-PANEL', downloadLink: 'https://example.com/downloads/streamer-pro.zip', shortenerLink: 'https://shorter.link/streamer', keyLink: '', videoLink: '', isFeatured: true, isActive: true, downloadCount: 35800, rating: 4.9, totalRatings: 2100, tags: ['streamer', 'obs'], author: 'StreamerPro', updatedAt: new Date(), createdAt: new Date() },
      { _id: 'panel-4', name: 'Aimbot Visible Check', description: 'Smart aimbot panel with visible-only targeting.', image: '', version: '2.8.1', category: 'AIMBOT-VISIBLE', downloadLink: 'https://example.com/downloads/aimbot-visible.zip', shortenerLink: 'https://shorter.link/aimbot-vis', keyLink: '', videoLink: '', isFeatured: false, isActive: true, downloadCount: 42100, rating: 4.7, totalRatings: 3200, tags: ['aimbot', 'visible'], author: 'Aimbot Labs', updatedAt: new Date(), createdAt: new Date() },
      { _id: 'panel-5', name: 'UID Bypass Tool', description: 'Advanced UID bypass panel for evading hardware and IP bans.', image: '', version: '1.9.5', category: 'UID-BYPASS', downloadLink: 'https://example.com/downloads/uid-bypass.zip', shortenerLink: 'https://shorter.link/uid-bypass', keyLink: '', videoLink: '', isFeatured: true, isActive: true, downloadCount: 56700, rating: 4.6, totalRatings: 4500, tags: ['uid', 'bypass'], author: 'Security Team', updatedAt: new Date(), createdAt: new Date() },
    ],
    paidPanels: [
      { _id: 'paid-1', name: 'ESP Max Premium', description: 'Premium ESP panel with all features unlocked.', image: '', price: 29.99, originalPrice: 59.99, features: ['All ESP features', 'Priority updates', '24/7 support', 'Custom config', 'Lifetime access'], category: 'EXTERNAL-ESP-MAX', contactDiscord: '', contactTelegram: '', isFeatured: true, isActive: true, salesCount: 856, rating: 4.8, totalRatings: 234, tags: ['esp', 'premium'], author: 'VisionX Premium', updatedAt: new Date(), createdAt: new Date() },
      { _id: 'paid-2', name: 'Aimbot Pro + UID', description: 'Advanced aimbot with visible check, plus UID bypass module.', image: '', price: 34.99, originalPrice: 69.99, features: ['Aimbot visible check', 'UID bypass module', 'Smooth aim settings', 'Anti-detection', 'Lifetime updates'], category: 'AIMBOT-VISIBLE', contactDiscord: '', contactTelegram: '', isFeatured: true, isActive: true, salesCount: 543, rating: 4.7, totalRatings: 178, tags: ['aimbot', 'uid'], author: 'Aimbot Pro Team', updatedAt: new Date(), createdAt: new Date() },
      { _id: 'paid-3', name: 'Streamer + Emulator Bundle', description: 'Complete streamer protection and emulator bypass bundle.', image: '', price: 44.99, originalPrice: 89.99, features: ['Streamer protection', 'Emulator bypass', 'OBS integration', 'Anti-snipe', 'Premium support'], category: 'STREAMER-PANEL', contactDiscord: '', contactTelegram: '', isFeatured: false, isActive: true, salesCount: 321, rating: 4.6, totalRatings: 98, tags: ['streamer', 'emulator'], author: 'Bundle Team', updatedAt: new Date(), createdAt: new Date() },
    ],
    resellers: [
      { _id: 'reseller-1', name: 'Demo Reseller', email: 'reseller@demo.com', password: 'demo123', gtcApiKey: 'GTCAPI-0E9C83D81E2942CACE91A4AF6C86313E', uidLimit: 50, uidUsed: 5, isActive: true, allowedKeyTypes: ['daily', 'weekly', 'monthly'], totalEarnings: 25.00, createdAt: new Date(), updatedAt: new Date() },
    ],
    uids: [
      { _id: 'uid-demo-1', uid: '1001234567', resellerId: 'reseller-1', resellerName: 'Demo Reseller', duration: 'daily', status: 'active', licenseKey: '1day-ABC123', expiresAt: new Date(Date.now() + 86400000), createdAt: new Date() },
    ],
    licenses: [],
    downloads: [],
    ratings: [],
    resellProducts: [
      { _id: 'rp-1', name: 'ESP Pro Max - Resell', description: 'Resell ESP Pro Max with your own pricing.', category: 'paid', originalPrice: 29.99, resellPrice: 15.00, minResellPrice: 10.00, keyauthAppName: 'ESP PRO', keyauthOwner: 'DD3EccXCXj', keyauthSecret: 'abc123', licenseDuration: 30, features: ['Full ESP', 'Wallhack', 'Glow', 'Radar'], totalSales: 45, totalRevenue: 675.00, isActive: true, linkedPanelId: 'panel-1', linkedPanelType: 'free', image: '', createdAt: new Date(), updatedAt: new Date() },
      { _id: 'rp-2', name: 'Aimbot Pro - Resell', description: 'Resell Aimbot Pro with custom pricing.', category: 'paid', originalPrice: 34.99, resellPrice: 20.00, minResellPrice: 12.00, keyauthAppName: 'AIMBOT PRO', keyauthOwner: 'DD3EccXCXj', keyauthSecret: 'def456', licenseDuration: 30, features: ['Aimbot', 'Visible Check', 'Smooth Aim'], totalSales: 32, totalRevenue: 640.00, isActive: true, linkedPanelId: 'paid-2', linkedPanelType: 'paid', image: '', createdAt: new Date(), updatedAt: new Date() },
    ],
    resellCombos: [
      { _id: 'rc-1', name: 'Starter Combo', description: 'ESP Pro Max + Aimbot Pro combo at discounted price.', products: [{ productId: 'rp-1', productName: 'ESP Pro Max - Resell' }, { productId: 'rp-2', productName: 'Aimbot Pro - Resell' }], originalPrice: 54.98, comboPrice: 30.00, minResellPrice: 20.00, discount: 45, totalSales: 24, totalRevenue: 720.00, isActive: true, badge: 'BEST VALUE', features: ['ESP Pro Max', 'Aimbot Pro', 'Save 45%'], image: '', createdAt: new Date(), updatedAt: new Date() },
    ],
    uidBypassResells: [
      { _id: 'ub-1', name: 'UID Bypass Daily', description: '24-hour UID bypass access.', gtcApiKey: 'GTCAPI-0E9C83D81E2942CACE91A4AF6C86313E', gtcApiLink: 'https://gtccheats.xyz/Api/uidbypassapi/api_user.php', resellPrice: 5.00, minResellPrice: 3.00, gtcCostPerDay: 1.00, durationOptions: [{ days: 1, price: 5.00, label: '1 Day' }, { days: 7, price: 25.00, label: '7 Days' }, { days: 30, price: 80.00, label: '30 Days' }], features: ['24/7 UID Bypass', 'Instant Activation'], totalSales: 89, totalRevenue: 445.00, isActive: true, maxUids: -1, currentUids: 0, image: '', createdAt: new Date(), updatedAt: new Date() },
    ],
  };
}

function attachMethods(db) {
  db._save = function() { saveToFile(this); };
  db.findUserByEmail = function(e) { return this.users.find(u => u.email === e); };
  db.findUserById = function(id) { return this.users.find(u => u._id === id); };
  db.findUserByUsername = function(u) { return this.users.find(x => x.username === u); };
  db.createUser = function(d) {
    const u = { _id: makeId('user'), ...d, role: 'user', isBanned: false, avatar: '', downloadHistory: [], savedLicenses: [], createdAt: new Date(), updatedAt: new Date() };
    this.users.push(u); this._save(); return u;
  };
  db.getUsers = function() { return this.users.map(({ password, ...r }) => r); };
  db.getStats = function() {
    return { totalUsers: this.users.length, totalDownloads: this.downloads.filter(d => d.downloadCompleted).length, freePanelCount: this.freePanels.filter(p => p.isActive).length, paidPanelCount: this.paidPanels.filter(p => p.isActive).length, totalLicenses: this.licenses.length, activeLicenses: this.licenses.filter(l => l.isActive && !l.isDisabled).length, todayUsers: 0, todayDownloads: 0 };
  };
  db.recordDownload = function(panelId, panelName, userId) {
    const d = { _id: makeId('dl'), panelId, panelName, userId, shortenerCompleted: true, downloadCompleted: true, createdAt: new Date(), updatedAt: new Date() };
    this.downloads.push(d); this._save(); return d;
  };
  db.getDownloadHistory = function(userId) { return this.downloads.filter(d => d.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); };
  db.getFreePanels = function(filter = {}) {
    try {
      let panels = Array.isArray(this.freePanels) ? [...this.freePanels] : [];
      if (filter.isActive) panels = panels.filter(p => p && p.isActive);
      if (filter.category) panels = panels.filter(p => p && p.category === filter.category);
      if (filter.isFeatured) panels = panels.filter(p => p && p.isFeatured);
      if (filter.search) { const s = String(filter.search).toLowerCase(); panels = panels.filter(p => p && p.name && p.name.toLowerCase().includes(s)); }
      return panels;
    } catch (e) { return []; }
  };
  db.getPaidPanels = function(filter = {}) {
    try {
      let panels = Array.isArray(this.paidPanels) ? [...this.paidPanels] : [];
      if (filter.isActive) panels = panels.filter(p => p && p.isActive);
      if (filter.category) panels = panels.filter(p => p && p.category === filter.category);
      if (filter.isFeatured) panels = panels.filter(p => p && p.isFeatured);
      if (filter.search) { const s = String(filter.search).toLowerCase(); panels = panels.filter(p => p && p.name && p.name.toLowerCase().includes(s)); }
      return panels;
    } catch (e) { return []; }
  };
  db.findFreePanelById = function(id) { return this.freePanels.find(p => p._id === id); };
  db.findPaidPanelById = function(id) { return this.paidPanels.find(p => p._id === id); };
  db.createFreePanel = function(data) { const p = { _id: makeId('fp'), ...data, downloadCount: 0, rating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date() }; this.freePanels.push(p); this._save(); return p; };
  db.addFreePanel = function(data) { return this.createFreePanel(data); };
  db.updateFreePanel = function(id, data) { const idx = this.freePanels.findIndex(p => p._id === id); if (idx === -1) return null; this.freePanels[idx] = { ...this.freePanels[idx], ...data, updatedAt: new Date() }; this._save(); return this.freePanels[idx]; };
  db.deleteFreePanel = function(id) { this.freePanels = this.freePanels.filter(p => p._id !== id); this._save(); return true; };
  db.createPaidPanel = function(data) { const p = { _id: makeId('pp'), ...data, salesCount: 0, rating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date() }; this.paidPanels.push(p); this._save(); return p; };
  db.addPaidPanel = function(data) { return this.createPaidPanel(data); };
  db.updatePaidPanel = function(id, data) { const idx = this.paidPanels.findIndex(p => p._id === id); if (idx === -1) return null; this.paidPanels[idx] = { ...this.paidPanels[idx], ...data, updatedAt: new Date() }; this._save(); return this.paidPanels[idx]; };
  db.deletePaidPanel = function(id) { this.paidPanels = this.paidPanels.filter(p => p._id !== id); this._save(); return true; };
  db.getUserRating = function(userId, panelId) { const r = this.ratings.find(r => r.userId === userId && r.panelId === panelId); return r ? r.rating : 0; };
  db.addUserRating = function(userId, panelId, panelType, rating) { this.ratings.push({ _id: makeId('rating'), userId, panelId, panelType, rating, createdAt: new Date() }); this._save(); };
  db.deleteRating = function(id) { this.ratings = this.ratings.filter(r => r._id !== id); this._save(); return true; };
  db.getAllRatings = function() { return this.ratings; };
  db.generateLicense = function(data) {
    const key = 'VX-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const license = { _id: makeId('lic'), key, ...data, isActive: true, isDisabled: false, createdAt: new Date(), updatedAt: new Date() };
    this.licenses.push(license); this._save(); return license;
  };
  // Ensure arrays exist
  if (!db.resellers) db.resellers = [];
  if (!db.uids) db.uids = [];
  if (!db.licenses) db.licenses = [];
  if (!db.downloads) db.downloads = [];
  if (!db.ratings) db.ratings = [];
  if (!db.resellProducts) db.resellProducts = [];
  if (!db.resellCombos) db.resellCombos = [];
  if (!db.uidBypassResells) db.uidBypassResells = [];
  return db;
}

// Restore or create DB (prioritize globalThis > /tmp > seed)
if (!globalThis.demoDB) {
  const fromFile = loadFromFile();
  if (fromFile) {
    console.log('[DB] Restored from /tmp file');
    globalThis.demoDB = attachMethods(fromFile);
  } else {
    console.log('[DB] Created fresh seed data');
    globalThis.demoDB = attachMethods(createSeedDB());
  }
}
const demoDB = globalThis.demoDB;
// ========== END DEMO DB ==========

// Middleware
app.use((req, res, next) => {
  req.isDemoMode = global.isDemoMode;
  req.demoDB = global.isDemoMode ? demoDB : null;
  req.siteSettings = global.isDemoMode ? { ...demoDB.settings } : {};
  next();
});

// Settings endpoint
app.get('/api/settings', async (req, res) => {
  try {
    if (global.isDemoMode) {
      const s = demoDB.settings;
      return res.json({ success: true, data: s });
    }
    const Settings = require('../backend/models/Settings');
    const settings = await Settings.findOne();
    res.json({ success: true, data: settings || demoDB.settings });
  } catch (e) {
    res.json({ success: true, data: demoDB.settings });
  }
});

// Health
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'VISION X CHEATS API', mode: global.isDemoMode ? 'demo' : 'production', timestamp: new Date().toISOString(), routes: loadedRoutes.length, demoPanelsCount: global.isDemoMode ? demoDB.freePanels.length : 'N/A' });
});

// Debug: test freePanels directly
app.get('/api/debug/free-panels-test', (req, res) => {
  try {
    if (!global.isDemoMode) return res.json({ success: false, message: 'Not demo mode' });
    const panels = demoDB.getFreePanels({ isActive: true });
    res.json({ success: true, count: panels.length, names: panels.map(p => p.name) });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, stack: e.stack });
  }
});

// Load routes
const loadedRoutes = [];
const failedRoutes = [];
const routeFiles = [
  ['/api/auth', '../backend/routes/auth'],
  ['/api/free-panels', '../backend/routes/freePanels'],
  ['/api/paid-panels', '../backend/routes/paidPanels'],
  ['/api/users', '../backend/routes/users'],
  ['/api/licenses', '../backend/routes/licenses'],
  ['/api/downloads', '../backend/routes/downloads'],
  ['/api/upload', '../backend/routes/upload'],
  ['/api/ratings', '../backend/routes/ratings'],
  ['/api/keyauth', '../backend/routes/keyauth'],
  ['/api/resellers', '../backend/routes/resellers'],
  ['/api/uid-management', '../backend/routes/uidManagement'],
  ['/api/resell', '../backend/routes/resell'],
  ['/api/admin/resell', '../backend/routes/adminResell'],
  ['/api/admin/resellers', '../backend/routes/adminResellers'],
  ['/api/admin', '../backend/routes/admin'],
];

for (const [mountPath, routeFile] of routeFiles) {
  try {
    const routeModule = require(routeFile);
    app.use(mountPath, routeModule);
    loadedRoutes.push(mountPath);
  } catch (e) {
    failedRoutes.push(mountPath + ': ' + e.message.substring(0, 100));
  }
}

// 404 catch
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
  } else {
    res.status(404).json({ success: false, message: 'Not found' });
  }
});

module.exports = app;
module.exports.handler = serverless(app);
