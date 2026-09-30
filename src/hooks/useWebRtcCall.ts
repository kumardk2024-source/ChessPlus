import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseWebRtcCallProps {
  ws: WebSocket | null;
  roomId: string | null;
  playerName: string;
  peerConnected: boolean;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useWebRtcCall({ ws, roomId, playerName, peerConnected }: UseWebRtcCallProps) {
  const [isInCall, setIsInCall] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(false);
  const [isPeerCalling, setIsPeerCalling] = useState<boolean>(false);
  const [isPeerAudioMuted, setIsPeerAudioMuted] = useState<boolean>(false);
  const [isPeerVideoEnabled, setIsPeerVideoEnabled] = useState<boolean>(false);
  const [callError, setCallError] = useState<string | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  // Send signaling message through WebSocket
  const sendSignal = useCallback(
    (signalData: any, callType: 'audio' | 'video' = 'audio') => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'WEBRTC_SIGNAL',
            signalData,
            callType,
          })
        );
      }
    },
    [ws]
  );

  const sendCallStatus = useCallback(
    (calling: boolean, audioEnabled: boolean, videoEnabled: boolean) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'CALL_STATUS',
            isCalling: calling,
            isAudioEnabled: audioEnabled,
            isVideoEnabled: videoEnabled,
            playerName,
          })
        );
      }
    },
    [ws, playerName]
  );

  // Stop local media tracks
  const stopLocalMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }, []);

  // Cleanup peer connection
  const closePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    stopLocalMedia();
    setIsInCall(false);
    setIsVideoEnabled(false);
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
  }, [stopLocalMedia]);

  // Create Peer Connection
  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({ type: 'candidate', candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      remoteStreamRef.current = stream;

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.play().catch(() => {});
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        closePeerConnection();
      }
    };

    // Add local tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    return pc;
  }, [closePeerConnection, sendSignal]);

  // Start Voice or Video Call
  const startCall = async (withVideo = false) => {
    setCallError(null);
    try {
      // Request mic and camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: withVideo ? { width: { ideal: 640 }, height: { ideal: 480 } } : false,
      });

      localStreamRef.current = stream;
      if (withVideo && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setIsInCall(true);
      setIsVideoEnabled(withVideo);
      setIsAudioMuted(false);
      sendCallStatus(true, true, withVideo);

      const pc = createPeerConnection();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      sendSignal({ type: 'offer', sdp: offer.sdp }, withVideo ? 'video' : 'audio');
    } catch (err: any) {
      console.warn('Call start failed:', err);
      setCallError('Microphone or Camera access was denied or not found.');
      setIsInCall(false);
    }
  };

  // End Call
  const endCall = () => {
    sendCallStatus(false, false, false);
    sendSignal({ type: 'hangup' });
    closePeerConnection();
  };

  // Toggle Mute Audio
  const toggleMuteAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const newMuted = !audioTrack.enabled;
        setIsAudioMuted(newMuted);
        sendCallStatus(true, !newMuted, isVideoEnabled);
      }
    }
  };

  // Toggle Video (Camera on/off)
  const toggleVideo = async () => {
    if (!isInCall) {
      startCall(true);
      return;
    }

    if (isVideoEnabled) {
      // Stop video track
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.stop();
          localStreamRef.current.removeTrack(videoTrack);
        }
      }
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      setIsVideoEnabled(false);
      sendCallStatus(true, !isAudioMuted, false);
    } else {
      // Add video track
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
        });
        const videoTrack = videoStream.getVideoTracks()[0];
        if (localStreamRef.current && videoTrack) {
          localStreamRef.current.addTrack(videoTrack);
          if (peerConnectionRef.current) {
            peerConnectionRef.current.addTrack(videoTrack, localStreamRef.current);
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            sendSignal({ type: 'offer', sdp: offer.sdp }, 'video');
          }
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
        setIsVideoEnabled(true);
        sendCallStatus(true, !isAudioMuted, true);
      } catch (err) {
        setCallError('Could not start camera.');
      }
    }
  };

  // Handle incoming signaling messages from peer
  const handleSignalingData = useCallback(
    async (signalData: any, callType: 'audio' | 'video' = 'audio') => {
      try {
        if (signalData.type === 'offer') {
          // If we receive an offer and not yet in call, auto-answer or prepare peer connection
          if (!localStreamRef.current) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true },
                video: callType === 'video',
              });
              localStreamRef.current = stream;
              if (callType === 'video' && localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
              }
              setIsInCall(true);
              setIsVideoEnabled(callType === 'video');
              sendCallStatus(true, true, callType === 'video');
            } catch (err) {
              console.warn('Microphone permission request for answer failed', err);
              return;
            }
          }

          let pc = peerConnectionRef.current;
          if (!pc) {
            pc = createPeerConnection();
          }

          await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: signalData.sdp }));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          sendSignal({ type: 'answer', sdp: answer.sdp });
        } else if (signalData.type === 'answer') {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(
              new RTCSessionDescription({ type: 'answer', sdp: signalData.sdp })
            );
          }
        } else if (signalData.type === 'candidate') {
          if (peerConnectionRef.current && signalData.candidate) {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signalData.candidate));
          }
        } else if (signalData.type === 'hangup') {
          closePeerConnection();
        }
      } catch (err) {
        console.error('WebRTC signal processing error:', err);
      }
    },
    [closePeerConnection, createPeerConnection, sendCallStatus, sendSignal]
  );

  // If peer disconnects from room, end call
  useEffect(() => {
    if (!peerConnected && isInCall) {
      closePeerConnection();
    }
  }, [peerConnected, isInCall, closePeerConnection]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      closePeerConnection();
    };
  }, [closePeerConnection]);

  return {
    isInCall,
    isAudioMuted,
    isVideoEnabled,
    isPeerCalling,
    isPeerAudioMuted,
    isPeerVideoEnabled,
    callError,
    localVideoRef,
    remoteVideoRef,
    remoteAudioRef,
    startCall,
    endCall,
    toggleMuteAudio,
    toggleVideo,
    handleSignalingData,
    setIsPeerCalling,
    setIsPeerAudioMuted,
    setIsPeerVideoEnabled,
  };
}
