const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const UserToken = require('../models/UserToken');
const { GoogleAuth } = require('google-auth-library');
require('dotenv').config();
const axios = require('axios');

const router = express.Router();
const PROJECT_ID = 'nutrivision-8876b';

// Decode Firebase Admin SDK config from base64
const firebaseConfigBase64 = process.env.FIREBASE_CONFIG_BASE64;
if (!firebaseConfigBase64) throw new Error('Missing FIREBASE_CONFIG_BASE64');

const firebaseConfigJson = JSON.parse(Buffer.from(firebaseConfigBase64, 'base64').toString('utf8'));

// 🔔 Send push + log to Notification collection
async function createNotificationAndSendPush(userId, token, title, message) {
  try {
    await new Notification({ userId, title, message }).save();
    console.log(`✅ Notification saved for user ${userId}`);

    const auth = new GoogleAuth({
      credentials: firebaseConfigJson,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });

    const accessToken = await auth.getAccessToken();
  if (!accessToken) throw new Error('❌ Failed to retrieve access token');


    const payload = {
      message: {
        token,
        notification: { title, body: message },
        android: {
          notification: {
            sound: 'default',
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
      },
    };

    const response = await axios.post(
      `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ Push sent to ${userId}:`, response.data);
  } catch (error) {
    console.error(`❌ Failed to push to ${userId}:`, error.response?.data || error.message);
  }
}

// 🔄 Broadcast to all tokens in the usertokens collection
async function broadcastNotificationToAll(title, message) {
  const userTokens = await UserToken.find({ token: { $exists: true, $ne: null, $ne: '' } });

  if (userTokens.length === 0) {
    console.warn('⚠️ No valid user tokens found.');
    return;
  }

  for (const user of userTokens) {
    await createNotificationAndSendPush(user.userId, user.token, title, message);
  }
}

// 📅 GET all events
router.get('/', async (req, res) => {
  const { status } = req.query;
  try {
    const query = status ? { status } : {};
    const events = await Event.find(query);
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
});

// 🆕 CREATE event
router.post('/', async (req, res) => {
  const { title, location, date, time, recipient, status } = req.body;
  try {
    const newEvent = new Event({ title, location, date, time, recipient, status: status || 'upcoming' });
    await newEvent.save();

    const msg = `Event "${title}" is scheduled for ${date} at ${time}.`;
    await broadcastNotificationToAll('New Event Created', msg);

    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error });
  }
});

// ❌ CANCEL event
router.put('/:id/cancel', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid Event ID' });

  try {
    const cancelled = await Event.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
    if (!cancelled) return res.status(404).json({ message: 'Event not found' });

    const msg = `Event "${cancelled.title}" scheduled for ${cancelled.date} has been canceled.`;
    await broadcastNotificationToAll('Event Canceled', msg);

    res.status(200).json({ message: 'Event cancelled', event: cancelled });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling event', error });
  }
});

// ✏️ UPDATE event
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid Event ID' });

  const { title, location, date, time, recipient, status } = req.body;
  try {
    const updated = await Event.findByIdAndUpdate(
      id,
      { title, location, date, time, recipient, status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Event not found' });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error });
  }
});

// 🗑️ DELETE event
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Event not found' });

    const msg = `Event "${deleted.title}" scheduled for ${deleted.date} has been deleted.`;
    await broadcastNotificationToAll('Event Deleted', msg);

    res.status(200).json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error });
  }
});

module.exports = router;
