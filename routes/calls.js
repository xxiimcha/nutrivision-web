const express = require('express');
const router = express.Router();
const CallSignal = require('../models/CallSignal'); // Your Mongoose model

// Agora imports
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

// Load from environment variables
const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

// --- Save call offer route ---
router.post('/offer', async (req, res) => {
  const { from, to, callType, roomUrl, channelName } = req.body;

  try {
    const newCallSignal = new CallSignal({
      callerId: from,
      receiverId: to,
      callType,
      roomLink: roomUrl || '', // fallback for Agora if not using roomUrl
      channelName: channelName || '', // support Agora channel
      status: 'calling',
      startedAt: Date.now(),
    });

    await newCallSignal.save();
    res.status(200).json({ message: 'Call offer saved', roomUrl: roomUrl || null, channelName });
  } catch (error) {
    console.error('Error saving call offer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- Agora token generation route ---
router.get('/agora-token', (req, res) => {
  const { channel, uid } = req.query;

  if (!channel || !uid) {
    return res.status(400).json({ error: 'Missing channel or uid' });
  }

  try {
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channel,
      parseInt(uid),
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error('Error generating Agora token:', err);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

module.exports = router;
