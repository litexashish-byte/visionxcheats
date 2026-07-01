const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { demoDB } = require('./config/demoData');

// Load env
dotenv.config();

demoDB.settings.shortenerApiKey = process.env.INDIAN_SHORTNER_API_KEY || process.env.SHORTENER_API_KEY || demoDB.settings.shortenerApiKey;
demoDB.settings.shortenerApiUrl = process.env.INDIAN_SHORTNER_API_URL || demoDB.settings.shortenerApiUrl;

const app = express();

// Global flag for demo mode
global.isDemoMode = false;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Demo mode middleware - inject demoDB into req
app.use(async (req, res, next) => {
  req.isDemoMode = global.isDemoMode || false;
  req.demoDB = req.isDemoMode ? demoDB : null;
  
  // Attach settings to all requests
  try {
    if (global.isDemoMode) {
      req.siteSettings = { ...demoDB.settings };
    } else {
      const Settings = require('./models/Settings');
      let settings = await Settings.findOne();
      req.siteSettings = settings || {};
    }
  } catch (e) {
    req.siteSettings = {};
  }
  
  next();
});

// Maintenance mode middleware (block non-admin users)
app.use((req, res, next) => {
  // Skip for admin routes, login, register, health
  if (req.path.startsWith('/api/admin') || 
      req.path === '/api/health' || 
      req.path === '/api/settings' ||
      req.path === '/api/auth/login' ||
      req.path === '/api/auth/register' ||
      req.path === '/api/auth/stats') {
    return next();
  }
  
  if (req.siteSettings?.maintenanceMode) {
    // Allow admin users through during maintenance
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (global.isDemoMode) {
          const user = demoDB.findUserById(decoded.id);
          if (user?.role === 'admin') return next();
        }
      } catch (e) {}
    }
    
    return res.status(503).json({
      success: false,
      message: 'Site is under maintenance. Please try again later.',
      maintenanceMode: true,
    });
  }
  
  next();
});

// Public settings endpoint (no auth required)
const Settings = require('./models/Settings');
app.get('/api/settings', async (req, res) => {
  try {
    if (global.isDemoMode) {
      return res.json({
        success: true,
        data: {
          siteName: demoDB.settings.siteName || 'VISION X CHEATS',
          siteDescription: demoDB.settings.siteDescription || 'Your trusted source for premium digital panels',
          maintenanceMode: demoDB.settings.maintenanceMode || false,
          allowRegistration: demoDB.settings.allowRegistration !== false,
          discordLink: demoDB.settings.discordLink || '',
          youtubeLink: demoDB.settings.youtubeLink || '',
          instagramLink: demoDB.settings.instagramLink || '',
          whatsappLink: demoDB.settings.whatsappLink || '',
          telegramLink: demoDB.settings.telegramLink || '',
        }
      });
    }
    const settings = await Settings.findOne();
    res.json({
      success: true,
      data: {
        siteName: settings?.siteName || 'VISION X CHEATS',
        siteDescription: settings?.siteDescription || 'Your trusted source for premium digital panels',
        maintenanceMode: settings?.maintenanceMode || false,
        allowRegistration: settings?.allowRegistration !== false,
        discordLink: settings?.discordLink || '',
        youtubeLink: settings?.youtubeLink || '',
        instagramLink: settings?.instagramLink || '',
        whatsappLink: settings?.whatsappLink || '',
        telegramLink: settings?.telegramLink || '',
      }
    });
  } catch (e) {
    res.json({ success: true, data: { siteName: 'VISION X CHEATS', siteDescription: 'Your trusted source for premium digital panels', maintenanceMode: false, allowRegistration: true, discordLink: '', youtubeLink: '', instagramLink: '', whatsappLink: '', telegramLink: '' } });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/free-panels', require('./routes/freePanels'));
app.use('/api/paid-panels', require('./routes/paidPanels'));
app.use('/api/users', require('./routes/users'));
app.use('/api/licenses', require('./routes/licenses'));
app.use('/api/downloads', require('./routes/downloads'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/keyauth', require('./routes/keyauth'));
app.use('/api/resellers', require('./routes/resellers'));
app.use('/api/admin/resellers', require('./routes/adminResellers'));
app.use('/api/uid-management', require('./routes/uidManagement'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'VISION X CHEATS API is running',
    mode: global.isDemoMode ? 'demo' : 'production',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

// Initialize mode
(async () => {
  global.isDemoMode = true;
  demoDB.connect();
  console.log('Running in DEMO MODE with in-memory data');

  app.listen(PORT, () => {
    console.log(`\nVISION X CHEATS Server is running on port ${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
    console.log(`Health: http://localhost:${PORT}/api/health\n`);
  });
})();
