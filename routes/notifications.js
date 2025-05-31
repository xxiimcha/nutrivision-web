const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const UserToken = require('../models/UserToken');
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

// Create a new notification (DB only)
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

// Send FCM Push Notification
router.post('/send-fcm', async (req, res) => {
  try {
    const { receiverId, title, body, data = {}, type } = req.body;

    // Validate required fields
    if (!receiverId || !title || !body || !data.channelName) {
      return res.status(400).json({
        error: 'Missing required fields: receiverId, title, body, or data.channelName',
      });
    }

    // Retrieve FCM token for the receiver
    const userToken = await UserToken.findOne({ userId: receiverId });
    if (!userToken || !userToken.token) {
      console.log('❌ No FCM token found for userId:', receiverId);
      return res.status(404).json({ error: 'No FCM token found for receiver' });
    }

    // Construct the FCM message payload
    const message = {
      token: userToken.token,
      notification: {
        title: String(title),
        body: String(body),
      },
      data: {
        channelName: String(data.channelName || ''),
        agoraToken: String(data.token || ''),   // ✅ Rename to avoid conflict
        callerId: String(data.callerId || ''),
        callType: String(data.callType || ''),
        type: String(type || 'notification'),
      },
    };

    console.log('📨 Sending FCM message to:', userToken.token);
    console.log('Payload:', message);

    // Send FCM
    const response = await admin.messaging().send(message);
    console.log('✅ FCM message sent successfully:', response);

    res.status(200).json({ success: true, response });

  } catch (error) {
    console.error('🔥 Error sending FCM:', error?.errorInfo || error);
    res.status(500).json({ error: 'Failed to send FCM', details: error?.message });
  }
});

module.exports = router;
