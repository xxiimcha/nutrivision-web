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

router.post('/send-fcm', async (req, res) => {
  try {
    const { receiverId, title, body, data, type } = req.body;

    // Basic field validation
    if (!receiverId || !title || !body || !data || !data.channelName) {
      return res.status(400).json({
        error: 'Missing required fields: receiverId, title, body, or data.channelName',
      });
    }

    // Retrieve receiver's FCM token
    const userToken = await UserToken.findOne({ userId: receiverId });
    if (!userToken || !userToken.token) {
      return res.status(404).json({ error: 'No FCM token found for receiver' });
    }

    // Construct message
    const message = {
      token: userToken.token,
      notification: {
        title: String(title),
        body: String(body),
      },
      data: {
        // Convert undefined fields to empty strings to prevent crash
        channelName: String(data.channelName || ''),
        token: String(data.token || ''),
        callerId: String(data.callerId || ''),
        callType: String(data.callType || ''),
        type: String(type || 'notification'),
      },
    };

    console.log('📨 Sending FCM message to:', userToken.token);
    console.log('Payload:', message);

    // Send message via Firebase Admin SDK
    const response = await admin.messaging().send(message);
    console.log('✅ FCM message sent successfully:', response);

    res.status(200).json({ success: true, response });

  } catch (error) {
    console.error('🔥 Error sending FCM:', error?.errorInfo || error);
    res.status(500).json({ error: 'Failed to send FCM', details: error?.message });
  }
});

module.exports = router;
