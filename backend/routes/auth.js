const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const FreePanel = require('../models/FreePanel');
const PaidPanel = require('../models/PaidPanel');
const auth = require('../middleware/auth');

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    // Check if registration is allowed
    const allowReg = req.siteSettings?.allowRegistration;
    if (allowReg === false) {
      return res.status(403).json({ success: false, message: 'Registration is currently disabled. Please try again later.' });
    }
    
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Demo mode fallback
    if (req.isDemoMode) {
      const existingUser = req.demoDB.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }
      const existingUsername = req.demoDB.findUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ success: false, message: 'Username already taken' });
      }
      const user = req.demoDB.createUser({ username, email, password });
      const token = generateToken(user._id);
      const { password: _, ...userWithoutPassword } = user;
      return res.status(201).json({ success: true, token, user: { ...userWithoutPassword, comparePassword: undefined } });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken',
      });
    }

    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Demo mode fallback
    if (req.isDemoMode) {
      const user = req.demoDB.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      if (password !== user.password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      const token = generateToken(user._id);
      const { password: _, ...userWithoutPassword } = user;
      return res.json({ success: true, token, user: userWithoutPassword });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been banned' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = generateToken(user._id);
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ success: true, token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    // Demo mode fallback
    if (req.isDemoMode) {
      const user = req.demoDB.findUserById(req.user._id || req.user.id);
      if (!user) return res.status(401).json({ success: false, message: 'User not found' });
      const { password: _, ...userWithoutPassword } = user;
      return res.json({ success: true, user: userWithoutPassword });
    }
    const { password: _, ...userWithoutPassword } = req.user.toObject ? req.user.toObject() : req.user;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/auth/stats
router.get('/stats', async (req, res) => {
  try {
    if (req.isDemoMode) {
      const allPanels = [...req.demoDB.freePanels, ...req.demoDB.paidPanels];
      const totalRatings = allPanels.reduce((sum, p) => sum + (p.totalRatings || 0), 0);
      const avgRating = totalRatings > 0
        ? (allPanels.reduce((sum, p) => sum + (p.rating || 0) * (p.totalRatings || 0), 0) / totalRatings).toFixed(1)
        : '0.0';
      return res.json({
        success: true,
        data: {
          freePanels: req.demoDB.freePanels.filter(p => p.isActive).length,
          paidPanels: req.demoDB.paidPanels.filter(p => p.isActive).length,
          totalUsers: req.demoDB.users.length,
          avgRating,
        },
      });
    }
    const [freeCount, paidCount, userCount] = await Promise.all([
      FreePanel.countDocuments({ isActive: true }),
      PaidPanel.countDocuments({ isActive: true }),
      User.countDocuments(),
    ]);
    const [freePanels, paidPanels] = await Promise.all([
      FreePanel.find({ isActive: true }).select('rating totalRatings'),
      PaidPanel.find({ isActive: true }).select('rating totalRatings'),
    ]);
    const allPanels = [...freePanels, ...paidPanels];
    const totalRatings = allPanels.reduce((sum, p) => sum + (p.totalRatings || 0), 0);
    const avgRating = totalRatings > 0
      ? (allPanels.reduce((sum, p) => sum + (p.rating || 0) * (p.totalRatings || 0), 0) / totalRatings).toFixed(1)
      : '0.0';
    res.json({ success: true, data: { freePanels: freeCount, paidPanels: paidCount, totalUsers: userCount, avgRating } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;