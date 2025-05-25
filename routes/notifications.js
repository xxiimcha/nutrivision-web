const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const UserToken = require('../models/UserToken'); // NEW: Import token model
const admin = require('firebase-admin');

// Get notifications for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark a notification as read
router.put('/:notificationId/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new notification (for DB storage only)
router.post('/', async (req, res) => {
  try {
    const newNotification = new Notification(req.body);
    const savedNotification = await newNotification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Send FCM push notification using UserToken model
router.post('/send-fcm', async (req, res) => {
  try {
    const { receiverId, title, body, data } = req.body;

    if (!receiverId || !title || !body || !data) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const userToken = await UserToken.findOne({ userId: receiverId });
    if (!userToken || !userToken.token) {
      return res.status(404).json({ error: 'No token for receiver' });
    }

    const message = {
      token: userToken.token,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        type: req.body.type || 'notification',
      }
    };

    await admin.messaging().send(message);
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('🔥 Error sending FCM:', error);
    res.status(500).json({ error: 'Failed to send FCM' });
  }
});

module.exports = router;
