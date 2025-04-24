import axios from 'axios';
import io from 'socket.io-client';

const AGORA_APP_ID = process.env.REACT_APP_AGORA_APP_ID;
const AGORA_TOKEN_URL = process.env.REACT_APP_AGORA_TOKEN_URL;
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

const socket = io(SOCKET_URL);

export const initiateCall = async (receiverId, callType, senderId) => {
  try {
    // Step 1: Request Agora token from backend
    const tokenResponse = await axios.get(AGORA_TOKEN_URL, {
      params: {
        channel: receiverId,
        uid: senderId,
      },
    });

    const token = tokenResponse.data.token;
    if (!token) throw new Error('No token received');

    // Step 2: Notify via socket
    socket.emit('call-user', {
      callerId: senderId,
      receiverId,
      callType,
      channelName: receiverId,
    });

    // Step 3: Save offer to backend (optional logging)
    await axios.post(`${process.env.REACT_APP_API_BASE_URL}/calls/offer`, {
      from: senderId,
      to: receiverId,
      callType,
      channelName: receiverId,
    });

    // Step 4: Open Agora call in new window
    const lobbyUrl = `${window.location.origin}/agora-lobby?channel=${receiverId}&token=${encodeURIComponent(token)}&uid=${senderId}`;
    window.open(lobbyUrl, '_blank', 'width=1000,height=700');

  } catch (error) {
    console.error('Agora call error:', error.message || error);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
};
