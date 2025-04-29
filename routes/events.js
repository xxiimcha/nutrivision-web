const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const UserToken = require('../models/UserToken');
const { GoogleAuth } = require('google-auth-library');
require('dotenv').config();

const router = express.Router();
const PROJECT_ID = 'nutrivision-8876b';

// Decode Firebase config from base64
const firebaseConfigBase64 = process.env.FIREBASE_CONFIG_BASE64;
if (!firebaseConfigBase64) throw new Error('Missing FIREBASE_CONFIG_BASE64');
const firebaseConfigJson = JSON.parse(Buffer.from(firebaseConfigBase64, 'base64').toString('utf8'));

// Push helper
async function sendGlobalPushNotification(title, body) {
  try {
    const tokens = await UserToken.find({}); // Broadcast to all users

    const auth = new GoogleAuth({
      credentials: firebaseConfigJson,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });

    const accessToken = await auth.getAccessToken();

    await Promise.all(tokens.map(userToken => {
      return axios.post(
        `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`,
        {
          message: {
            token: userToken.token,
            notification: { title, body },
            android: {
              notification: {
                sound: 'default',
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
              }
            }
          }
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    }));

    console.log('✅ Push notifications sent');
  } catch (err) {
    console.error('❌ Push notification error:', err.response?.data || err.message);
  }
}

// GET all events
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

// CREATE new event
router.post('/', async (req, res) => {
  const { title, location, date, time, recipient, status } = req.body;
  try {
    const newEvent = new Event({ title, location, date, time, recipient, status: status || 'upcoming' });
    await newEvent.save();

    const notif = new Notification({
      title: 'New Event Created',
      message: `Event "${title}" has been created for ${date} at ${time}.`,
    });
    await notif.save();

    await sendGlobalPushNotification('New Event Created', `Event "${title}" is scheduled for ${date} at ${time}.`);
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error });
  }
});

// CANCEL event
router.put('/:id/cancel', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid Event ID' });

  try {
    const cancelled = await Event.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
    if (!cancelled) return res.status(404).json({ message: 'Event not found' });

    const msg = `Event "${cancelled.title}" scheduled for ${cancelled.date} has been canceled.`;
    await new Notification({ title: 'Event Canceled', message: msg }).save();
    await sendGlobalPushNotification('Event Canceled', msg);

    res.status(200).json({ message: 'Event cancelled', event: cancelled });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling event', error });
  }
});

// UPDATE event
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

// DELETE event
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Event not found' });

    const msg = `Event "${deleted.title}" scheduled for ${deleted.date} has been canceled.`;
    await new Notification({ title: 'Event Canceled', message: msg }).save();
    await sendGlobalPushNotification('Event Deleted', msg);

    res.status(200).json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error });
  }
});

module.exports = router;
