import axios from 'axios';
import io from 'socket.io-client';

const dailyAPIKey = process.env.REACT_APP_DAILY_API_KEY;

export const initiateCall = async (receiverId, callType, senderId) => {
  try {
    // Step 1: Create a Daily.co room
    const response = await axios.post(
      'https://api.daily.co/v1/rooms',
      {
        properties: {
          enable_screenshare: true,
          enable_chat: true,
          max_participants: 2,
        },
      },
      {
        headers: { Authorization: `Bearer ${dailyAPIKey}` },
      }
    );

    const roomUrl = response.data.url;
    if (!roomUrl) {
      console.error('Room URL could not be generated.');
      return;
    }

    // Step 2: Save the room URL and call details to your backend database
    await axios.post(`${process.env.REACT_APP_API_BASE_URL}/calls/offer`, {
      from: senderId,
      to: receiverId,
      callType,
      roomUrl,
    });

    // Step 3: Notify the other user via Socket.io (if needed)
    const socket = io('http://localhost:5003'); // Adjust to point to your server
    socket.emit('call-user', { callerId: senderId, receiverId, callType, roomUrl });

    // Step 4: Open the Daily.co room in a new window
    window.open(roomUrl, '_blank');
  } catch (error) {
    console.error('Error initiating call:', error.message || error);
    if (error.response && error.response.status === 401) {
      console.error('Daily.co API key is invalid or unauthorized.');
    }
  }
};
