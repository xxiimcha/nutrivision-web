import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';

const VideoCall = () => {
  const [searchParams] = useSearchParams();
  const appId = searchParams.get('appId');
  const token = searchParams.get('token');
  const channelName = searchParams.get('channelName');
  const uid = searchParams.get('uid');

  useEffect(() => {
    if (!appId || !channelName || !uid) {
      console.error('Missing required Agora params');
      return;
    }

    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    const init = async () => {
      try {
        await client.join(appId, channelName, token || null, uid);
        const localTrack = await AgoraRTC.createMicrophoneAndCameraTracks();
        const playerContainer = document.createElement('div');
        playerContainer.id = uid;
        playerContainer.style.width = '100%';
        playerContainer.style.height = '100%';
        document.getElementById('video-container').append(playerContainer);
        localTrack[1].play(playerContainer.id);
        await client.publish(localTrack);
        console.log('Published local tracks.');
      } catch (err) {
        console.error('Agora join error:', err);
      }
    };

    init();

    return () => {
      client.leave();
    };
  }, [appId, token, channelName, uid]);

  return <div id="video-container" style={{ width: '100vw', height: '100vh', backgroundColor: '#000' }} />;
};

export default VideoCall;
