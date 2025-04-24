import axios from 'axios';
import io from 'socket.io-client';
import AgoraRTC from 'agora-rtc-sdk-ng';

// ENV variables
const AGORA_APP_ID = process.env.REACT_APP_AGORA_APP_ID;
const AGORA_TOKEN_URL = process.env.REACT_APP_AGORA_TOKEN_URL;
const socket = io(process.env.REACT_APP_SOCKET_URL);

// Agora track references
let agoraClient = null;
let localAudioTrack = null;
let localVideoTrack = null;

export const initiateCall = async (receiverId, callType, senderId) => {
  try {
    // Step 1: Get Agora token from your backend
    const tokenResponse = await axios.get(AGORA_TOKEN_URL, {
      params: {
        channel: receiverId, // Use receiverId as unique channel name
        uid: senderId,
      },
    });

    const token = tokenResponse.data.token;
    if (!token) {
      console.error('Token generation failed.');
      return;
    }

    // Step 2: Initialize Agora client
    agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    await agoraClient.join(AGORA_APP_ID, receiverId, token, senderId);

    // Step 3: Create and publish local audio/video tracks
    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    await agoraClient.publish([localAudioTrack, localVideoTrack]);

    // Step 4: Display local video (Ensure you have a <div id="local-video"></div> in UI)
    const localContainer = document.getElementById('local-video');
    if (localContainer) {
      localVideoTrack.play(localContainer);
    }

    // Step 5: Notify the receiver via socket
    socket.emit('call-user', {
      callerId: senderId,
      receiverId,
      callType,
      channelName: receiverId,
    });

    // Step 6: Log call in backend
    await axios.post(`${process.env.REACT_APP_API_BASE_URL}/calls/offer`, {
      from: senderId,
      to: receiverId,
      callType,
      channelName: receiverId,
    });

    // Step 7: Handle remote user stream
    agoraClient.on('user-published', async (user, mediaType) => {
      await agoraClient.subscribe(user, mediaType);
      if (mediaType === 'video') {
        const remotePlayer = document.createElement('div');
        remotePlayer.id = `remote-${user.uid}`;
        remotePlayer.style.width = '100%';
        remotePlayer.style.height = '100%';
        const remoteContainer = document.getElementById('remote-video');
        if (remoteContainer) {
          remoteContainer.appendChild(remotePlayer);
          user.videoTrack.play(remotePlayer);
        }
      }
    });

  } catch (error) {
    console.error('Error initiating Agora call:', error.message || error);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
};
