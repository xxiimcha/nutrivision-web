import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';

const VideoCall = () => {
  const [searchParams] = useSearchParams();
  const appId = searchParams.get('appId');
  const rawToken = searchParams.get('token');
  const token = rawToken ? decodeURIComponent(rawToken) : null;
  const channelName = searchParams.get('channelName');
  const uid = searchParams.get('uid') || null;
  const signalId = searchParams.get('signalId');

  const [client] = useState(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));
  const [localTracks, setLocalTracks] = useState([]);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  useEffect(() => {
    if (!appId || !channelName) {
      alert('Missing required Agora parameters.');
      return;
    }

    const requestPermissions = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch (err) {
        alert('Please allow microphone and camera access to continue.');
        throw err;
      }
    };

    const init = async () => {
      try {
        await requestPermissions();

        console.log('Joining Agora channel with:', { appId, channelName, uid, token });

        await client.join(appId, channelName, token, uid);

        const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalTracks([microphoneTrack, cameraTrack]);

        const container = document.getElementById('video-container');
        const playerContainer = document.createElement('div');
        playerContainer.style.width = '100%';
        playerContainer.style.height = '100%';
        container.appendChild(playerContainer);

        cameraTrack.play(playerContainer);
        await client.publish([microphoneTrack, cameraTrack]);

        console.log('Local tracks published.');
      } catch (err) {
        console.error('Error joining Agora channel:', err);
        alert('Failed to join video call: ' + err.message);
      }
    };

    init();

    return () => {
      const cleanup = async () => {
        localTracks.forEach(track => {
          track.stop();
          track.close();
        });
        await client.leave();
        console.log('Call ended and tracks cleaned up.');
      };
      cleanup();
    };
  }, [appId, token, channelName, uid, client]);

  const handleLeaveCall = async () => {
    localTracks.forEach(track => {
      track.stop();
      track.close();
    });
    await client.leave();

    if (signalId) {
      try {
        await fetch(`/api/calls/signal/${signalId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'ended' }),
        });
      } catch (err) {
        console.error('Failed to update call signal:', err);
      }
    }

    window.close(); // close popup
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
        <button onClick={toggleMic} style={buttonIconStyle(isMicMuted ? '#ffc107' : '#1976d2')} title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}>
          {isMicMuted ? <MicOffIcon fontSize="medium" /> : <MicIcon fontSize="medium" />}
        </button>

        <button onClick={toggleCamera} style={buttonIconStyle(isCameraOff ? '#ffc107' : '#1976d2')} title={isCameraOff ? 'Turn On Camera' : 'Turn Off Camera'}>
          {isCameraOff ? <VideocamOffIcon fontSize="medium" /> : <VideocamIcon fontSize="medium" />}
        </button>

        <button onClick={handleLeaveCall} style={buttonIconStyle('#d32f2f')} title="Leave Call">
          <CallEndIcon fontSize="medium" />
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
