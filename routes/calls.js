const express = require('express');
const router = express.Router();
const CallSignal = require('../models/CallSignal');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

// --- Save call offer ---
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
    res.status(200).json({ message: 'Call offer saved', roomUrl: roomUrl || null, channelName });
  } catch (error) {
    console.error('Error saving call offer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- Agora token generation ---
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

// --- Save signal ---
router.post('/signal', async (req, res) => {
  try {
    const { callerId, receiverId, callType, roomLink, channelName } = req.body;
    const call = new CallSignal({ callerId, receiverId, callType, roomLink, channelName });
    await call.save();
    res.status(201).json({ success: true, call });
  } catch (error) {
    console.error('Error saving call signal:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ --- Update call status ---
router.post('/status', async (req, res) => {
  try {
    const { channelName, status, userId } = req.body;

    if (!channelName || !status) {
      return res.status(400).json({ error: 'channelName and status are required.' });
    }

    const call = await CallSignal.findOne({ channelName }).sort({ startedAt: -1 });

    if (!call) {
      return res.status(404).json({ error: 'Call not found.' });
    }

    call.status = status;
    call.endedAt = Date.now();
    if (userId) call.respondedBy = userId;

    await call.save();

    res.status(200).json({ success: true, message: 'Call status updated', call });
  } catch (error) {
    console.error('Error updating call status:', error);
    res.status(500).json({ error: 'Failed to update call status' });
  }
});

module.exports = router;
