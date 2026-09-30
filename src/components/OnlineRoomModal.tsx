import React, { useState } from 'react';
import { Globe, Users, Copy, Check, Share2, Play, X, ArrowRight, ShieldCheck } from 'lucide-react';

interface OnlineRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (roomId: string, playerName: string) => void;
  initialRoomId?: string;
}

export const OnlineRoomModal: React.FC<OnlineRoomModalProps> = ({
  isOpen,
  onClose,
  onJoinRoom,
  initialRoomId = '',
}) => {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('chessplus-player-name') || 'Player ' + Math.floor(100 + Math.random() * 900);
  });
  const [createdRoomId, setCreatedRoomId] = useState<string>(() => {
    return (
      initialRoomId ||
      Math.random().toString(36).substring(2, 6).toUpperCase() +
        '-' +
        Math.random().toString(36).substring(2, 6).toUpperCase()
    );
  });
  const [inputRoomId, setInputRoomId] = useState(initialRoomId || '');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateNewRoomId = () => {
    const id =
      Math.random().toString(36).substring(2, 6).toUpperCase() +
      '-' +
      Math.random().toString(36).substring(2, 6).toUpperCase();
    setCreatedRoomId(id);
  };

  const shareableUrl = `${window.location.origin}/?room=${createdRoomId}`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(shareableUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handleStartHost = () => {
    localStorage.setItem('chessplus-player-name', playerName.trim());
    onJoinRoom(createdRoomId, playerName.trim() || 'Player 1');
    onClose();
  };

  const handleJoinExisting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRoomId.trim()) return;
    localStorage.setItem('chessplus-player-name', playerName.trim());
    onJoinRoom(inputRoomId.trim().toUpperCase(), playerName.trim() || 'Player 2');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative bg-gradient-to-b from-stone-900 to-neutral-950 border border-neutral-700/80 rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl text-neutral-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white font-display">
              Play Online With Friend
            </h2>
            <p className="text-xs text-neutral-400">
              दूर बैठे दोस्त के साथ रूम बनाकर लाइव चेस खेलें
            </p>
          </div>
        </div>

        {/* Player Name Field */}
        <div className="my-4 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
            Your Name (आपका नाम)
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            maxLength={20}
            className="w-full px-3 py-2 text-sm bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-neutral-950 border border-neutral-800 mb-5">
          <button
            type="button"
            onClick={() => setTab('create')}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'create'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Create New Room
          </button>
          <button
            type="button"
            onClick={() => setTab('join')}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'join'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Join with Code
          </button>
        </div>

        {tab === 'create' ? (
          <div className="space-y-4">
            {/* Room ID and Link Card */}
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-400">Room Code</span>
                <button
                  onClick={generateNewRoomId}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  Generate New
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-xl text-center font-bold tracking-widest text-amber-400 selection:bg-amber-500 selection:text-neutral-950">
                {createdRoomId}
              </div>

              {/* Shareable Link Box */}
              <div>
                <span className="block text-xs text-neutral-400 mb-1">
                  Invite Link (मित्र को यह लिंक भेजें)
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareableUrl}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-neutral-950 border border-neutral-700/80 rounded-lg text-neutral-300 font-mono truncate select-all"
                  />
                  <button
                    onClick={copyInviteLink}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      copied
                        ? 'bg-emerald-500 text-neutral-950'
                        : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Launch Room Button */}
            <button
              onClick={handleStartHost}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm transition-all duration-150 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Room & Wait for Friend</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleJoinExisting} className="space-y-4">
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Enter Room Code (रूम कोड दर्ज करें)
              </label>
              <input
                type="text"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
                placeholder="e.g. 7X4A-9B2Q"
                className="w-full px-3 py-2.5 text-base font-mono tracking-widest text-center uppercase bg-neutral-950 border border-neutral-700 rounded-lg text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                required
              />
              <p className="text-[11px] text-neutral-400 text-center">
                Paste the room code or click the invite link your friend shared with you.
              </p>
            </div>

            <button
              type="submit"
              disabled={!inputRoomId.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 font-bold text-sm transition-all duration-150 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <span>Join Friend's Game</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
