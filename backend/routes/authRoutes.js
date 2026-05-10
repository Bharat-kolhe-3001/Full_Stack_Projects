const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const toSafeUser = (user) => ({
  id: user.userId || String(user._id),
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  role: user.role,
  farmId: user.farmId || null,
  verified: Boolean(user.verified),
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, farmId, userId } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    
    // Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = new User({
      name,
      userId: userId || undefined,
      email: normalizedEmail,
      password, // Note: In a real production app, ALWAYS hash passwords using bcrypt
      role: role || 'farmer',
      phone: phone || '',
      farmId: farmId || null,
      verified: true
    });

    await user.save();
    
    // Create token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });

    res.status(201).json({
      success: true,
      token,
      user: toSafeUser(user),
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });

    res.json({
      success: true,
      token,
      user: toSafeUser(user),
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

module.exports = router;
