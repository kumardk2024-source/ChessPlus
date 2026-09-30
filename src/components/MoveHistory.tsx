import React, { useRef, useEffect } from 'react';
import { MoveRecord } from '../hooks/useChessGame';
import { Copy, Check, FileText } from 'lucide-react';

import { ThemeMode } from '../context/ThemeContext';

interface MoveHistoryProps {
  history: MoveRecord[];
  inCheck: boolean;
  isOver: boolean;
  theme?: ThemeMode;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  history,
  inCheck,
  isOver,
  theme = 'normal',
}) => {
  const isDarkTheme = theme === 'dark';
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  // Group moves into pairs (turn #, white move, black move)
  const pairedMoves: { number: number; white?: MoveRecord; black?: MoveRecord }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    pairedMoves.push({
      number: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1],
    });
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length]);

  const copyPgn = () => {
    let pgn = '';
    pairedMoves.forEach((pair) => {
      pgn += `${pair.number}. ${pair.white?.san || ''} ${pair.black?.san || ''} `;
    });
    navigator.clipboard.writeText(pgn.trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className={`flex flex-col h-full rounded-xl border transition-colors duration-200 overflow-hidden ${
        isDarkTheme
          ? 'bg-neutral-900/60 border-neutral-800'
          : 'bg-[#fbf9f5] border-stone-300 shadow-sm'
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${
          isDarkTheme
            ? 'border-neutral-800 bg-neutral-900/80'
            : 'border-stone-200 bg-[#f5f1eb]'
        }`}
      >
        <div className="flex items-center gap-2">
          <FileText className={`w-4 h-4 ${isDarkTheme ? 'text-neutral-400' : 'text-stone-500'}`} />
          <h3
            className={`text-xs font-semibold uppercase tracking-wider ${
              isDarkTheme ? 'text-neutral-300' : 'text-stone-800'
            }`}
          >
            Move Notation
          </h3>
          <span className={`text-xs font-mono ${isDarkTheme ? 'text-neutral-500' : 'text-stone-400'}`}>
            ({history.length} {history.length === 1 ? 'ply' : 'plies'})
          </span>
        </div>

        <button
          onClick={copyPgn}
          title="Copy PGN notation"
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
            isDarkTheme
              ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border-neutral-800'
              : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200 border-stone-300 bg-stone-100'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-mono font-bold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>PGN</span>
            </>
          )}
        </button>
      </div>

      {/* Move List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-0.5 text-sm font-mono">
        {pairedMoves.length === 0 ? (
          <div
            className={`h-32 flex flex-col items-center justify-center text-xs text-center px-4 ${
              isDarkTheme ? 'text-neutral-500' : 'text-stone-400'
            }`}
          >
            <span>No moves played yet</span>
            <span className={`text-[11px] mt-1 ${isDarkTheme ? 'text-neutral-600' : 'text-stone-400'}`}>
              Make your first move on the board
            </span>
          </div>
        ) : (
          pairedMoves.map((pair, index) => {
            const isLastPair = index === pairedMoves.length - 1;
            const isWhiteLast = isLastPair && !pair.black;
            const isBlackLast = isLastPair && !!pair.black;

            return (
              <div
                key={pair.number}
                className={`grid grid-cols-12 py-1 px-2.5 rounded-lg text-xs items-center transition-colors ${
                  isDarkTheme ? 'hover:bg-neutral-800/40' : 'hover:bg-stone-200/60'
                }`}
              >
                <span className={`col-span-2 font-semibold ${isDarkTheme ? 'text-neutral-500' : 'text-stone-400'}`}>
                  {pair.number}.
                </span>

                {/* White Move */}
                <span
                  className={`col-span-5 px-2 py-0.5 rounded font-medium ${
                    isWhiteLast
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/40'
                      : isDarkTheme ? 'text-neutral-200 hover:text-white' : 'text-stone-800 hover:text-black'
                  }`}
                >
                  {pair.white?.san}
                </span>

                {/* Black Move */}
                <span
                  className={`col-span-5 px-2 py-0.5 rounded font-medium ${
                    isBlackLast
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/40'
                      : isDarkTheme ? 'text-neutral-300 hover:text-white' : 'text-stone-700 hover:text-black'
                  }`}
                >
                  {pair.black?.san || ''}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Status */}
      <div
        className={`px-4 py-2 border-t text-xs flex items-center justify-between ${
          isDarkTheme
            ? 'border-neutral-800 bg-neutral-950/60 text-neutral-400'
            : 'border-stone-200 bg-[#f5f1eb] text-stone-600'
        }`}
      >
        <div className="flex items-center gap-2">
          {inCheck && !isOver && (
            <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Check!
            </span>
          )}
          {!inCheck && !isOver && (
            <span className={`font-mono ${isDarkTheme ? 'text-neutral-500' : 'text-stone-400'}`}>
              Standard Match
            </span>
          )}
          {isOver && (
            <span className="text-amber-500 font-semibold font-mono">Game Over</span>
          )}
        </div>
      </div>
    </div>
  );
};
