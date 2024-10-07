const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Admin = require('../models/Admin');

// Endpoint to send a message
router.post('/send', async (req, res) => {
  const { sender, receiver, text } = req.body;

  if (!sender || !receiver || !text) {
    return res.status(400).json({ message: 'Sender, receiver, and text are required' });
  }

  try {
    const senderInfo = await Admin.findById(sender, 'firstName lastName');
    if (!senderInfo) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    const senderFullName = `${senderInfo.firstName} ${senderInfo.lastName}`;
    const message = new Message({
      sender,
      receiver,
      text,
    });
    await message.save();

    const notification = new Notification({
      userId: receiver,  // Set the receiver as the userId for the notification
      title: 'New Message Received',
      message: `You have received a new message from ${senderFullName}.`,
    });
    await notification.save();
    res.status(200).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to fetch conversation between two users
router.get('/conversation', async (req, res) => {
  const { user1, user2 } = req.query;

  if (!user1 || !user2) {
    return res.status(400).json({ message: 'Both user1 and user2 are required' });
  }

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ createdAt: 1 });  // Sort messages by creation date (oldest first)

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
