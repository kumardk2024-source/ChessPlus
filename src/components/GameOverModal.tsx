import React, { useMemo } from 'react';
import { GameStatus, MoveRecord } from '../hooks/useChessGame';
import { Trophy, RefreshCw, X, ShieldAlert, Award, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';

import { ThemeMode } from '../context/ThemeContext';

interface GameOverModalProps {
  status: GameStatus;
  history?: MoveRecord[];
  onRematch: () => void;
  onNewGameConfig: () => void;
  onClose: () => void;
  theme?: ThemeMode;
}

// Piece point values for material estimation
const PIECE_WEIGHTS: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

function computeFenAdvantage(fen: string): number {
  const parts = fen.split(' ');
  const piecePlacement = parts[0];
  let whiteMaterial = 0;
  let blackMaterial = 0;

  for (const char of piecePlacement) {
    if (char === '/' || !isNaN(Number(char))) continue;
    const lower = char.toLowerCase();
    const weight = PIECE_WEIGHTS[lower] || 0;
    if (char === char.toUpperCase()) {
      whiteMaterial += weight;
    } else {
      blackMaterial += weight;
    }
  }

  return whiteMaterial - blackMaterial; // Positive = Silver lead, Negative = Obsidian lead
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  status,
  history = [],
  onRematch,
  onNewGameConfig,
  onClose,
  theme = 'normal',
}) => {
  if (!status.isOver) return null;

  const isDarkTheme = theme === 'dark';
  const isDraw = status.winner === 'draw';
  const isWhiteWin = status.winner === 'w';

  // Compute graph datapoints across all plies
  const chartData = useMemo(() => {
    const points = [{ ply: 0, move: 'Start', advantage: 0 }];

    history.forEach((rec, idx) => {
      const adv = computeFenAdvantage(rec.fen);
      points.push({
        ply: idx + 1,
        move: rec.san,
        advantage: adv,
      });
    });

    return points;
  }, [history]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className={`relative border rounded-2xl p-6 sm:p-7 max-w-lg w-full text-center max-h-[90vh] overflow-y-auto ${
          isDarkTheme
            ? 'bg-gradient-to-b from-neutral-900 to-neutral-950 border-neutral-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]'
            : 'bg-gradient-to-b from-white to-[#fbf8f3] border-stone-300 shadow-[0_25px_60px_-15px_rgba(80,50,20,0.25)]'
        }`}
      >
        {/* Dismiss Button to view board */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors cursor-pointer ${
            isDarkTheme
              ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
          }`}
          title="Review final board"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          {isDraw ? (
            <ShieldAlert className={`w-7 h-7 ${isDarkTheme ? 'text-neutral-300' : 'text-stone-600'}`} />
          ) : (
            <Trophy className="w-7 h-7 text-amber-500" />
          )}
        </div>

        <h2
          className={`text-xl sm:text-2xl font-bold tracking-tight font-display mb-1 ${
            isDarkTheme ? 'text-white' : 'text-stone-900'
          }`}
        >
          {isDraw ? 'Game Drawn' : isWhiteWin ? 'Silver Triumphs' : 'Obsidian Triumphs'}
        </h2>

        <p
          className={`text-xs mb-4 font-medium ${
            isDarkTheme ? 'text-neutral-400' : 'text-stone-500'
          }`}
        >
          {status.reason}
        </p>

        {/* Recharts Material Advantage Timeline Graph */}
        {chartData.length > 1 && (
          <div
            className={`mb-5 p-3.5 rounded-xl border text-left ${
              isDarkTheme
                ? 'bg-neutral-950/70 border-neutral-800/90'
                : 'bg-stone-50 border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`flex items-center gap-1.5 text-xs font-semibold ${
                  isDarkTheme ? 'text-neutral-300' : 'text-stone-700'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                Material Momentum
              </span>
              <div className="flex items-center gap-3 text-[10px] font-mono text-neutral-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  +Silver
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  -Obsidian
                </span>
              </div>
            </div>

            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="advantageGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="ply"
                    stroke={isDarkTheme ? '#525252' : '#a8a29e'}
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => (val === 0 ? '0' : `${Math.ceil(val / 2)}`)}
                  />
                  <YAxis
                    stroke={isDarkTheme ? '#525252' : '#a8a29e'}
                    fontSize={10}
                    tickLine={false}
                    domain={[-10, 10]}
                    ticks={[-8, -4, 0, 4, 8]}
                    tickFormatter={(val) => (val > 0 ? `+${val}` : `${val}`)}
                  />
                  <ReferenceLine y={0} stroke={isDarkTheme ? '#404040' : '#d6d3d1'} strokeDasharray="3 3" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const adv = data.advantage;
                        const leadText =
                          adv === 0
                            ? 'Equal material'
                            : adv > 0
                            ? `+${adv} Silver (White)`
                            : `${adv} Obsidian (Black)`;

                        return (
                          <div
                            className={`p-2 rounded-lg text-xs shadow-xl font-mono border ${
                              isDarkTheme
                                ? 'bg-neutral-900 border-neutral-700 text-neutral-200'
                                : 'bg-white border-stone-300 text-stone-800'
                            }`}
                          >
                            <div className="text-neutral-400">
                              Move {Math.ceil(data.ply / 2)} {data.move ? `(${data.move})` : ''}
                            </div>
                            <div className="font-bold text-amber-500 mt-0.5">
                              {leadText}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="advantage"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#advantageGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 sm:gap-3">
          <button
            onClick={onRematch}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm transition-all duration-150 transform hover:-translate-y-0.5 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Instant Rematch</span>
          </button>

          <button
            onClick={onNewGameConfig}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm border transition-colors cursor-pointer ${
              isDarkTheme
                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
            }`}
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>Customize New Game</span>
          </button>

          <button
            onClick={onClose}
            className={`text-xs transition-colors pt-1 cursor-pointer ${
              isDarkTheme
                ? 'text-neutral-500 hover:text-neutral-300'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Review Board Position
          </button>
        </div>
      </div>
    </div>
  );
};
