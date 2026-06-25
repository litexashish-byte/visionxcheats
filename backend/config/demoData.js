const jwt = require('jsonwebtoken');

const DEFAULT_SHORTENER_API_URL = 'https://indianshortner.com/api';

// Demo free panels
const DEMO_PANELS = [
  {
    _id: 'panel-1',
    name: 'ESP Pro Max',
    description: 'Advanced external ESP panel with wallhack, glow, and radar features. Full customisation with smooth performance.',
    image: '',
    version: '3.1.0',
    category: 'EXTERNAL-ESP-MAX',
    downloadLink: 'https://example.com/downloads/esp-pro-max.zip',
    shortenerLink: 'https://shorter.link/esp-max',
    keyLink: 'https://drive.google.com/drive/folders/1DemoEspMax',
    videoLink: 'https://youtube.com/watch?v=demo1',
    isFeatured: true,
    isActive: true,
    downloadCount: 28450,
    rating: 4.8,
    totalRatings: 1560,
    tags: ['esp', 'wallhack', 'glow'],
    author: 'VisionX Admin',
    updatedAt: new Date(),
    createdAt: new Date(),
  },
  {
    _id: 'panel-2',
    name: 'ESP Lite',
    description: 'Lightweight external ESP panel with essential features. Perfect for competitive play with minimal performance impact.',
    image: '',
    version: '2.2.0',
    category: 'EXTERNAL-ESP-BASIC',
    downloadLink: 'https://example.com/downloads/esp-lite.zip',
    shortenerLink: 'https://shorter.link/esp-basic',
    keyLink: 'https://drive.google.com/drive/folders/1DemoEspBasic',
    videoLink: 'https://youtube.com/watch?v=demo2',
    isFeatured: true,
    isActive: true,
    downloadCount: 19200,
    rating: 4.5,
    totalRatings: 980,
    tags: ['esp', 'basic', 'lightweight'],
    author: 'Dev Team',
    updatedAt: new Date(),
    createdAt: new Date(),
  },
  {
    _id: 'panel-3',
    name: 'Streamer Mode Pro',
    description: 'Professional streamer panel with anti-stream-snipe protection, overlay control, and real-time OBS integration.',
    image: '',
    version: '4.0.0',
    category: 'STREAMER-PANEL',
    downloadLink: 'https://example.com/downloads/streamer-pro.zip',
    shortenerLink: 'https://shorter.link/streamer',
    keyLink: 'https://drive.google.com/drive/folders/1DemoStreamer',
    videoLink: 'https://youtube.com/watch?v=demo3',
    isFeatured: true,
    isActive: true,
    downloadCount: 35800,
    rating: 4.9,
    totalRatings: 2100,
    tags: ['streamer', 'obs', 'overlay'],
    author: 'StreamerPro',
    updatedAt: new Date(),
    createdAt: new Date(),
  },
  {
    _id: 'panel-4',
    name: 'Aimbot Visible Check',
    description: 'Smart aimbot panel with visible-only targeting, smooth aim, and adjustable FOV. Undetectable and precise.',
    image: '',
    version: '2.8.1',
    category: 'AIMBOT-VISIBLE',
    downloadLink: 'https://example.com/downloads/aimbot-visible.zip',
    shortenerLink: 'https://shorter.link/aimbot-vis',
    keyLink: 'https://drive.google.com/drive/folders/1DemoAimbot',
    videoLink: 'https://youtube.com/watch?v=demo4',
    isFeatured: false,
    isActive: true,
    downloadCount: 42100,
    rating: 4.7,
    totalRatings: 3200,
    tags: ['aimbot', 'visible', 'smooth'],
    author: 'Aimbot Labs',
    updatedAt: new Date(),
    createdAt: new Date(),
  },
  {
    _id: 'panel-5',
    name: 'UID Bypass Tool',
    description: 'Advanced UID bypass panel for evading hardware and IP bans. Includes cleaner and spoofer modules.',
    image: '',
    version: '1.9.5',
    category: 'UID-BYPASS',
    downloadLink: 'https://example.com/downloads/uid-bypass.zip',
    shortenerLink: 'https://shorter.link/uid-bypass',
    keyLink: 'https://drive.google.com/drive/folders/1DemoUid',
    videoLink: 'https://youtube.com/watch?v=demo5',
    isFeatured: true,
    isActive: true,
    downloadCount: 56700,
    rating: 4.6,
    totalRatings: 4500,
    tags: ['uid', 'bypass', 'spoofer'],
    author: 'Security Team',
    updatedAt: new Date(),
    createdAt: new Date(),
  },
  {
    _id: 'panel-6',
    name: 'Emulator Bypass Pro',
    description: 'Emulator detection bypass panel. Run any emulator smoothly without being detected by anti-cheat systems.',
    image: '',
    version: '3.2.0',
    category: 'EMULATOR-BYPASS',
    downloadLink: 'https://example.com/downloads/emu-bypass.zip',
    shortenerLink: 'https://shorter.link/emu-bypass',
    keyLink: 'https://drive.google.com/drive/folders/1DemoEmu',
    videoLink: 'https://youtube.com/watch?v=demo6',
    isFeatured: false,
    isActive: true,
    downloadCount: 38900,
    rating: 4.4,
    totalRatings: 2800,
    tags: ['emulator', 'bypass', 'ldplayer'],
    author: 'EmuBypass',
    updatedAt: new Date(),
    createdAt: new Date(),
  },
  {
    _id: 'panel-7',
    name: 'Normal Panel UI',
    description: 'Clean and simple normal panel with essential features. Easy to use interface with quick settings.',
    image: '',
    version: '1.5.0',
    category: 'NORMAL-PANEL',
    downloadLink: 'https://example.com/downloads/normal-panel.zip',
    shortenerLink: 'https://shorter.link/normal',
    keyLink: 'https://drive.google.com/drive/folders/1DemoNormal',
    videoLink: 'https://youtube.com/watch?v=demo7',
    isFeatured: false,
    isActive: true,
    downloadCount: 15400,
    rating: 4.2,
    totalRatings: 1200,
    tags: ['normal', 'simple', 'basic'],
    author: 'VisionX Team',
    updatedAt: new Date(),
    createdAt: new Date(),
  },
  {
    _id: 'panel-8',
    name: 'Cover Aimkill',
    description: 'Cover aimkill panel with auto-targeting while in cover. Includes peek assistance and pre-fire logic.',
    image: '',
    version: '2.1.3',
    category: 'COVER-AIMKILL',
    downloadLink: 'https://example.com/downloads/cover-aimkill.zip',
    shortenerLink: 'https://shorter.link/cover-aimkill',
    keyLink: 'https://drive.google.com/drive/folders/1DemoCover',
    videoLink: 'https://youtube.com/watch?v=demo8',
    isFeatured: false,
    isActive: true,
    downloadCount: 22100,
    rating: 4.3,
    totalRatings: 1900,
    tags: ['cover', 'aimkill', 'auto-target'],
    author: 'Cover King',
    updatedAt: new Date(),
    createdAt: new Date(),
  },
  {
    _id: 'panel-9',
    name: 'Aimsilent Cover',
    description: 'Stealth aim panel with silent aim functionality while in cover. Undetectable targeting system.',
    image: '',
    version: '1.8.2',
    category: 'AIMSILENT-COVER',
    downloadLink: 'https://example.com/downloads/aimsilent-cover.zip',
    shortenerLink: 'https://shorter.link/aimsilent',
    keyLink: 'https://drive.google.com/drive/folders/1DemoAimsilent',
    videoLink: 'https://youtube.com/watch?v=demo9',
    sellerApiLink: 'https://keyauth.win/api/1.2/',
    sellerAppName: 'AIM SILENT',
    sellerOwner: 'DD3EccXCXj',
    sellerKey: '82666d91e59471a1f25fd3df6817b40ca3a6be1a7d6a4d1074c47767075de8c6',
    licenseDuration: 1,
    sellerVersion: '1.0',
    isFeatured: false,
    isActive: true,
    downloadCount: 19800,
    rating: 4.5,
    totalRatings: 1650,
    tags: ['aimsilent', 'silent', 'stealth'],
    author: 'Silent Dev',
    updatedAt: new Date(),
    createdAt: new Date(),
  },
  {
    _id: 'panel-10',
    name: 'Source Code SDK',
    description: 'Complete source code SDK for custom panel development. Includes documentation, examples, and build tools.',
    image: '',
    version: '5.0.0',
    category: 'SOURCE-CODE',
    downloadLink: 'https://example.com/downloads/source-sdk.zip',
    shortenerLink: 'https://shorter.link/source-sdk',
    keyLink: 'https://drive.google.com/drive/folders/1DemoSource',
    videoLink: 'https://youtube.com/watch?v=demo10',
    isFeatured: true,
    isActive: true,
    downloadCount: 12400,
    rating: 4.9,
    totalRatings: 890,
    tags: ['source', 'sdk', 'development'],
    author: 'SDK Team',
    updatedAt: new Date(),
    createdAt: new Date(),
  },
];

