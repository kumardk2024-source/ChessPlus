import React, { useState } from 'react';
import { GameMode, PlayerColor, TimeControl, TIME_CONTROLS } from '../hooks/useChessGame';
import { BotDifficulty } from '../utils/chessBot';
import { 
  Bot, 
  Users, 
  Clock, 
  ShieldCheck, 
  X, 
  Globe, 
  WifiOff, 
  Wifi, 
  Play, 
  Video, 
  Sparkles,
  Zap,
  Swords
} from 'lucide-react';

interface GameModeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartOfflineVsAI: (
    color: PlayerColor,
    timeControl: TimeControl,
    difficulty: BotDifficulty
  ) => void;
  onStartOfflinePassAndPlay: (
    timeControl: TimeControl
  ) => void;
  onOpenOnlineRoom: () => void;
  currentDifficulty: BotDifficulty;
  currentColor: PlayerColor;
  currentTimeControl: TimeControl;
}

export const GameModeSelectModal: React.FC<GameModeSelectModalProps> = ({
  isOpen,
  onClose,
  onStartOfflineVsAI,
  onStartOfflinePassAndPlay,
  onOpenOnlineRoom,
  currentDifficulty,
  currentColor,
  currentTimeControl,
}) => {
  // Main Tab: 'offline' vs 'online'
  const [activeTab, setActiveTab] = useState<'offline' | 'online'>('offline');
  const [offlineSubMode, setOfflineSubMode] = useState<'vs-ai' | 'pass-and-play'>('vs-ai');
  const [color, setColor] = useState<PlayerColor | 'random'>(currentColor);
  const [timeControl, setTimeControl] = useState<TimeControl>(currentTimeControl);
  const [difficulty, setDifficulty] = useState<BotDifficulty>(currentDifficulty);

  if (!isOpen) return null;

  const difficultyLevels: { id: BotDifficulty; name: string; elo: number; desc: string }[] = [
    { id: 'novice', name: 'Novice', elo: 600, desc: 'शुरुआती खिलाड़ियों के लिए आसान बॉट' },
    { id: 'casual', name: 'Club', elo: 1100, desc: 'संतुलित चालें और मोहरे की सुरक्षा' },
    { id: 'intermediate', name: 'Expert', elo: 1550, desc: 'गंभीर रणनीति और 2-कदम आगे की सोच' },
    { id: 'master', name: 'Master', elo: 1950, desc: 'ग्रैंडमास्टर स्तर की तीक्ष्ण चालें' },
  ];

  const handleStartOffline = () => {
    let resolvedColor: PlayerColor = 'w';
    if (color === 'random') {
      resolvedColor = Math.random() < 0.5 ? 'w' : 'b';
    } else {
      resolvedColor = color;
    }

    if (offlineSubMode === 'vs-ai') {
      onStartOfflineVsAI(resolvedColor, timeControl, difficulty);
    } else {
      onStartOfflinePassAndPlay(timeControl);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-700/80 rounded-2xl p-6 sm:p-7 max-w-xl w-full shadow-2xl overflow-y-auto max-h-[92vh] text-neutral-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
              Play Chess (खेल का तरीका चुनें)
            </h2>
            <p className="text-xs text-neutral-400">
              ऑनलाइन दोस्तों के साथ या बिना इंटरनेट ऑफलाइन कंप्यूटर के साथ खेलें
            </p>
          </div>
        </div>

        {/* Master Offline vs Online Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 mt-5 mb-6 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveTab('offline')}
            className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'offline'
                ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-neutral-950 shadow-md font-extrabold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <WifiOff className="w-4 h-4" />
            <span>OFFLINE (बिना इंटरनेट)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('online')}
            className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'online'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-neutral-950 shadow-md font-extrabold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>ONLINE (लाइव मुकाबला)</span>
          </button>
        </div>

        {/* TAB 1: OFFLINE MODE CONTENT */}
        {activeTab === 'offline' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Offline Badge Note */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-300">
                <WifiOff className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  <strong>100% Offline Ready:</strong> इसमें कोई इंटरनेट डेटा नहीं लगता। आप कभी भी, कहीं भी खेल सकते हैं!
                </span>
              </div>
            </div>

            {/* Offline Sub-Modes */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 font-mono">
                चुनें (Select Offline Game Type)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOfflineSubMode('vs-ai')}
                  className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    offlineSubMode === 'vs-ai'
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:bg-neutral-850'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={`p-1.5 rounded-lg ${
                        offlineSubMode === 'vs-ai' ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      <Bot className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-neutral-100">Play vs Computer</span>
                  </div>
                  <span className="text-[11px] text-neutral-400 leading-tight">
                    कंप्यूटर AI बॉट (4 कठिनाई स्तर)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setOfflineSubMode('pass-and-play')}
                  className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    offlineSubMode === 'pass-and-play'
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:bg-neutral-850'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={`p-1.5 rounded-lg ${
                        offlineSubMode === 'pass-and-play' ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-neutral-100">Pass & Play</span>
                  </div>
                  <span className="text-[11px] text-neutral-400 leading-tight">
                    एक ही मोबाइल या स्क्रीन पर 2 खिलाड़ी
                  </span>
                </button>
              </div>
            </div>

            {/* If vs AI: Bot Difficulty */}
            {offlineSubMode === 'vs-ai' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 flex items-center justify-between font-mono">
                  <span>कंप्यूटर कठिनाई (AI Difficulty)</span>
                  <span className="text-amber-400">~{difficultyLevels.find(d => d.id === difficulty)?.elo} Elo</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {difficultyLevels.map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setDifficulty(lvl.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        difficulty === lvl.id
                          ? 'bg-neutral-800 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/50'
                          : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:bg-neutral-800/50'
                      }`}
                    >
                      <div className="text-xs font-bold">{lvl.name}</div>
                      <div className="text-[10px] font-mono text-amber-400 font-semibold mt-0.5">
                        ~{lvl.elo} Elo
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* If vs AI: Choose Piece Color */}
            {offlineSubMode === 'vs-ai' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 font-mono">
                  आपका रंग (Choose Color)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setColor('w')}
                    className={`py-2 px-3 rounded-xl border text-center font-medium text-xs transition-all cursor-pointer ${
                      color === 'w'
                        ? 'bg-slate-200 text-neutral-950 border-white font-bold shadow-md'
                        : 'bg-neutral-800/40 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    ⚪ White (सफ़ेद)
                  </button>
                  <button
                    type="button"
                    onClick={() => setColor('random')}
                    className={`py-2 px-3 rounded-xl border text-center font-medium text-xs transition-all cursor-pointer ${
                      color === 'random'
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold shadow-md'
                        : 'bg-neutral-800/40 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    🎲 Random
                  </button>
                  <button
                    type="button"
                    onClick={() => setColor('b')}
                    className={`py-2 px-3 rounded-xl border text-center font-medium text-xs transition-all cursor-pointer ${
                      color === 'b'
                        ? 'bg-neutral-950 text-white border-neutral-600 font-bold shadow-md'
                        : 'bg-neutral-800/40 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    ⚫ Black (काला)
                  </button>
                </div>
              </div>
            )}

            {/* Time Control */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>समय सीमा (Time Control)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(Object.keys(TIME_CONTROLS) as TimeControl[]).map((tc) => (
                  <button
                    key={tc}
                    type="button"
                    onClick={() => setTimeControl(tc)}
                    className={`py-2 px-2 rounded-xl border text-center font-mono text-xs transition-all cursor-pointer ${
                      timeControl === tc
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-neutral-800/40 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                    }`}
                  >
                    {TIME_CONTROLS[tc].name}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Offline Game Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartOffline}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {offlineSubMode === 'vs-ai' ? 'Start Offline Match vs AI' : 'Start Pass & Play Match'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: ONLINE MODE CONTENT */}
        {activeTab === 'online' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-neutral-900 to-emerald-950/20 border border-emerald-500/40 shadow-lg">
              <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <Wifi className="w-5 h-5" />
                <span className="font-bold text-sm font-display">Live Online Multiplayer & Call</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                इंटरनेट के जरिए दोस्तों के साथ लाइव मैच खेलें। रूम बनाएँ, WhatsApp या सोशल मीडिया पर लिंक शेयर करें और गेम के दौरान लाइव वॉयस/वीडियो कॉल का मज़ा लें!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
                <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-neutral-200">Real-time Cloud Moves</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-2.5">
                  <Video className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-neutral-200">Voice & Video Call Built-in</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOnlineRoom();
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span>Create / Join Online Room (ऑनलाइन रूम बनाएँ)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
