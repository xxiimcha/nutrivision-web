const axios = require('axios');
const UserToken = require('../models/UserToken'); // You must import this model

async function sendPushNotification(userId, title, message) {
  try {
    const userToken = await UserToken.findOne({ userId });

    if (!userToken) {
      console.log('No FCM token found for this user.');
      return;
    }

    const payload = {
      to: userToken.token,
      notification: {
        title,
        body: message,
      },
    };

    await axios.post('https://fcm.googleapis.com/fcm/send', payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${process.env.FCM_SERVER_KEY}`,
      },
    });

    console.log('✅ Push notification sent successfully');
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
  }
}