// Demo paid panels
const DEMO_PAID_PANELS = [
  {
    _id: 'paid-1',
    name: 'ESP Max Premium',
    description: 'Premium ESP panel with all features unlocked, priority updates, and dedicated support.',
    image: '',
    price: 29.99,
    originalPrice: 59.99,
    features: [
      'All ESP features',
      'Priority updates',
      '24/7 support',
      'Custom config',
      'Lifetime access',
    ],
    category: 'EXTERNAL-ESP-MAX',
    contactDiscord: 'https://discord.gg/visionxpremium',
    contactTelegram: 'https://t.me/visionxpremium',
    isFeatured: true,
    isActive: true,
    salesCount: 856,
    rating: 4.8,
    totalRatings: 234,
    tags: ['esp', 'premium', 'max'],
    author: 'VisionX Premium',
    updatedAt: new Date(),
    createdAt: new Date(),
  },
  {
    _id: 'paid-2',
    name: 'Aimbot Pro + UID',
    description: 'Advanced aimbot with visible check, plus UID bypass module in one premium package.',
    image: '',
    price: 34.99,
    originalPrice: 69.99,
    features: [
      'Aimbot visible check',
      'UID bypass module',
      'Smooth aim settings',
      'Anti-detection',
      'Lifetime updates',
    ],
    category: 'AIMBOT-VISIBLE',
    contactDiscord: 'https://discord.gg/visionxpro',
    contactTelegram: 'https://t.me/visionxpro',
    isFeatured: true,
    isActive: true,
    salesCount: 543,
    rating: 4.7,
    totalRatings: 178,
    tags: ['aimbot', 'uid', 'premium'],
    author: 'Aimbot Pro Team',
    updatedAt: new Date(),
    createdAt: new Date(),
  },
  {
    _id: 'paid-3',
    name: 'Streamer + Emulator Bundle',
    description: 'Complete streamer protection and emulator bypass bundle. Everything you need in one package.',
    image: '',
    price: 44.99,
    originalPrice: 89.99,
    features: [
      'Streamer protection',
      'Emulator bypass',
      'OBS integration',
      'Anti-snipe',
      'Premium support',
    ],
    category: 'STREAMER-PANEL',
    contactDiscord: 'https://discord.gg/visionxsec',
    contactTelegram: 'https://t.me/visionxsec',
    isFeatured: false,
    isActive: true,
    salesCount: 321,
    rating: 4.6,
    totalRatings: 98,
    tags: ['streamer', 'emulator', 'bundle'],
    author: 'Bundle Team',
    updatedAt: new Date(),
    createdAt: new Date(),
  },
];

