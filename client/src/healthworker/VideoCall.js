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
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  useEffect(() => {
    if (!appId || !channelName || !uid) {
      console.error('Missing required Agora parameters');
      return;
    }

    const init = async () => {
      try {
        await client.join(appId, channelName, token || null, uid);

        const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalTracks([microphoneTrack, cameraTrack]);

        const playerContainer = document.createElement('div');
        playerContainer.id = `player-${uid}`;
        playerContainer.style.width = '100%';
        playerContainer.style.height = '100%';

        const container = document.getElementById('video-container');
        if (container) container.appendChild(playerContainer);

        cameraTrack.play(playerContainer.id);
        await client.publish([microphoneTrack, cameraTrack]);
        console.log('Local tracks published.');
      } catch (error) {
        console.error('Error joining Agora channel:', error);
        alert('Failed to access camera/mic. Please check permissions.');
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
    window.location.href = '/';
  };

  const toggleMic = async () => {
    if (localTracks[0]) {
      await localTracks[0].setEnabled(isMicMuted);
      setIsMicMuted(prev => !prev);
    }
  };

  const toggleCamera = async () => {
    if (localTracks[1]) {
      await localTracks[1].setEnabled(isCameraOff);
      setIsCameraOff(prev => !prev);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', position: 'relative' }}>
      <div id="video-container" style={{ width: '100%', height: '100%' }} />

      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '12px',
        zIndex: 1000
      }}>
        <button
          onClick={toggleMic}
          style={buttonStyle(isMicMuted ? '#ffc107' : '#1890ff')}
        >
          {isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
        </button>

        <button
          onClick={toggleCamera}
          style={buttonStyle(isCameraOff ? '#ffc107' : '#1890ff')}
        >
          {isCameraOff ? 'Turn On Camera' : 'Turn Off Camera'}
        </button>

        <button
          onClick={handleLeaveCall}
          style={buttonStyle('#ff4d4f')}
        >
          Leave Call
        </button>
      </div>
    </div>
  );
};

const buttonStyle = (bgColor) => ({
  padding: '10px 20px',
  backgroundColor: bgColor,
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  minWidth: '120px'
});

export default VideoCall;
