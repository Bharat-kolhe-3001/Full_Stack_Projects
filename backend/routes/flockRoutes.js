const express = require('express');
const router = express.Router();
const Flock = require('../models/Flock');

// Get all flocks (can be filtered by farmId)
router.get('/', async (req, res) => {
  try {
    const { farmId } = req.query;
    let query = {};
    if (farmId) query.farmId = farmId;
    
    const flocks = await Flock.find(query).sort({ shed: 1, createdAt: -1 }).lean();
    res.json(flocks);
  } catch (error) {
    console.error('Error fetching flocks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new flock
router.post('/', async (req, res) => {
  try {
    const flock = new Flock(req.body);
    await flock.save();
    res.status(201).json(flock);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

module.exports = router;
