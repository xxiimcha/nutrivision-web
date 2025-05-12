const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Admin = require('../models/Admin');
const UserToken = require('../models/UserToken');
const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

const PROJECT_ID = 'nutrivision-8876b';
const firebaseConfigJson = JSON.parse(Buffer.from(process.env.FIREBASE_CONFIG_BASE64, 'base64').toString('utf8'));

// 🔔 Send push to specific user
async function sendPushToUser(userId, title, body) {
  try {
    const tokenDoc = await UserToken.findOne({ userId });
    if (!tokenDoc || !tokenDoc.token) {
      console.warn(`⚠️ No token found for user ${userId}`);
      return;
    }

    const auth = new GoogleAuth({
      credentials: firebaseConfigJson,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });

    const accessToken = await auth.getAccessToken();
    if (!accessToken) throw new Error('❌ Failed to retrieve access token');

    const payload = {
      message: {
        token: tokenDoc.token,
        notification: { title, body },
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
  } catch (err) {
    console.error(`❌ Push to ${userId} failed:`, err.response?.data || err.message);
  }
}

// 📨 Send message + push
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
    const message = new Message({ sender, receiver, text });
    await message.save();

    const notif = new Notification({
      userId: receiver,
      title: 'New Message Received',
      message: `You have received a new message from ${senderFullName}.`,
    });
    await notif.save();

    await sendPushToUser(receiver, 'New Message', `From ${senderFullName}: ${text}`);

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
