import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  User, 
  Volume2, 
  VolumeX, 
  Shield, 
  Smartphone, 
  HelpCircle, 
  LogOut, 
  Moon, 
  Sun,
  Palette,
  Bell,
  Trash2,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../types/auth';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  theme: string;
  onToggleTheme: () => void;
  onSetTheme?: (mode: 'normal' | 'dark' | 'futuristic') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  onOpenAuth,
  onOpenAdmin,
  theme,
  onToggleTheme,
  onSetTheme,
  soundEnabled,
  onToggleSound,
  onResetProgress,
}) => {
  const [boardStyle, setBoardStyle] = useState<'tournament' | 'obsidian' | 'wood'>('obsidian');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-700/80 rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl text-neutral-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white font-display">
              Game Settings (सेटिंग्स)
            </h2>
            <p className="text-xs text-neutral-400">
              खाता, ध्वनि, विजुअल एवं गेमिंग प्राथमिकताएं
            </p>
          </div>
        </div>

        {/* Section 1: User Account */}
        <div className="mb-6 pb-5 border-b border-neutral-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              Account & Profile
            </span>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 text-xs font-bold transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>
            )}
          </div>

          {currentUser ? (
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-neutral-950 font-bold flex items-center justify-center text-sm shadow-md">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm text-neutral-100 flex items-center gap-1.5">
                    <span>{currentUser.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800 text-amber-400 font-mono">
                      {currentUser.rating} Elo
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400">
                    {currentUser.email || currentUser.phone || 'Guest Account'}
                  </div>
                  {currentUser.dailyChallengesCompleted && currentUser.dailyChallengesCompleted.length > 0 && (
                    <div className="text-[11px] text-amber-400 font-medium mt-0.5">
                      🔥 {currentUser.dailyChallengesCompleted.length} Daily Challenges Solved
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 hover:bg-rose-500/10 hover:border-rose-500/40 text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-neutral-200">You are playing as Guest</div>
                <div className="text-xs text-neutral-400">रजिस्टर करें ताकि आपका लेवल प्रोग्रेस सुरक्षित रहे!</div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Sign In / Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Section 2: Preferences */}
        <div className="space-y-4 mb-6 pb-5 border-b border-neutral-800/80">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
            Audio & Theme
          </span>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="flex items-center gap-2.5">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-neutral-500" />
              )}
              <div>
                <div className="text-xs font-bold text-neutral-200">Game Audio & Voice FX</div>
                <div className="text-[11px] text-neutral-400">चाल, कैप्चर और चेकमेट ध्वनि प्रभाव</div>
              </div>
            </div>
            <button
              onClick={onToggleSound}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                soundEnabled ? 'bg-amber-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  soundEnabled ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Theme Selector (Futuristic Sci-Fi / Obsidian Dark / Tournament Clean) */}
          <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-neutral-200">
                  Board & Piece Style (थीम और मोहरों की शैली)
                </span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-800 text-cyan-400 font-semibold">
                {theme === 'futuristic' ? 'Futuristic' : theme === 'dark' ? 'Obsidian' : 'Classic'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onSetTheme && onSetTheme('futuristic')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  theme === 'futuristic'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-850'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-300">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  Futuristic
                </div>
                <div className="text-[9px] text-neutral-400 leading-tight mt-1">
                  Cryo-Titanium & Cyber Matrix
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSetTheme && onSetTheme('normal')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  theme === 'normal'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-850'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                  <Sun className="w-3 h-3 text-amber-400" />
                  Classic 3D
                </div>
                <div className="text-[9px] text-neutral-400 leading-tight mt-1">
                  Warm Buff & Walnut Wood
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSetTheme && onSetTheme('dark')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-850'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-300">
                  <Moon className="w-3 h-3 text-indigo-400" />
                  Obsidian
                </div>
                <div className="text-[9px] text-neutral-400 leading-tight mt-1">
                  Deep Dark Tournament
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Data & Storage */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
            Data & Privacy
          </span>

          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-neutral-200">Reset Solved Levels Progress</div>
              <div className="text-[11px] text-neutral-400">सभी पूरे किए गए लेवल फिर से अनलॉक करें</div>
            </div>
            <button
              onClick={() => {
                if (confirm('क्या आप सच में लेवल्स का प्रोग्रेस रीसेट करना चाहते हैं?')) {
                  onResetProgress();
                }
              }}
              className="px-2.5 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer"
            >
              Reset Levels
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <span>ChessPlus v2.4.0 (PWA Ready)</span>
          <span>WebRTC P2P Active</span>
        </div>
      </div>
    </div>
  );
};
