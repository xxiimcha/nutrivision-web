import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';

const VideoCall = () => {
  const [searchParams] = useSearchParams();
  const appId = searchParams.get('appId');
  const token = searchParams.get('token');
  const channelName = searchParams.get('channelName');
  const uid = searchParams.get('uid');

  const [client] = useState(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));
  const [localTracks, setLocalTracks] = useState([]);

  useEffect(() => {
    if (!appId || !channelName || !uid) {
      console.error('Missing required Agora parameters');
      return;
    }

    const init = async () => {
      try {
        // Join the channel
        await client.join(appId, channelName, token || null, uid);

        // Create microphone and camera tracks
        const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalTracks([microphoneTrack, cameraTrack]);

        // Create player container for local video
        const playerContainer = document.createElement('div');
        playerContainer.id = `player-${uid}`;
        playerContainer.style.width = '100%';
        playerContainer.style.height = '100%';

        const container = document.getElementById('video-container');
        if (container) container.appendChild(playerContainer);

        // Play local video
        cameraTrack.play(playerContainer.id);

        // Publish local tracks
        await client.publish([microphoneTrack, cameraTrack]);
        console.log('Local tracks published.');
      } catch (error) {
        console.error('Error joining Agora channel:', error);
      }
    };

    init();

    return () => {
      const cleanup = async () => {
        localTracks.forEach(track => track.stop() && track.close());
        await client.leave();
        console.log('Left Agora channel and cleaned up.');
      };
      cleanup();
    };
  }, [appId, token, channelName, uid, client]);

  const handleLeaveCall = async () => {
    localTracks.forEach(track => track.stop() && track.close());
    await client.leave();
    window.location.href = '/'; // Redirect to home or another page
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', position: 'relative' }}>
      <div id="video-container" style={{ width: '100%', height: '100%' }}></div>
      <button
        onClick={handleLeaveCall}
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 20px',
          backgroundColor: '#ff4d4f',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        Leave Call
      </button>
    </div>
  );
};

export default VideoCall;
