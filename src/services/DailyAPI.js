import axios from 'axios';
import io from 'socket.io-client';

const dailyAPIKey = process.env.REACT_APP_DAILY_API_KEY;

export const initiateCall = async (receiverId, callType, senderId) => {
  try {
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

    // Notify the backend and the other user (via Socket.io)
    const socket = io(process.env.REACT_APP_API_BASE_URL);
    socket.emit('call-user', {
      callerId: senderId,
      receiverId,
      callType,
      roomUrl,
    });

    // Open the room in a new window
    window.open(roomUrl, '_blank');
  } catch (error) {
    console.error('Error initiating call:', error);
  }
};
