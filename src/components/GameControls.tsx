import React from 'react';
import {
  RotateCcw,
  Flag,
  Handshake,
  RotateCw,
  Volume2,
  VolumeX,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';

import { ThemeMode } from '../context/ThemeContext';

interface GameControlsProps {
  onUndo: () => void;
  onResign: () => void;
  onOfferDraw: () => void;
  onFlipBoard: () => void;
  onNewGame: () => void;
  onOpenRules: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  canUndo: boolean;
  isGameOver: boolean;
  isAiThinking: boolean;
  theme?: ThemeMode;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onUndo,
  onResign,
  onOfferDraw,
  onFlipBoard,
  onNewGame,
  onOpenRules,
  isMuted,
  onToggleMute,
  canUndo,
  isGameOver,
  isAiThinking,
  theme = 'normal',
}) => {
  const isDarkTheme = theme === 'dark';

  return (
    <div
      className={`w-full max-w-[580px] mx-auto flex items-center justify-between gap-1.5 sm:gap-2 p-2 rounded-xl border transition-colors duration-200 ${
        isDarkTheme
          ? 'bg-neutral-900/60 border-neutral-800'
          : 'bg-[#fbf9f5] border-stone-300 shadow-sm'
      }`}
    >
      {/* Primary: New Match */}
      <button
        onClick={onNewGame}
        className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
        title="Start a new game"
      >
        <PlusCircle className="w-4 h-4" />
        <span className="hidden sm:inline">New Game</span>
        <span className="sm:hidden">New</span>
      </button>

      {/* Center Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        <button
          onClick={onUndo}
          disabled={!canUndo || isGameOver || isAiThinking}
          className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            canUndo && !isGameOver && !isAiThinking
              ? isDarkTheme
                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border-neutral-700'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300 shadow-xs'
              : 'opacity-40 bg-neutral-900 text-neutral-500 border-neutral-800 cursor-not-allowed'
          }`}
          title="Undo last move (Shortcut: U)"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
          <span>Undo</span>
          <kbd
            className={`hidden sm:inline text-[9px] font-mono px-1 py-0.2 rounded border ${
              isDarkTheme
                ? 'bg-neutral-900 text-neutral-400 border-neutral-700/60'
                : 'bg-stone-200 text-stone-600 border-stone-300'
            }`}
          >
            U
          </kbd>
        </button>

        <button
          onClick={onFlipBoard}
          className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
            isDarkTheme
              ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300 shadow-xs'
          }`}
          title="Flip board orientation (Shortcut: F)"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Flip</span>
          <kbd
            className={`hidden lg:inline text-[9px] font-mono px-1 py-0.2 rounded border ${
              isDarkTheme
                ? 'bg-neutral-900 text-neutral-400 border-neutral-700/60'
                : 'bg-stone-200 text-stone-600 border-stone-300'
            }`}
          >
            F
          </kbd>
        </button>

        <button
          onClick={onOfferDraw}
          disabled={isGameOver || isAiThinking}
          className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
            !isGameOver && !isAiThinking
              ? isDarkTheme
                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
              : 'opacity-40 bg-neutral-900 text-neutral-500 border-neutral-800 cursor-not-allowed'
          }`}
          title="Offer a draw"
        >
          <Handshake className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Draw</span>
        </button>

        <button
          onClick={onResign}
          disabled={isGameOver || isAiThinking}
          className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
            !isGameOver && !isAiThinking
              ? isDarkTheme
                ? 'bg-neutral-800 hover:bg-rose-950/40 text-neutral-300 hover:text-rose-300 border-neutral-700 hover:border-rose-900'
                : 'bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 border-stone-300 hover:border-rose-300'
              : 'opacity-40 bg-neutral-900 text-neutral-500 border-neutral-800 cursor-not-allowed'
          }`}
          title="Resign game (Shortcut: R)"
        >
          <Flag className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Resign</span>
          <kbd
            className={`hidden lg:inline text-[9px] font-mono px-1 py-0.2 rounded border ${
              isDarkTheme
                ? 'bg-neutral-900 text-neutral-400 border-neutral-700/60'
                : 'bg-stone-200 text-stone-600 border-stone-300'
            }`}
          >
            R
          </kbd>
        </button>
      </div>

      {/* Right: Audio & Info */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleMute}
          className={`relative p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
            !isMuted
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:bg-amber-500/20'
              : isDarkTheme
              ? 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 border-neutral-700'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border-stone-300'
          }`}
          title={isMuted ? 'Unmute sounds' : 'Mute sounds (Audio Active)'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-neutral-400" />
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
              <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
              </span>
            </>
          )}
        </button>

        <button
          onClick={onOpenRules}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
            isDarkTheme
              ? 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
          }`}
          title="Rules & Shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
