import React from 'react';
import { PieceSymbol, Color } from 'chess.js';
import { ChessPiece } from './ChessPiece';

interface PromotionModalProps {
  color: Color;
  onSelect: (piece: PieceSymbol) => void;
  onCancel?: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  color,
  onSelect,
}) => {
  const pieces: { type: PieceSymbol; name: string }[] = [
    { type: 'q', name: 'Queen' },
    { type: 'r', name: 'Rook' },
    { type: 'b', name: 'Bishop' },
    { type: 'n', name: 'Knight' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
        <h3 className="text-lg font-bold text-neutral-100 tracking-tight font-display mb-1">
          Pawn Promotion
        </h3>
        <p className="text-xs text-neutral-400 mb-6">
          Choose a piece to replace your promoted pawn
        </p>

        <div className="grid grid-cols-4 gap-3">
          {pieces.map((item) => (
            <button
              key={item.type}
              onClick={() => onSelect(item.type)}
              className="group flex flex-col items-center justify-center p-3 rounded-xl bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700 hover:border-amber-400/60 transition-all duration-150 transform hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-110">
                <ChessPiece type={item.type} color={color} />
              </div>
              <span className="text-[11px] font-medium text-neutral-300 group-hover:text-amber-300 mt-2">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
