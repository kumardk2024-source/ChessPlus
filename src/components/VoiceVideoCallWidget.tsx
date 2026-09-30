import React, { useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { useWebRtcCall } from '../hooks/useWebRtcCall';

interface VoiceVideoCallWidgetProps {
  ws: WebSocket | null;
  roomId: string | null;
  playerName: string;
  peerPlayerName?: string;
  peerConnected: boolean;
  webrtcSignal: { signalData: any; callType: 'audio' | 'video' } | null;
  peerCallStatus: {
    isCalling: boolean;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    playerName: string;
  } | null;
  isDarkTheme?: boolean;
}

export const VoiceVideoCallWidget: React.FC<VoiceVideoCallWidgetProps> = ({
  ws,
  roomId,
  playerName,
  peerPlayerName = 'Friend',
  peerConnected,
  webrtcSignal,
  peerCallStatus,
  isDarkTheme = true,
}) => {
  const {
    isInCall,
    isAudioMuted,
    isVideoEnabled,
    isPeerCalling,
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
  } = useWebRtcCall({ ws, roomId, playerName, peerConnected });

  // Handle incoming signaling messages
  useEffect(() => {
    if (webrtcSignal) {
      handleSignalingData(webrtcSignal.signalData, webrtcSignal.callType);
    }
  }, [webrtcSignal, handleSignalingData]);

  // Handle peer call status updates
  useEffect(() => {
    if (peerCallStatus) {
      setIsPeerCalling(peerCallStatus.isCalling);
      setIsPeerAudioMuted(!peerCallStatus.isAudioEnabled);
      setIsPeerVideoEnabled(peerCallStatus.isVideoEnabled);
    }
  }, [peerCallStatus, setIsPeerCalling, setIsPeerAudioMuted, setIsPeerVideoEnabled]);

  return (
    <div
      className={`w-full max-w-[580px] mx-auto rounded-xl p-3 border transition-all duration-200 ${
        isDarkTheme
          ? 'bg-neutral-900/80 border-neutral-800'
          : 'bg-[#fbf9f5] border-stone-300 shadow-sm'
      }`}
    >
      {/* Hidden audio element for remote audio stream */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Call Status & Info */}
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
              isInCall
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500'
                : peerCallStatus?.isCalling
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 animate-pulse'
                : isDarkTheme
                ? 'bg-neutral-800 border-neutral-700 text-neutral-400'
                : 'bg-stone-100 border-stone-300 text-stone-600'
            }`}
          >
            {isInCall ? (
              <Radio className="w-4 h-4 animate-pulse text-emerald-500" />
            ) : (
              <PhoneCall className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold ${
                  isDarkTheme ? 'text-neutral-200' : 'text-stone-800'
                }`}
              >
                {isInCall ? 'Voice Chat Active (लाइव बातचीत)' : 'Friend Voice/Video Call'}
              </span>
              {isInCall && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-bold border border-emerald-500/30">
                  CONNECTED
                </span>
              )}
            </div>

            <p className={`text-[11px] ${isDarkTheme ? 'text-neutral-400' : 'text-stone-500'}`}>
              {isInCall ? (
                <span>
                  Connected with <strong className="text-amber-500">{peerPlayerName}</strong>. You can talk freely!
                </span>
              ) : peerCallStatus?.isCalling ? (
                <span className="text-amber-500 font-semibold animate-pulse">
                  {peerPlayerName} is waiting on call! Click Join Call
                </span>
              ) : peerConnected ? (
                <span>Both connected! Start voice or video call to talk.</span>
              ) : (
                <span>Waiting for friend to join room to enable call.</span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Call Actions Buttons */}
        <div className="flex items-center gap-2">
          {!isInCall ? (
            <>
              {/* Voice Call Button */}
              <button
                onClick={() => startCall(false)}
                disabled={!peerConnected}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                title="Start Voice Chat"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Voice Call</span>
              </button>

              {/* Video Call Button */}
              <button
                onClick={() => startCall(true)}
                disabled={!peerConnected}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 font-bold text-xs transition-all shadow-sm cursor-pointer"
                title="Start Video Call"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Call</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {/* Mic Toggle Button */}
              <button
                onClick={toggleMuteAudio}
                className={`p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  isAudioMuted
                    ? 'bg-rose-500/20 text-rose-500 border-rose-500/40'
                    : isDarkTheme
                    ? 'bg-neutral-800 text-emerald-400 border-neutral-700 hover:bg-neutral-700'
                    : 'bg-stone-100 text-emerald-600 border-stone-300 hover:bg-stone-200'
                }`}
                title={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Camera Toggle Button */}
              <button
                onClick={toggleVideo}
                className={`p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  isVideoEnabled
                    ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                    : isDarkTheme
                    ? 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700'
                    : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200'
                }`}
                title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              {/* End Call Button */}
              <button
                onClick={endCall}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                title="End Call"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>End</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Video Screens Row (shown when either peer or local has video enabled) */}
      {isInCall && (isVideoEnabled || peerCallStatus?.isVideoEnabled) && (
        <div className="mt-3 pt-3 border-t border-neutral-800/80 grid grid-cols-2 gap-2.5">
          {/* Opponent Video */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white flex items-center gap-1">
              <span>{peerPlayerName}</span>
              {peerCallStatus?.isAudioEnabled === false && (
                <MicOff className="w-2.5 h-2.5 text-rose-400" />
              )}
            </div>
          </div>

          {/* Local User Video */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center">
            {isVideoEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="text-center p-2 text-neutral-500 text-xs">
                <VideoOff className="w-5 h-5 mx-auto mb-1 opacity-50" />
                <span>Your camera is off</span>
              </div>
            )}
            <div className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white flex items-center gap-1">
              <span>You</span>
              {isAudioMuted && <MicOff className="w-2.5 h-2.5 text-rose-400" />}
            </div>
          </div>
        </div>
      )}

      {/* Call Error Notice */}
      {callError && (
        <div className="mt-2.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{callError}</span>
        </div>
      )}
    </div>
  );
};
