// routes/notifications.js

const express = require('express');
const Notification = require('../models/Notification');
const router = express.Router();

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

// Create a new notification
router.post('/', async (req, res) => {
    try {
      const newNotification = new Notification(req.body);
      const savedNotification = await newNotification.save();
      res.status(201).json(savedNotification);
    } catch (error) {
      console.error('Error creating notification:', error); // Log the error
      res.status(500).json({ error: 'Server error' });
    }
  });  

module.exports = router;
