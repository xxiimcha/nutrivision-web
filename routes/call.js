// routes/call.js
const express = require('express');
const router = express.Router();
const CallSignal = require('../models/CallSignal');

// Fetch call history for a specific user
router.get('/history', async (req, res) => {
  const { userId } = req.query;
  
  try {
    const callHistory = await CallSignal.find({
      $or: [{ callerId: userId }, { receiverId: userId }],
    })
    .populate('callerId receiverId')
    .sort({ timestamp: -1 });  // Sort by the most recent calls first
    
    res.json(callHistory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch call history' });
  }
});

// Fetch missed calls for a specific user
router.get('/missed', async (req, res) => {
  const { userId } = req.query;

  try {
    const missedCalls = await CallSignal.find({
      receiverId: userId,
      status: 'missed',  // Only fetch calls with a status of 'missed'
    })
    .populate('callerId receiverId')
    .sort({ timestamp: -1 });  // Sort by the most recent calls first

    res.json(missedCalls);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch missed calls' });
  }
});

module.exports = router;
