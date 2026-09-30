import React from 'react';
import { X, Volume2, Shield, Zap, Sparkles, Globe, Mic } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative bg-neutral-900 border border-neutral-700/80 rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display mb-1 flex items-center gap-2">
          <span>ChessPlus Guide</span>
        </h2>
        <p className="text-xs text-neutral-400 mb-6">
          Premium rules, audio feedback architecture, and intuitive controls
        </p>

        <div className="space-y-4 text-xs text-neutral-300">
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="flex items-center gap-2 font-semibold text-amber-400 mb-1.5 text-sm">
              <Globe className="w-4 h-4" />
              <span>Online Friend Multiplayer (ऑनलाइन रूम)</span>
            </div>
            <p className="leading-relaxed text-neutral-400">
              Click <strong>Play Online</strong> to generate a unique room code and shareable invite link. Send the link to your friend on WhatsApp, Telegram, or Discord. As soon as your friend opens the link, the live WebSocket room connects you both automatically.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="flex items-center gap-2 font-semibold text-emerald-400 mb-1.5 text-sm">
              <Mic className="w-4 h-4" />
              <span>Live Voice & Video Call (लाइव बातचीत)</span>
            </div>
            <p className="leading-relaxed text-neutral-400">
              When playing with a friend online, click <strong>Voice Call</strong> or <strong>Video Call</strong> to talk in real-time. Features crystal clear peer-to-peer WebRTC audio, microphone mute/unmute, and picture-in-picture camera view so you can see your friend while playing chess.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="flex items-center gap-2 font-semibold text-amber-400 mb-1.5 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Interactive Movement</span>
            </div>
            <p className="leading-relaxed text-neutral-400">
              Drag and drop any piece, or click a piece to reveal glowing green target dots for legal destination squares. Capturable enemy pieces are highlighted with a radiant crimson ring.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="flex items-center gap-2 font-semibold text-amber-400 mb-1.5 text-sm">
              <Shield className="w-4 h-4" />
              <span>Special Moves Supported</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-neutral-400 leading-relaxed">
              <li><strong className="text-neutral-200">Castling:</strong> Move King two squares toward Rook when squares between are clear and safe.</li>
              <li><strong className="text-neutral-200">En Passant:</strong> Capture an enemy pawn that just leaped two squares forward.</li>
              <li><strong className="text-neutral-200">Pawn Promotion:</strong> Automatically triggers a sleek 3D piece selector (Queen, Rook, Bishop, Knight).</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="flex items-center gap-2 font-semibold text-amber-400 mb-1.5 text-sm">
              <Volume2 className="w-4 h-4" />
              <span>Synthesized Sound Design</span>
            </div>
            <p className="leading-relaxed text-neutral-400">
              Powered by the Web Audio API with zero latency: tactile mineral board clacks for moves, resonant metallic impacts on captures, harmonic alert chimes for checks, and triumphal fanfares for game victory.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="flex items-center gap-2 font-semibold text-amber-400 mb-1.5 text-sm">
              <Zap className="w-4 h-4" />
              <span>AI Engine Levels</span>
            </div>
            <p className="leading-relaxed text-neutral-400">
              Play solo against our onboard minimax bot ranging from Novice (casual 600 Elo) up to Master (1950 Elo with deep 3-ply search and quiescence evaluation).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="flex items-center gap-2 font-semibold text-amber-400 mb-2 text-sm">
              <span className="font-mono text-base font-bold">⌨</span>
              <span>Global Keyboard Shortcuts</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                <kbd className="px-2 py-0.5 rounded bg-neutral-800 text-amber-300 font-mono text-xs font-bold border border-neutral-700">
                  U
                </kbd>
                <div className="text-[11px] text-neutral-300 mt-1 font-medium">Undo Move</div>
              </div>
              <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                <kbd className="px-2 py-0.5 rounded bg-neutral-800 text-amber-300 font-mono text-xs font-bold border border-neutral-700">
                  F
                </kbd>
                <div className="text-[11px] text-neutral-300 mt-1 font-medium">Flip Board</div>
              </div>
              <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                <kbd className="px-2 py-0.5 rounded bg-neutral-800 text-rose-300 font-mono text-xs font-bold border border-neutral-700">
                  R
                </kbd>
                <div className="text-[11px] text-neutral-300 mt-1 font-medium">Resign</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm transition-all shadow-md"
          >
            Back to Match
          </button>
        </div>
      </div>
    </div>
  );
};
