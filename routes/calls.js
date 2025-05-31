const express = require('express');
const router = express.Router();
const CallSignal = require('../models/CallSignal'); // Mongoose model
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

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
      roomLink: roomUrl || '',
      channelName: channelName || '',
      status: 'calling',
      startedAt: Date.now(),
    });

    await newCallSignal.save();
    res.status(200).json({
      message: 'Call offer saved',
      signalId: newCallSignal._id, // 🆕 Return the ID for client use
      roomUrl: roomUrl || null,
      channelName
    });
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
    const expirationTimeInSeconds = 3600;
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

// --- Save call signal ---
router.post('/signal', async (req, res) => {
  try {
    const { callerId, receiverId, callType, roomLink } = req.body;
    const call = new CallSignal({ callerId, receiverId, callType, roomLink });
    await call.save();
    res.status(201).json({ success: true, call });
  } catch (error) {
    console.error('Error saving call signal:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ --- Update call signal status (e.g. to "ended") ---
router.put('/signal/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const call = await CallSignal.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!call) {
      return res.status(404).json({ error: 'Call signal not found' });
    }

    res.status(200).json({ success: true, message: 'Call status updated', call });
  } catch (error) {
    console.error('Error updating call status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
