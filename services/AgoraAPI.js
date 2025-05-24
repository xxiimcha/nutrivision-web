// services/AgoraAPI.js
import AgoraRTC from "agora-rtc-sdk-ng";

let client = null;
let localAudioTrack = null;
let localVideoTrack = null;

export const initiateAgoraCall = async (appId, channelName, token, uid, localVideoId, remoteVideoId) => {
  client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  await client.join(appId, channelName, token, uid);

  localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  localVideoTrack = await AgoraRTC.createCameraVideoTrack();

  const localContainer = document.getElementById(localVideoId);
  localVideoTrack.play(localContainer);

  client.publish([localAudioTrack, localVideoTrack]);

  client.on("user-published", async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    if (mediaType === "video") {
      const remoteContainer = document.getElementById(remoteVideoId);
      user.videoTrack.play(remoteContainer);
    }
    if (mediaType === "audio") {
      user.audioTrack.play();
    }
  });
};

export const leaveAgoraCall = async () => {
  if (localAudioTrack) localAudioTrack.close();
  if (localVideoTrack) localVideoTrack.close();
  if (client) {
    await client.leave();
    client.removeAllListeners();
  }
};
