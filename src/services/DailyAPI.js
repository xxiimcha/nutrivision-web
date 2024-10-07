import axios from 'axios';
import io from 'socket.io-client';

const dailyAPIKey = process.env.REACT_APP_DAILY_API_KEY;


export const initiateCall = async (receiverId, callType, senderId) => {
    try {
      // Create a Daily.co room
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
  
      // Notify backend and the other user via Socket.io
      const socket = io('http://localhost:5003'); // Point to your web server
      socket.emit('call-user', { callerId: senderId, receiverId, callType, roomUrl });
  
      // Open the Daily.co room in a new window
      window.open(roomUrl, '_blank');
    } catch (error) {
      console.error('Error initiating call:', error.message || error);
      if (error.response && error.response.status === 401) {
        console.error('Daily.co API key is invalid or unauthorized.');
      }
    }
  };
