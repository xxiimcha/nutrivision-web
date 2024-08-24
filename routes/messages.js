const express = require('express');
const router = express.Router();
const Message = require('../models/Message'); // Assuming you have a Message model

router.post('/send', async (req, res) => {
  const { sender, receiver, text } = req.body;

  if (!sender || !receiver || !text) {
    return res.status(400).json({ message: 'Sender, receiver, and text are required' });
  }

  try {
    const message = new Message({
      sender,
      receiver,
      text,
    });
    await message.save();
    res.status(200).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
