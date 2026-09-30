import React, { useState } from 'react';
import { GameMode, PlayerColor, TimeControl, TIME_CONTROLS } from '../hooks/useChessGame';
import { BotDifficulty } from '../utils/chessBot';
import { Bot, Users, Clock, ShieldCheck, X, Globe, Sparkles } from 'lucide-react';

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (
    mode: GameMode,
    color: PlayerColor,
    timeControl: TimeControl,
    difficulty: BotDifficulty
  ) => void;
  onOpenOnline?: () => void;
  currentMode: GameMode;
  currentColor: PlayerColor;
  currentTimeControl: TimeControl;
  currentDifficulty: BotDifficulty;
}

export const NewGameModal: React.FC<NewGameModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
  onOpenOnline,
  currentMode,
  currentColor,
  currentTimeControl,
  currentDifficulty,
}) => {
  const [mode, setMode] = useState<GameMode>(currentMode);
  const [color, setColor] = useState<PlayerColor | 'random'>(currentColor);
  const [timeControl, setTimeControl] = useState<TimeControl>(currentTimeControl);
  const [difficulty, setDifficulty] = useState<BotDifficulty>(currentDifficulty);

  if (!isOpen) return null;

  const handleStart = () => {
    let resolvedColor: PlayerColor = 'w';
    if (color === 'random') {
      resolvedColor = Math.random() < 0.5 ? 'w' : 'b';
    } else {
      resolvedColor = color;
    }

    onStartGame(mode, resolvedColor, timeControl, difficulty);
    onClose();
  };

  const difficultyLevels: { id: BotDifficulty; name: string; elo: number; desc: string }[] = [
    { id: 'novice', name: 'Novice', elo: 600, desc: 'Casual friendly with basic capture logic' },
    { id: 'casual', name: 'Club', elo: 1100, desc: 'Positional awareness & active pieces' },
    { id: 'intermediate', name: 'Expert', elo: 1550, desc: '2-ply minimax & center control' },
    { id: 'master', name: 'Master', elo: 1950, desc: '3-ply deep search + tactical sharpness' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative bg-neutral-900 border border-neutral-700/80 rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display mb-1">
          Start New Game
        </h2>
        <p className="text-xs text-neutral-400 mb-6">
          Configure game mode, difficulty level, and chess clock rules
        </p>

        <div className="space-y-5">
          {/* Online Friend Banner */}
          {onOpenOnline && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 font-bold">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <span>Play With a Distant Friend</span>
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300">
                      LIVE
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-300">
                    Create a room link & play in real time from anywhere
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOnline();
                }}
                className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shrink-0 transition-all shadow-sm cursor-pointer"
              >
                Create Room
              </button>
            </div>
          )}

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Local Game Mode
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMode('vs-ai')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  mode === 'vs-ai'
                    ? 'bg-amber-500/10 border-amber-500/60 text-white'
                    : 'bg-neutral-800/40 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    mode === 'vs-ai' ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Play Solo vs AI</div>
                  <div className="text-[11px] text-neutral-400">Intelligent computer engine</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('pass-and-play')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  mode === 'pass-and-play'
                    ? 'bg-amber-500/10 border-amber-500/60 text-white'
                    : 'bg-neutral-800/40 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    mode === 'pass-and-play' ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Pass & Play</div>
                  <div className="text-[11px] text-neutral-400">Two players on one device</div>
                </div>
              </button>
            </div>
          </div>

          {/* AI Difficulty (If vs-ai) */}
          {mode === 'vs-ai' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                AI Difficulty Engine
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {difficultyLevels.map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setDifficulty(lvl.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      difficulty === lvl.id
                        ? 'bg-neutral-800 border-amber-500/80 text-white shadow-sm'
                        : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:bg-neutral-800/50'
                    }`}
                  >
                    <div className="text-xs font-semibold">{lvl.name}</div>
                    <div className="text-[10px] font-mono text-amber-400 font-bold mt-0.5">
                      ~{lvl.elo} Elo
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Play As Color */}
          {mode === 'vs-ai' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Play As
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setColor('w')}
                  className={`py-2 px-3 rounded-xl border text-center font-medium text-xs transition-all ${
                    color === 'w'
                      ? 'bg-slate-200 text-neutral-950 border-white font-bold'
                      : 'bg-neutral-800/40 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  Silver (White)
                </button>
                <button
                  type="button"
                  onClick={() => setColor('random')}
                  className={`py-2 px-3 rounded-xl border text-center font-medium text-xs transition-all ${
                    color === 'random'
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                      : 'bg-neutral-800/40 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  Random
                </button>
                <button
                  type="button"
                  onClick={() => setColor('b')}
                  className={`py-2 px-3 rounded-xl border text-center font-medium text-xs transition-all ${
                    color === 'b'
                      ? 'bg-neutral-950 text-white border-neutral-600 font-bold shadow-inner'
                      : 'bg-neutral-800/40 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  Obsidian (Black)
                </button>
              </div>
            </div>
          )}

          {/* Time Controls */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              Time Control
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(Object.keys(TIME_CONTROLS) as TimeControl[]).map((tc) => (
                <button
                  key={tc}
                  type="button"
                  onClick={() => setTimeControl(tc)}
                  className={`py-2 px-2 rounded-xl border text-center font-mono text-xs transition-all ${
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
        </div>

        {/* Start Game Action */}
        <div className="mt-8 pt-4 border-t border-neutral-800 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStart}
            className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            Start Match
          </button>
        </div>
      </div>
    </div>
  );
};
