import React from 'react';
import { Color, PieceSymbol } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import { Bot, User } from 'lucide-react';

interface PlayerCardProps {
  name: string;
  subtitle?: string;
  isAi?: boolean;
  color: Color;
  timeRemaining: number;
  totalInitialTime?: number;
  timeControl: string;
  isActiveTurn: boolean;
  capturedPieces: PieceSymbol[];
  materialLead: number;
  isThinking?: boolean;
  theme?: 'normal' | 'dark' | 'futuristic';
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  name,
  subtitle,
  isAi = false,
  color,
  timeRemaining,
  totalInitialTime = 180,
  timeControl,
  isActiveTurn,
  capturedPieces,
  materialLead,
  isThinking = false,
  theme = 'normal',
}) => {
  const isWhite = color === 'w';
  const isFuturistic = theme === 'futuristic';
  const isDarkTheme = theme === 'dark' || isFuturistic;

  // Format seconds to mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isUnlimited = timeControl === 'unlimited';
  const isLowTime = timeRemaining <= 20 && !isUnlimited;
  const isCriticalTime = timeRemaining <= 10 && !isUnlimited;

  // Fraction of time remaining (0..1), clamped
  const maxRefTime = Math.max(totalInitialTime, timeRemaining, 1);
  const timeFraction = isUnlimited ? 1 : Math.max(0, Math.min(1, timeRemaining / maxRefTime));
  const timePercentage = Math.round(timeFraction * 100);

  // SVG Radial circle calculations
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - timeFraction * circumference;

  // Piece symbol for captured pieces (show captured enemy pieces)
  const enemyColor: Color = isWhite ? 'b' : 'w';

  // Status color styling
  const timerTheme = isCriticalTime
    ? {
        border: 'border-rose-500/80',
        bg: 'bg-rose-950/80',
        text: 'text-rose-200',
        stroke: '#f43f5e',
        track: 'rgba(244, 63, 94, 0.2)',
        bar: 'from-rose-600 to-red-500',
      }
    : isLowTime
    ? {
        border: 'border-amber-500/80',
        bg: isDarkTheme ? 'bg-amber-950/70' : 'bg-amber-100',
        text: isDarkTheme ? 'text-amber-300' : 'text-amber-900',
        stroke: '#f59e0b',
        track: 'rgba(245, 158, 11, 0.2)',
        bar: 'from-amber-500 to-orange-500',
      }
    : {
        border: isActiveTurn ? 'border-amber-500/60' : isDarkTheme ? 'border-neutral-700/80' : 'border-stone-300',
        bg: isActiveTurn
          ? isDarkTheme ? 'bg-neutral-800' : 'bg-amber-50'
          : isDarkTheme ? 'bg-neutral-950/60' : 'bg-stone-100/80',
        text: isActiveTurn
          ? isDarkTheme ? 'text-neutral-100' : 'text-stone-900'
          : isDarkTheme ? 'text-neutral-300' : 'text-stone-700',
        stroke: isDarkTheme ? '#38bdf8' : '#d97706',
        track: isDarkTheme ? 'rgba(56, 189, 248, 0.15)' : 'rgba(217, 119, 6, 0.15)',
        bar: 'from-amber-500 via-amber-600 to-orange-500',
      };

  return (
    <div
      className={`relative w-full max-w-[580px] mx-auto rounded-xl border transition-all duration-200 overflow-hidden ${
        isActiveTurn
          ? isDarkTheme
            ? 'bg-neutral-900/90 border-amber-500/50 shadow-[0_0_18px_rgba(245,158,11,0.15)]'
            : 'bg-white border-amber-500/80 shadow-[0_4px_16px_rgba(217,119,6,0.18)]'
          : isDarkTheme
          ? 'bg-neutral-900/40 border-neutral-800/70'
          : 'bg-[#fbf9f5] border-stone-300/80 shadow-sm'
      }`}
    >
      <div className="px-3.5 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Avatar & Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
              isWhite
                ? 'bg-gradient-to-br from-slate-100 to-slate-300 border-slate-300 text-stone-800 shadow-sm'
                : 'bg-gradient-to-br from-neutral-800 to-neutral-950 border-neutral-700 text-neutral-200 shadow-sm'
            }`}
          >
            {isAi ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`font-semibold text-sm sm:text-base tracking-tight truncate ${
                  isDarkTheme ? 'text-neutral-100' : 'text-stone-900'
                }`}
              >
                {name}
              </span>
              <span
                className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold ${
                  isWhite
                    ? isFuturistic
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                      : isDarkTheme
                      ? 'bg-slate-200/20 text-slate-300 border border-slate-400/30'
                      : 'bg-stone-200 text-stone-700 border border-stone-300'
                    : isFuturistic
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                    : isDarkTheme
                    ? 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                    : 'bg-stone-800 text-stone-100 border border-stone-700'
                }`}
              >
                {isWhite
                  ? isFuturistic
                    ? 'Cryo-Titanium'
                    : 'Silver'
                  : isFuturistic
                  ? 'Carbon Void'
                  : 'Obsidian'}
              </span>
            </div>

            <div
              className={`flex items-center gap-2 text-xs mt-0.5 ${
                isDarkTheme ? 'text-neutral-400' : 'text-stone-500'
              }`}
            >
              {isThinking ? (
                <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  Calculating move...
                </span>
              ) : (
                <span>{subtitle || (isWhite ? 'White' : 'Black')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Captured Pieces & Timer with Radial Indicator */}
        <div className="flex items-center gap-3">
          {/* Captured Pieces Mini Tray */}
          <div className="hidden sm:flex items-center gap-0.5 min-h-[22px]">
            {capturedPieces.slice(0, 10).map((piece, i) => (
              <div key={i} className="w-4 h-4">
                <ChessPiece type={piece} color={enemyColor} />
              </div>
            ))}
            {capturedPieces.length > 10 && (
              <span
                className={`text-[10px] font-mono ml-0.5 ${
                  isDarkTheme ? 'text-neutral-400' : 'text-stone-500'
                }`}
              >
                +{capturedPieces.length - 10}
              </span>
            )}
            {materialLead > 0 && (
              <span className="text-xs font-mono font-bold text-amber-500 ml-1.5">
                +{materialLead}
              </span>
            )}
          </div>

          {/* Clock Display with Radial Ring */}
          {!isUnlimited ? (
            <div
              className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border font-mono font-bold text-base sm:text-lg tabular-nums tracking-wider transition-colors duration-200 ${
                timerTheme.bg
              } ${timerTheme.border} ${timerTheme.text} ${
                isCriticalTime ? 'animate-pulse' : ''
              }`}
            >
              {/* Radial Progress Ring */}
              <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 -rotate-90" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r={radius}
                    stroke={timerTheme.track}
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r={radius}
                    stroke={timerTheme.stroke}
                    strokeWidth="2.5"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-300 ease-out"
                  />
                </svg>
                {isActiveTurn && (
                  <span
                    className={`absolute w-1.5 h-1.5 rounded-full ${
                      isLowTime ? 'bg-rose-400 animate-ping' : 'bg-amber-500'
                    }`}
                  />
                )}
              </div>

              <span>{formatTime(timeRemaining)}</span>
            </div>
          ) : (
            <div
              className={`text-xs font-mono uppercase px-2.5 py-1 rounded border ${
                isDarkTheme
                  ? 'text-neutral-500 bg-neutral-950/40 border-neutral-800'
                  : 'text-stone-500 bg-stone-200/50 border-stone-300'
              }`}
            >
              Casual
            </div>
          )}
        </div>
      </div>

      {/* Smooth Sub-card Progress Bar when Active */}
      {!isUnlimited && isActiveTurn && (
        <div
          className={`w-full h-1 overflow-hidden ${
            isDarkTheme ? 'bg-neutral-800/80' : 'bg-stone-200'
          }`}
        >
          <div
            className={`h-full bg-gradient-to-r ${timerTheme.bar} transition-all duration-300 ease-out`}
            style={{ width: `${timePercentage}%` }}
          />
        </div>
      )}
    </div>
  );
};
