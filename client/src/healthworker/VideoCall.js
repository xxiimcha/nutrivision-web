// ✅ video-call.jsx
import React, { useEffect } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const VideoCall = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const appId = urlParams.get('appId');
    const channelName = urlParams.get('channelName');
    const token = urlParams.get('token');
    const uid = urlParams.get('uid');

    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    let localTracks = [];

    async function startCall() {
      try {
        await client.join(appId, channelName, token, uid);

        localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
        localTracks[1].play('local-player');

        await client.publish(localTracks);

        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === 'video') {
            user.videoTrack.play('remote-player');
          }
          if (mediaType === 'audio') {
            user.audioTrack.play();
          }
        });

        window.addEventListener('beforeunload', async () => {
          await client.leave();
          localTracks.forEach(track => track.stop());
          localTracks.forEach(track => track.close());
        });
      } catch (error) {
        console.error('Failed to start call:', error);
      }
    }

    startCall();
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'black' }}>
      <div id="local-player" style={{ flex: 1, backgroundColor: '#222' }}></div>
      <div id="remote-player" style={{ flex: 1, backgroundColor: '#000' }}></div>
    </div>
  );
};

export default VideoCall;
