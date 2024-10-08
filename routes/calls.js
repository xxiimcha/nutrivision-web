// routes/calls.js
const express = require('express');
const router = express.Router();
const CallSignal = require('../models/CallSignal'); // Assuming a Mongoose model for CallSignal

router.post('/offer', async (req, res) => {
  const { from, to, callType, roomUrl } = req.body;

  try {
    // Save the call signal to the database
    const newCallSignal = new CallSignal({
      callerId: from,
      receiverId: to,
      callType,
      roomLink: roomUrl,
      status: 'calling',
      startedAt: Date.now(),
    });

    await newCallSignal.save();

    res.status(200).json({ message: 'Call offer saved', roomUrl });
  } catch (error) {
    console.error('Error saving call offer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
