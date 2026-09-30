import React, { useState } from 'react';
import { Square, PieceSymbol, Color } from 'chess.js';
import { motion, AnimatePresence } from 'motion/react';
import { ChessPiece } from './ChessPiece';

interface ChessboardProps {
  board: ({ square: Square; type: PieceSymbol; color: Color } | null)[][];
  flipped: boolean;
  selectedSquare: Square | null;
  legalMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  checkSquare: Square | null;
  onSquareClick: (square: Square) => void;
  onMovePiece: (from: Square, to: Square) => void;
  disabled?: boolean;
  theme?: 'normal' | 'dark' | 'futuristic';
}

export const Chessboard: React.FC<ChessboardProps> = ({
  board,
  flipped,
  selectedSquare,
  legalMoves,
  lastMove,
  checkSquare,
  onSquareClick,
  onMovePiece,
  disabled = false,
  theme = 'normal',
}) => {
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayedFiles = flipped ? [...files].reverse() : files;
  const displayedRanks = flipped ? [...ranks].reverse() : ranks;

  const handleDragStart = (e: React.DragEvent, sq: Square) => {
    if (disabled) return;
    setDraggedSquare(sq);
    e.dataTransfer.setData('text/plain', sq);
    e.dataTransfer.effectAllowed = 'move';
    if (selectedSquare !== sq) {
      onSquareClick(sq);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSquare: Square) => {
    e.preventDefault();
    const fromSquare = e.dataTransfer.getData('text/plain') as Square;
    if (fromSquare && fromSquare !== targetSquare) {
      onMovePiece(fromSquare, targetSquare);
    }
    setDraggedSquare(null);
  };

  // Convert board into flat piece list with coordinates
  const pieceElements: React.ReactNode[] = [];
  for (let rIdx = 0; rIdx < 8; rIdx++) {
    for (let cIdx = 0; cIdx < 8; cIdx++) {
      const rankNum = 8 - rIdx;
      const fileChar = String.fromCharCode(97 + cIdx);
      const sq = `${fileChar}${rankNum}` as Square;

      const rowIdx = flipped ? 7 - rIdx : rIdx;
      const colIdx = flipped ? 7 - cIdx : cIdx;

      const piece = board[rIdx]?.[cIdx];
      if (!piece) continue;

      const isPieceSelected = selectedSquare === sq;
      const isJustMoved = lastMove?.to === sq;
      const isDragged = draggedSquare === sq;

      pieceElements.push(
        <motion.div
          key={`${sq}-${piece.color}${piece.type}`}
          layoutId={`piece-${sq}`}
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 32,
            mass: 0.8,
          }}
          style={{
            position: 'absolute',
            width: '12.5%',
            height: '12.5%',
            left: `${colIdx * 12.5}%`,
            top: `${rowIdx * 12.5}%`,
            zIndex: isDragged ? 40 : isPieceSelected ? 30 : isJustMoved ? 20 : 10,
          }}
          className="flex items-center justify-center p-1 sm:p-1.5 pointer-events-auto cursor-grab active:cursor-grabbing"
          draggable={!disabled}
          onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, sq)}
          onDragEnd={() => setDraggedSquare(null)}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onSquareClick(sq);
          }}
          initial={false}
          animate={{
            scale: isPieceSelected ? 1.14 : isJustMoved ? [1.1, 1] : 1,
            opacity: isDragged ? 0.35 : 1,
          }}
          whileHover={{
            scale: disabled ? 1 : 1.08,
            transition: { duration: 0.12 },
          }}
          whileTap={{
            scale: 0.96,
          }}
        >
          <ChessPiece type={piece.type} color={piece.color} themeOverride={theme} />
        </motion.div>
      );
    }
  }

  const isFuturistic = theme === 'futuristic';
  const isDarkTheme = theme === 'dark' || isFuturistic;

  return (
    <div
      className={`relative w-full aspect-square max-w-[580px] mx-auto select-none rounded-2xl p-2 sm:p-3 transition-all duration-300 ${
        isFuturistic
          ? 'bg-gradient-to-b from-[#090d16] via-[#05070c] to-[#090d16] border border-cyan-500/40 shadow-[0_25px_60px_-10px_rgba(6,182,212,0.3),0_0_35px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20'
          : isDarkTheme
          ? 'bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(255,255,255,0.02)]'
          : 'bg-gradient-to-b from-[#e8d7c1] via-[#dccbb3] to-[#cfbea4] border border-[#b8a388] shadow-[0_20px_45px_-10px_rgba(80,50,20,0.28),0_4px_16px_rgba(0,0,0,0.08)]'
      }`}
    >
      {/* Outer Board Frame */}
      <div
        className={`relative w-full h-full rounded-xl overflow-hidden border shadow-inner ${
          isFuturistic
            ? 'border-cyan-500/30 shadow-[inset_0_0_20px_rgba(6,182,212,0.15)]'
            : isDarkTheme
            ? 'border-neutral-800/80'
            : 'border-[#8e6b47]/60'
        }`}
      >
        {/* Background Grid of Squares */}
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
          {displayedRanks.map((rank, rankIndex) =>
            displayedFiles.map((file, fileIndex) => {
              const square = `${file}${rank}` as Square;
              const fileCharIndex = file.charCodeAt(0) - 97;
              const rankNum = parseInt(rank, 10);
              const rIndex = 8 - rankNum;
              const cIndex = fileCharIndex;
              const piece = board[rIndex]?.[cIndex];

              // Checkered alternating squares
              const isLight = (fileCharIndex + rankNum) % 2 === 1;
              const isSelected = selectedSquare === square;
              const isLegalTarget = legalMoves.includes(square);
              const isLastMoveFrom = lastMove?.from === square;
              const isLastMoveTo = lastMove?.to === square;
              const isLastMove = isLastMoveFrom || isLastMoveTo;
              const isKingInCheck = checkSquare === square;
              const isEnemyPiece = piece && isLegalTarget;

              // Coordinate labels
              const showFileCoord = rankIndex === 7;
              const showRankCoord = fileIndex === 0;

              // Square background colors based on theme
              let squareBgClass = '';
              if (isFuturistic) {
                // Cyber Matrix: Dark Slate Cryo / Deep Void with glowing micro grid borders
                squareBgClass = isLight
                  ? 'bg-[#131b2e] hover:bg-[#1a253e] shadow-[inset_0_0_8px_rgba(6,182,212,0.08)]'
                  : 'bg-[#090d16] hover:bg-[#0f1624] shadow-[inset_0_0_12px_rgba(0,0,0,0.7)]';
              } else if (isDarkTheme) {
                squareBgClass = isLight
                  ? 'bg-[#252b36] hover:bg-[#2b3341]'
                  : 'bg-[#12161f] hover:bg-[#181d29]';
              } else {
                // Classic Warm Tournament Look: Warm Buff Cream / Rich Walnut Wood
                squareBgClass = isLight
                  ? 'bg-[#f0d9b5] hover:bg-[#f7e6ca]'
                  : 'bg-[#b58863] hover:bg-[#a67a55]';
              }

              return (
                <div
                  key={square}
                  onClick={() => !disabled && onSquareClick(square)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, square)}
                  className={`relative flex items-center justify-center transition-colors duration-150 cursor-pointer ${squareBgClass} ${
                    isLastMove
                      ? isFuturistic
                        ? 'after:absolute after:inset-0 after:bg-cyan-500/25 after:pointer-events-none'
                        : 'after:absolute after:inset-0 after:bg-amber-400/25 after:pointer-events-none'
                      : ''
                  } ${
                    isSelected
                      ? isFuturistic
                        ? 'ring-2 ring-inset ring-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : 'ring-2 ring-inset ring-amber-500/90 bg-amber-500/20'
                      : ''
                  } ${
                    isKingInCheck
                      ? 'bg-rose-950/60 ring-2 ring-rose-500/80 animate-pulse'
                      : ''
                  }`}
                  data-square={square}
                >
                  {/* Legal Move Destination: Translucent Circle Indicator for Empty Square */}
                  {isLegalTarget && !piece && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 26 }}
                      className="pointer-events-none flex items-center justify-center z-10"
                    >
                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-transform duration-150 ${
                          isFuturistic
                            ? 'bg-cyan-400/40 ring-2 ring-cyan-300/60 shadow-[0_0_14px_rgba(6,182,212,0.85)]'
                            : isDarkTheme
                            ? 'bg-white/28 ring-1 ring-white/25 shadow-[0_0_8px_rgba(255,255,255,0.2)]'
                            : isLight
                            ? 'bg-stone-800/30 ring-1 ring-stone-900/20 shadow-[0_2px_4px_rgba(0,0,0,0.15)]'
                            : 'bg-stone-950/35 ring-1 ring-stone-950/25 shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                        }`}
                      />
                    </motion.div>
                  )}

                  {/* Legal Move Destination: Translucent Circle Ring for Capturable Piece */}
                  {isEnemyPiece && (
                    <motion.div
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.85, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="absolute inset-1 sm:inset-1.5 pointer-events-none z-10 flex items-center justify-center"
                    >
                      <div
                        className={`w-full h-full rounded-full border-4 sm:border-[5px] transition-all duration-150 ${
                          isFuturistic
                            ? 'border-cyan-400/80 bg-cyan-400/20 shadow-[0_0_16px_rgba(6,182,212,0.6)] animate-pulse'
                            : isDarkTheme
                            ? 'border-white/35 bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.15)]'
                            : 'border-stone-900/35 bg-stone-900/10'
                        }`}
                      />
                    </motion.div>
                  )}

                  {/* Board Notation Labels */}
                  {showRankCoord && (
                    <span
                      className={`absolute top-0.5 left-1 text-[10px] sm:text-xs font-mono font-bold pointer-events-none select-none z-10 ${
                        isFuturistic
                          ? isLight
                            ? 'text-cyan-400/90'
                            : 'text-cyan-600/90'
                          : isDarkTheme
                          ? isLight
                            ? 'text-neutral-400/80'
                            : 'text-neutral-500/80'
                          : isLight
                          ? 'text-[#b58863]'
                          : 'text-[#f0d9b5]'
                      }`}
                    >
                      {rank}
                    </span>
                  )}
                  {showFileCoord && (
                    <span
                      className={`absolute bottom-0.5 right-1 text-[10px] sm:text-xs font-mono font-bold pointer-events-none select-none z-10 ${
                        isFuturistic
                          ? isLight
                            ? 'text-cyan-400/90'
                            : 'text-cyan-600/90'
                          : isDarkTheme
                          ? isLight
                            ? 'text-neutral-400/80'
                            : 'text-neutral-500/80'
                          : isLight
                          ? 'text-[#b58863]'
                          : 'text-[#f0d9b5]'
                      }`}
                    >
                      {file}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Animated Pieces Layer with Spring Transition */}
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence mode="popLayout">
            {pieceElements}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
