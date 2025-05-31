import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';

// ✅ Updated icon imports for react-icons v5.5+
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaPhoneSlash } from 'react-icons/fa';


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
        gap: '20px',
        zIndex: 1000
      }}>
        <button onClick={toggleMic} style={buttonIconStyle(isMicMuted ? '#ffc107' : '#1890ff')} title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}>
          {isMicMuted ? <FaMicrophoneSlash size={22} /> : <FaMicrophone size={22} />}
        </button>

        <button onClick={toggleCamera} style={buttonIconStyle(isCameraOff ? '#ffc107' : '#1890ff')} title={isCameraOff ? 'Turn On Camera' : 'Turn Off Camera'}>
          {isCameraOff ? <FaVideoSlash size={22} /> : <FaVideo size={22} />}
        </button>

        <button onClick={handleLeaveCall} style={buttonIconStyle('#ff4d4f')} title="Leave Call">
          <FaPhoneSlash size={22} />
        </button>
      </div>
    </div>
  );
};

const buttonIconStyle = (bgColor) => ({
  padding: '12px',
  backgroundColor: bgColor,
  color: '#fff',
  border: 'none',
  borderRadius: '50%',
  cursor: 'pointer',
  width: '50px',
  height: '50px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
});

export default VideoCall;