class DemoDB {
  constructor() {
    this.isConnected = false;
    this.settings = {
      siteName: 'VISION X CHEATS',
      siteDescription: 'Your trusted source for premium digital panels',
      shortenerApiKey: '',
      shortenerApiUrl: DEFAULT_SHORTENER_API_URL,
      maintenanceMode: false,
      allowRegistration: true,
      discordLink: 'https://discord.gg/visionxstore',
      youtubeLink: 'https://youtube.com/@visionxstore',
      instagramLink: 'https://instagram.com/visionxstore',
      whatsappLink: 'https://wa.me/919999999999',
      telegramLink: 'https://t.me/visionxstore',
    };
    this.users = [
      {
        _id: 'admin-user-1',
        username: 'admin',
        email: 'litexashish@gmail.com',
        password: 'Ashish@2025',
        role: 'admin',
        isBanned: false,
        avatar: '/logo.png',
        downloadHistory: [],
        savedLicenses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    this.freePanels = [...DEMO_PANELS];
    this.paidPanels = [...DEMO_PAID_PANELS];
    this.resellers = [
      {
        _id: 'reseller-1',
        name: 'Demo Reseller',
        email: 'reseller@demo.com',
        password: 'demo123',
        gtcApiKey: 'GTCAPI-0E9C83D81E2942CACE91A4AF6C86313E',
        uidLimit: 50,
        uidUsed: 5,
        isActive: true,
        allowedKeyTypes: ['daily', 'weekly', 'fifteen_day', 'monthly'],
        totalEarnings: 25.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    this.uids = [
      { _id: 'uid-demo-1', uid: '1001234567', resellerId: 'reseller-1', resellerName: 'Demo Reseller', duration: 'daily', status: 'active', licenseKey: '1day-ABC123', expiresAt: new Date(Date.now() + 86400000), createdAt: new Date() },
      { _id: 'uid-demo-2', uid: '2009876543', resellerId: 'reseller-1', resellerName: 'Demo Reseller', duration: 'monthly', status: 'active', licenseKey: '30day-XYZ789', expiresAt: new Date(Date.now() + 30*86400000), createdAt: new Date() },
      { _id: 'uid-demo-3', uid: '3005551234', resellerId: 'reseller-1', resellerName: 'Demo Reseller', duration: 'weekly', status: 'banned', licenseKey: '7day-DEF456', expiresAt: new Date(Date.now() + 7*86400000), bannedAt: new Date(), banReason: 'Terms violation', createdAt: new Date() },
    ];
    this.licenses = [];
    this.downloads = [];
    this.ratings = [];
    this.downloadCounter = 0;
    this._seedDemoDownloads();
  }

  connect() {
    this.isConnected = true;
    console.log(`✅ Demo mode: Loaded ${this.users.length} users, ${this.freePanels.length} free panels, ${this.paidPanels.length} paid panels`);
    return true;
  }

  findUserByEmail(email) {
    return this.users.find(u => u.email === email);
  }

  findUserById(id) {
    return this.users.find(u => u._id === id);
  }

  findUserByUsername(username) {
    return this.users.find(u => u.username === username);
  }

  createUser({ username, email, password }) {
    const user = {
      _id: 'user-' + Date.now(),
      username,
      email,
      password,
      role: 'user',
      isBanned: false,
      avatar: '',
      downloadHistory: [],
      savedLicenses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  getUsers() {
    return this.users.map(({ password, ...rest }) => rest);
  }

  getFreePanels(query = {}) {
    let panels = [...this.freePanels];
    if (query.isActive) panels = panels.filter(p => p.isActive);
    if (query.isFeatured) panels = panels.filter(p => p.isFeatured);
    if (query.category) panels = panels.filter(p => p.category === query.category);
    if (query.search) {
      const s = query.search.toLowerCase();
      panels = panels.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
    }
    return panels;
  }

  getPaidPanels(query = {}) {
    let panels = [...this.paidPanels];
    if (query.isActive) panels = panels.filter(p => p.isActive);
    if (query.isFeatured) panels = panels.filter(p => p.isFeatured);
    if (query.category) panels = panels.filter(p => p.category === query.category);
    if (query.search) {
      const s = query.search.toLowerCase();
      panels = panels.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
    }
    return panels;
  }

  findFreePanelById(id) {
    return this.freePanels.find(p => p._id === id);
  }

  findPaidPanelById(id) {
    return this.paidPanels.find(p => p._id === id);
  }

  addFreePanel(data) {
    const panel = { _id: 'panel-' + Date.now(), ...data, isActive: data.isActive !== false, downloadCount: 0, rating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date() };
    this.freePanels.push(panel);
    return panel;
  }

  updateFreePanel(id, data) {
    const idx = this.freePanels.findIndex(p => p._id === id);
    if (idx === -1) return null;
    this.freePanels[idx] = { ...this.freePanels[idx], ...data, updatedAt: new Date() };
    return this.freePanels[idx];
  }

  deleteFreePanel(id) {
    const idx = this.freePanels.findIndex(p => p._id === id);
    if (idx === -1) return false;
    this.freePanels.splice(idx, 1);
    return true;
  }

  addPaidPanel(data) {
    const panel = { _id: 'paid-' + Date.now(), ...data, isActive: data.isActive !== false, salesCount: 0, rating: 0, totalRatings: 0, createdAt: new Date(), updatedAt: new Date() };
    this.paidPanels.push(panel);
    return panel;
  }

  updatePaidPanel(id, data) {
    const idx = this.paidPanels.findIndex(p => p._id === id);
    if (idx === -1) return null;
    this.paidPanels[idx] = { ...this.paidPanels[idx], ...data, updatedAt: new Date() };
    return this.paidPanels[idx];
  }

  deletePaidPanel(id) {
    const idx = this.paidPanels.findIndex(p => p._id === id);
    if (idx === -1) return false;
    this.paidPanels.splice(idx, 1);
    return true;
  }

  getUserRating(userId, panelId) {
    const r = this.ratings.find(r => r.userId === userId && r.panelId === panelId);
    return r ? r.rating : 0;
  }

  addUserRating(userId, panelId, panelType, rating) {
    const existing = this.ratings.find(r => r.userId === userId && r.panelId === panelId);
    if (existing) return false;
    this.ratings.push({ _id: 'rating-' + Date.now(), userId, panelId, panelType, rating, createdAt: new Date() });
    return true;
  }

  getAllRatings() {
    return this.ratings.map(r => {
      const user = this.findUserById(r.userId);
      let panelName = 'Unknown Panel';
      if (r.panelType === 'free') {
        const p = this.findFreePanelById(r.panelId);
        if (p) panelName = p.name;
      } else {
        const p = this.findPaidPanelById(r.panelId);
        if (p) panelName = p.name;
      }
      const safeUser = user ? { _id: user._id, username: user.username, email: user.email, avatar: user.avatar } : { username: 'Unknown', email: '' };
      return { ...r, userId: safeUser, panelName };
    }).reverse();
  }

  deleteRating(id) {
    const idx = this.ratings.findIndex(r => r._id === id);
    if (idx === -1) return false;
    const rating = this.ratings[idx];
    this.ratings.splice(idx, 1);
    const allRatings = this.ratings.filter(r => r.panelId === rating.panelId);
    const totalRatings = allRatings.length;
    const avgRating = totalRatings > 0 ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings : 0;
    if (rating.panelType === 'free') {
      const panel = this.findFreePanelById(rating.panelId);
      if (panel) { panel.rating = avgRating; panel.totalRatings = totalRatings; }
    } else {
      const panel = this.findPaidPanelById(rating.panelId);
      if (panel) { panel.rating = avgRating; panel.totalRatings = totalRatings; }
    }
    return true;
  }

  generateLicense({ panelId, panelName, quantity = 1 }) {
    const licenses = [];
    for (let i = 0; i < quantity; i++) {
      licenses.push({
        _id: 'lic-' + Date.now() + '-' + i,
        licenseKey: 'VX-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        panelId,
        panelName,
        isActive: true,
        isDisabled: false,
        createdAt: new Date(),
      });
    }
    this.licenses.push(...licenses);
    return licenses;
  }

  recordDownload(panelId, panelName, userId) {
    const download = {
      _id: 'dl-' + Date.now() + '-' + (this.downloadCounter++),
      panelId,
      panelName,
      userId,
      shortenerCompleted: true,
      downloadCompleted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.downloads.push(download);
    return download;
  }

  getDownloadHistory(userId) {
    return this.downloads
      .filter(d => d.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getPanelDownloadHistory(panelId) {
    return this.downloads
      .filter(d => d.panelId === panelId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayDownloads = this.downloads.filter(d => d.downloadCompleted && new Date(d.createdAt) >= todayStart).length;
    const todayUsers = this.users.filter(u => u.createdAt && new Date(u.createdAt) >= todayStart).length;
    return {
      totalUsers: this.users.length,
      totalDownloads: this.downloads.filter(d => d.downloadCompleted).length,
      freePanelCount: this.freePanels.filter(p => p.isActive).length,
      paidPanelCount: this.paidPanels.filter(p => p.isActive).length,
      totalLicenses: this.licenses.length,
      activeLicenses: this.licenses.filter(l => l.isActive && !l.isDisabled).length,
      todayUsers,
      todayDownloads,
    };
  }

  generateShortenerLink(panelId) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `https://go.visionx.store/${code}`;
  }

  _seedDemoDownloads() {
    const panels = this.freePanels;
    const statuses = [
      { shortenerCompleted: true, downloadCompleted: true },
      { shortenerCompleted: true, downloadCompleted: true },
      { shortenerCompleted: true, downloadCompleted: true },
      { shortenerCompleted: true, downloadCompleted: true },
      { shortenerCompleted: false, downloadCompleted: false },
      { shortenerCompleted: false, downloadCompleted: false },
      { shortenerCompleted: false, downloadCompleted: false },
      { shortenerCompleted: true, downloadCompleted: false },
      { shortenerCompleted: true, downloadCompleted: false },
    ];
    for (let i = 0; i < 25; i++) {
      const panel = panels[i % panels.length];
      const status = statuses[i % statuses.length];
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      this.downloads.push({
        _id: 'dl-seed-' + (this.downloadCounter++),
        panelId: panel._id,
        panelName: panel.name,
        userId: 'admin-user-1',
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        shortenerCompleted: status.shortenerCompleted,
        downloadCompleted: status.downloadCompleted,
        shortenerLink: `https://go.visionx.store/${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        userAgent: 'Mozilla/5.0',
        createdAt,
        updatedAt: createdAt,
      });
    }
  }
}

// Singleton instance
const demoDB = new DemoDB();

module.exports = { demoDB, DEMO_PANELS, DEMO_PAID_PANELS };
