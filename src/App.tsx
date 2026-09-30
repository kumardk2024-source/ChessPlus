/**
 * ChessPlus - Modern High-Performance Chess Platform
 * Featuring:
 * - 3D-styled Silver & Obsidian Pieces
 * - Web Audio API Procedural Sound Engine
 * - chess.js Rule Engine & Validations
 * - Minimax AI Engine with 4 Difficulty Levels
 * - Real-time Clocks & Clack FX
 * - Real-time Online Multiplayer Room & Link Sharing
 */

import { useState, useEffect } from 'react';
import { useChessGame, TIME_CONTROLS } from './hooks/useChessGame';
import { useOnlineGame } from './hooks/useOnlineGame';
import { audioManager } from './utils/audioManager';
import { useTheme } from './context/ThemeContext';
import { Chessboard } from './components/Chessboard';
import { PlayerCard } from './components/PlayerCard';
import { MoveHistory } from './components/MoveHistory';
import { GameControls } from './components/GameControls';
import { PromotionModal } from './components/PromotionModal';
import { GameOverModal } from './components/GameOverModal';
import { NewGameModal } from './components/NewGameModal';
import { GameModeSelectModal } from './components/GameModeSelectModal';
import { RulesModal } from './components/RulesModal';
import { OnlineRoomModal } from './components/OnlineRoomModal';
import { VoiceVideoCallWidget } from './components/VoiceVideoCallWidget';
import { LevelSelectModal } from './components/LevelSelectModal';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { UserProfile } from './types/auth';
import { ChessPuzzle, getTodayKey } from './utils/chessLevels';
import {
  Volume2,
  VolumeX,
  Plus,
  Sparkles,
  BookOpen,
  Sun,
  Moon,
  Globe,
  Share2,
  Copy,
  Check,
  LogOut,
  Users,
  Trophy,
  Flame,
  Settings,
  User,
  ShieldCheck,
  MoreVertical,
  Menu,
  Wifi,
  WifiOff,
  Bot,
  Zap,
} from 'lucide-react';

export default function App() {
  const { theme, toggleTheme, setTheme, cycleTheme } = useTheme();
  const isDarkTheme = theme === 'dark' || theme === 'futuristic';
  const isFuturistic = theme === 'futuristic';

  // User Authentication & Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('chessplus-current-user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Levels & Challenges State
  const [isLevelModalOpen, setIsLevelModalOpen] = useState<boolean>(false);
  const [activePuzzle, setActivePuzzle] = useState<ChessPuzzle | null>(null);
  const [completedLevelIds, setCompletedLevelIds] = useState<string[]>(() => {
    try {
      if (currentUser?.completedLevels) return currentUser.completedLevels;
      const stored = localStorage.getItem('chessplus-completed-levels');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Online Multiplayer State
  const [onlineRoomId, setOnlineRoomId] = useState<string | null>(() => {
    // Check if URL has ?room=ROOM_ID
    const params = new URLSearchParams(window.location.search);
    return params.get('room');
  });
  const [onlinePlayerName, setOnlinePlayerName] = useState<string>(() => {
    return localStorage.getItem('chessplus-player-name') || 'Player 1';
  });
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Local Game Hook
  const localGame = useChessGame();

  // Online Game Hook
  const onlineGame = useOnlineGame({
    roomId: onlineRoomId,
    playerName: onlinePlayerName,
    onLeaveRoom: () => {
      setOnlineRoomId(null);
      const url = new URL(window.location.href);
      url.searchParams.delete('room');
      window.history.replaceState({}, '', url.toString());
    },
  });

  const isOnlineMode = !!onlineRoomId;

  // Active game proxies depending on mode
  const activeBoard = isOnlineMode ? onlineGame.board : localGame.board;
  const activeTurn = isOnlineMode ? onlineGame.turn : localGame.turn;
  const activeSelectedSquare = isOnlineMode ? onlineGame.selectedSquare : localGame.selectedSquare;
  const activeLegalMoves = isOnlineMode ? onlineGame.legalMovesForSelected : localGame.legalMovesForSelected;
  const activeLastMove = isOnlineMode ? onlineGame.lastMove : localGame.lastMove;
  const activeCheckSquare = isOnlineMode ? onlineGame.checkSquare : localGame.checkSquare;
  const activeInCheck = isOnlineMode ? onlineGame.inCheck : localGame.inCheck;
  const activeGameStatus = isOnlineMode ? onlineGame.gameStatus : localGame.gameStatus;
  const activeWhiteTime = isOnlineMode ? onlineGame.whiteTime : localGame.whiteTime;
  const activeBlackTime = isOnlineMode ? onlineGame.blackTime : localGame.blackTime;
  const activeCapturedPieces = isOnlineMode ? onlineGame.capturedPieces : localGame.capturedPieces;
  const activeMaterialAdvantage = isOnlineMode ? onlineGame.materialAdvantage : localGame.materialAdvantage;
  const activePendingPromotion = isOnlineMode ? onlineGame.pendingPromotion : localGame.pendingPromotion;

  // Flipped state: In online mode, flip board automatically if player is Black
  const [localFlipped, setLocalFlipped] = useState(false);
  const activeFlipped = isOnlineMode ? onlineGame.myColor === 'b' : localFlipped;

  const [isMuted, setIsMuted] = useState<boolean>(() => audioManager.getMuted());
  const [isNewGameOpen, setIsNewGameOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isGameOverDismissed, setIsGameOverDismissed] = useState<boolean>(false);

  const toggleMute = () => {
    const updated = audioManager.toggleMute();
    setIsMuted(updated);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (isNewGameOpen || isRulesOpen || isOnlineModalOpen || activePendingPromotion) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === 'u' && !isOnlineMode) {
        if (localGame.history.length > 0 && !localGame.gameStatus.isOver && !localGame.isAiThinking) {
          e.preventDefault();
          localGame.undo();
        }
      } else if (key === 'r') {
        if (!activeGameStatus.isOver) {
          e.preventDefault();
          if (isOnlineMode) onlineGame.resign();
          else localGame.resign();
        }
      } else if (key === 'f') {
        e.preventDefault();
        if (isOnlineMode) {
          // Keep fixed in online mode or toggle
        } else {
          setLocalFlipped((prev) => !prev);
          localGame.flipBoard();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isNewGameOpen,
    isRulesOpen,
    isOnlineModalOpen,
    activePendingPromotion,
    isOnlineMode,
    localGame,
    onlineGame,
    activeGameStatus.isOver,
  ]);

  // Online opponent info
  const peerPlayer = onlineGame.players.find((p) => p.color !== onlineGame.myColor);
  const mePlayer = onlineGame.players.find((p) => p.color === onlineGame.myColor);

  const botLabels: Record<string, string> = {
    novice: 'Novice (600)',
    casual: 'Club (1100)',
    intermediate: 'Expert (1550)',
    master: 'Master (1950)',
  };

  const isWhiteBottom = !activeFlipped;

  const topPlayerInfo = isOnlineMode
    ? isWhiteBottom
      ? {
          name: peerPlayer?.name || (onlineGame.peerConnected ? 'Opponent' : 'Waiting for friend...'),
          subtitle: onlineGame.peerConnected ? 'Black (Obsidian)' : 'Share link to join',
          isAi: false,
          color: 'b' as const,
          timeRemaining: activeBlackTime,
          isActiveTurn: activeTurn === 'b' && !activeGameStatus.isOver,
          capturedPieces: activeCapturedPieces.b,
          materialLead: activeMaterialAdvantage.b,
          isThinking: false,
        }
      : {
          name: peerPlayer?.name || (onlineGame.peerConnected ? 'Opponent' : 'Waiting for friend...'),
          subtitle: onlineGame.peerConnected ? 'White (Silver)' : 'Share link to join',
          isAi: false,
          color: 'w' as const,
          timeRemaining: activeWhiteTime,
          isActiveTurn: activeTurn === 'w' && !activeGameStatus.isOver,
          capturedPieces: activeCapturedPieces.w,
          materialLead: activeMaterialAdvantage.w,
          isThinking: false,
        }
    : isWhiteBottom
    ? {
        name: localGame.gameMode === 'vs-ai' ? 'DeepChess AI' : 'Black (Obsidian)',
        subtitle: localGame.gameMode === 'vs-ai' ? botLabels[localGame.botDifficulty] : 'Player 2',
        isAi: localGame.gameMode === 'vs-ai',
        color: 'b' as const,
        timeRemaining: activeBlackTime,
        isActiveTurn: activeTurn === 'b' && !activeGameStatus.isOver,
        capturedPieces: activeCapturedPieces.b,
        materialLead: activeMaterialAdvantage.b,
        isThinking: localGame.isAiThinking && activeTurn === 'b',
      }
    : {
        name: localGame.gameMode === 'vs-ai' ? 'DeepChess AI' : 'White (Silver)',
        subtitle: localGame.gameMode === 'vs-ai' ? botLabels[localGame.botDifficulty] : 'Player 1',
        isAi: localGame.gameMode === 'vs-ai',
        color: 'w' as const,
        timeRemaining: activeWhiteTime,
        isActiveTurn: activeTurn === 'w' && !activeGameStatus.isOver,
        capturedPieces: activeCapturedPieces.w,
        materialLead: activeMaterialAdvantage.w,
        isThinking: localGame.isAiThinking && activeTurn === 'w',
      };

  const bottomPlayerInfo = isOnlineMode
    ? isWhiteBottom
      ? {
          name: mePlayer?.name || onlinePlayerName || 'You (Silver)',
          subtitle: `Playing Silver · Room ${onlineRoomId}`,
          isAi: false,
          color: 'w' as const,
          timeRemaining: activeWhiteTime,
          isActiveTurn: activeTurn === 'w' && !activeGameStatus.isOver,
          capturedPieces: activeCapturedPieces.w,
          materialLead: activeMaterialAdvantage.w,
          isThinking: false,
        }
      : {
          name: mePlayer?.name || onlinePlayerName || 'You (Obsidian)',
          subtitle: `Playing Obsidian · Room ${onlineRoomId}`,
          isAi: false,
          color: 'b' as const,
          timeRemaining: activeBlackTime,
          isActiveTurn: activeTurn === 'b' && !activeGameStatus.isOver,
          capturedPieces: activeCapturedPieces.b,
          materialLead: activeMaterialAdvantage.b,
          isThinking: false,
        }
    : isWhiteBottom
    ? {
        name: localGame.gameMode === 'vs-ai' ? 'You' : 'White (Silver)',
        subtitle: localGame.gameMode === 'vs-ai' ? 'Silver Commander' : 'Player 1',
        isAi: false,
        color: 'w' as const,
        timeRemaining: activeWhiteTime,
        isActiveTurn: activeTurn === 'w' && !activeGameStatus.isOver,
        capturedPieces: activeCapturedPieces.w,
        materialLead: activeMaterialAdvantage.w,
        isThinking: false,
      }
    : {
        name: localGame.gameMode === 'vs-ai' ? 'You' : 'Black (Obsidian)',
        subtitle: localGame.gameMode === 'vs-ai' ? 'Obsidian Commander' : 'Player 2',
        isAi: false,
        color: 'b' as const,
        timeRemaining: activeBlackTime,
        isActiveTurn: activeTurn === 'b' && !activeGameStatus.isOver,
        capturedPieces: activeCapturedPieces.b,
        materialLead: activeMaterialAdvantage.b,
        isThinking: false,
      };

  const copyOnlineRoomLink = () => {
    if (!onlineRoomId) return;
    const url = `${window.location.origin}/?room=${onlineRoomId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    });
  };

  const leaveOnlineRoom = () => {
    setOnlineRoomId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.replaceState({}, '', url.toString());
  };

  const handleJoinOnlineRoom = (rId: string, pName: string) => {
    setOnlinePlayerName(pName);
    setOnlineRoomId(rId);
    const url = new URL(window.location.href);
    url.searchParams.set('room', rId);
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 flex flex-col ${
        isDarkTheme
          ? 'bg-[#08090d] text-neutral-100'
          : 'bg-[#f4efe8] text-stone-900'
      }`}
    >
      {/* Top Bar */}
      <header
        className={`h-16 px-4 sm:px-8 border-b backdrop-blur-md flex items-center justify-between z-30 shrink-0 transition-colors duration-300 ${
          isDarkTheme
            ? 'border-neutral-800/80 bg-neutral-950/80'
            : 'border-stone-300/80 bg-stone-50/90 shadow-xs'
        }`}
      >
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3">
          <span
            className={`text-xl sm:text-2xl font-bold tracking-wider font-display flex items-center gap-2 ${
              isDarkTheme ? 'text-white' : 'text-stone-900'
            }`}
          >
            <span className="text-amber-500">✦</span>
            <span>ChessPlus</span>
          </span>

          {/* Online Match Badge */}
          {isOnlineMode && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Room: {onlineRoomId}</span>
            </div>
          )}
        </div>

        {/* Zone 2: Navigation & Mode Indicators */}
        <nav
          className={`hidden md:flex items-center gap-6 text-xs font-medium ${
            isDarkTheme ? 'text-neutral-400' : 'text-stone-600'
          }`}
        >
          {isOnlineMode ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                <Wifi className="w-3 h-3" />
                <span>ONLINE ROOM: {onlineRoomId}</span>
              </span>
              <span className="font-bold text-amber-500 font-mono">
                {onlineGame.players.length}/2
              </span>
              {!onlineGame.peerConnected && (
                <span className="text-[11px] text-amber-600 animate-pulse">
                  (Waiting for friend)
                </span>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsNewGameOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 hover:border-amber-500/50 transition-colors cursor-pointer text-xs font-semibold"
              title="Click to Switch Mode (Offline / Online)"
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {localGame.gameMode === 'vs-ai'
                  ? `Offline vs Computer (${botLabels[localGame.botDifficulty]})`
                  : 'Offline Pass & Play'}
              </span>
            </button>
          )}

          <span aria-hidden="true" className={isDarkTheme ? 'text-neutral-700' : 'text-stone-400'}>
            ·
          </span>

          <span className={`font-mono ${isDarkTheme ? 'text-neutral-300' : 'text-stone-800'}`}>
            {isOnlineMode ? 'Online 10m Rapid' : TIME_CONTROLS[localGame.timeControl].name}
          </span>

          <span aria-hidden="true" className={isDarkTheme ? 'text-neutral-700' : 'text-stone-400'}>
            ·
          </span>

          <button
            onClick={() => setIsLevelModalOpen(true)}
            className="hover:text-amber-500 transition-colors cursor-pointer flex items-center gap-1.5 text-amber-500 font-semibold"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Levels ({completedLevelIds.length}/8)</span>
          </button>

          <span aria-hidden="true" className={isDarkTheme ? 'text-neutral-700' : 'text-stone-400'}>
            ·
          </span>

          <button
            onClick={() => setIsRulesOpen(true)}
            className="hover:text-amber-500 transition-colors cursor-pointer flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Rules & Audio Guide</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Level Challenges Button (on mobile/desktop) */}
          {!isOnlineMode && (
            <button
              onClick={() => setIsLevelModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Tactical Levels & Challenges"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Levels</span>
            </button>
          )}

          {/* Online Room Button / Share / Mode Switcher */}
          {isOnlineMode ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={copyOnlineRoomLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all shadow-sm cursor-pointer"
                title="Copy friend invite link"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Link</span>
                  </>
                )}
              </button>

              <button
                onClick={leaveOnlineRoom}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium text-rose-500 hover:bg-rose-500/10 border-rose-500/30 transition-colors cursor-pointer"
                title="Leave online room & go to Offline mode"
              >
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Go Offline</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setIsGameOverDismissed(false);
                  setIsNewGameOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Play vs Computer (Offline AI Bot)"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Play vs Computer</span>
              </button>

              <button
                onClick={() => setIsOnlineModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                title="Play Online with Friends"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Play Online</span>
              </button>
            </div>
          )}

          {/* Theme Quick Switcher: Futuristic Sci-Fi / Classic 3D / Obsidian */}
          <button
            onClick={cycleTheme}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isFuturistic
                ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)] hover:bg-cyan-500/30'
                : isDarkTheme
                ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
                : 'bg-stone-100 border-stone-300 text-stone-700 hover:text-stone-950 hover:bg-stone-200 shadow-xs'
            }`}
            title="Click to Switch Style: Futuristic Sci-Fi / Classic 3D / Obsidian Dark"
          >
            {isFuturistic ? (
              <>
                <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="hidden sm:inline">Futuristic</span>
              </>
            ) : isDarkTheme ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Obsidian</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Classic 3D</span>
              </>
            )}
          </button>

          {/* Admin Control Panel quick access */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Admin Control Panel"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* User Profile / Login Button */}
          {currentUser ? (
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-200 font-medium transition-colors cursor-pointer"
              title="Profile & Settings"
            >
              <div className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-bold flex items-center justify-center">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline max-w-[80px] truncate">{currentUser.name}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-amber-400 border border-amber-500/30 transition-colors cursor-pointer"
              title="Sign in or Register"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          {/* Comprehensive Settings Modal Button (3 dots / lines indicator) */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all cursor-pointer shadow-xs"
            title="Settings & Menu (3-dots)"
          >
            <MoreVertical className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline text-xs font-semibold">Settings</span>
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={toggleMute}
            className={`relative p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
              !isMuted
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:bg-amber-500/20 hover:border-amber-400'
                : isDarkTheme
                ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                : 'bg-stone-100 border-stone-300 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
            title={isMuted ? 'Unmute sounds' : 'Mute sounds (Audio Active)'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-neutral-400" />
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
              </>
            )}
          </button>

          {/* New Match (Local) */}
          {!isOnlineMode && (
            <button
              onClick={() => {
                setIsGameOverDismissed(false);
                setIsNewGameOpen(true);
              }}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Match</span>
            </button>
          )}
        </div>
      </header>

      {/* Online Room Waiting Notification Banner */}
      {isOnlineMode && !onlineGame.peerConnected && (
        <div className="bg-amber-500 text-neutral-950 px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>
              Waiting for your friend to join Room <strong>{onlineRoomId}</strong>. Share the link:
            </span>
          </div>
          <button
            onClick={copyOnlineRoomLink}
            className="px-3 py-1 rounded bg-neutral-950 text-amber-400 font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {copiedLink ? 'Link Copied!' : 'Copy Invite Link'}
          </button>
        </div>
      )}

      {/* Draw Offer Notification */}
      {isOnlineMode && onlineGame.drawOfferedBy && (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md">
          <span>{onlineGame.drawOfferedBy} has offered a draw!</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onlineGame.acceptDraw}
              className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold cursor-pointer"
            >
              Accept Draw
            </button>
            <button
              onClick={onlineGame.declineDraw}
              className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold cursor-pointer"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 lg:gap-8">
        {/* Left Column: Top Player, Chessboard, Bottom Player, Game Controls */}
        <div className="w-full max-w-[580px] flex flex-col gap-2.5 sm:gap-3.5">
          {/* Top Opponent Player Card */}
          <PlayerCard
            {...topPlayerInfo}
            timeControl={isOnlineMode ? 'rapid' : localGame.timeControl}
            totalInitialTime={600}
            theme={theme}
          />

          {/* Interactive 3D Chessboard */}
          <Chessboard
            board={activeBoard}
            flipped={activeFlipped}
            selectedSquare={activeSelectedSquare}
            legalMoves={activeLegalMoves}
            lastMove={activeLastMove}
            checkSquare={activeCheckSquare}
            onSquareClick={(sq) => {
              if (isOnlineMode) onlineGame.handleSquareClick(sq);
              else localGame.handleSquareClick(sq);
            }}
            onMovePiece={(from, to) => {
              if (isOnlineMode) {
                onlineGame.executeOnlineMove(from, to);
              } else {
                localGame.executeMove(from, to);
                // Check if current puzzle is solved
                if (activePuzzle && localGame.gameMode === 'puzzle') {
                  const solution = activePuzzle.solutionMoves[0];
                  if (solution && solution.from === from && solution.to === to) {
                    const isDaily = activePuzzle.id.startsWith('daily-');
                    const todayKey = getTodayKey();

                    if (!completedLevelIds.includes(activePuzzle.id)) {
                      const updated = [...completedLevelIds, activePuzzle.id];
                      setCompletedLevelIds(updated);
                      localStorage.setItem('chessplus-completed-levels', JSON.stringify(updated));

                      // If logged in, update user account too
                      if (currentUser) {
                        const existingDaily = currentUser.dailyChallengesCompleted || [];
                        const updatedDaily = isDaily && !existingDaily.includes(todayKey)
                          ? [...existingDaily, todayKey]
                          : existingDaily;

                        const updatedUser = { 
                          ...currentUser, 
                          completedLevels: updated,
                          dailyChallengesCompleted: updatedDaily,
                          rating: currentUser.rating + (isDaily ? 50 : 25) 
                        };
                        setCurrentUser(updatedUser);
                        localStorage.setItem('chessplus-current-user', JSON.stringify(updatedUser));

                        // Also update in all-users list
                        try {
                          const allUsers = JSON.parse(localStorage.getItem('chessplus-all-users') || '[]');
                          const idx = allUsers.findIndex((u: any) => u.id === currentUser.id);
                          if (idx !== -1) {
                            allUsers[idx].completedLevels = updated;
                            allUsers[idx].dailyChallengesCompleted = updatedDaily;
                            allUsers[idx].rating += (isDaily ? 50 : 25);
                            localStorage.setItem('chessplus-all-users', JSON.stringify(allUsers));
                          }
                        } catch {}
                      }
                    }
                  }
                }
              }
            }}
            disabled={
              activeGameStatus.isOver ||
              (isOnlineMode
                ? activeTurn !== onlineGame.myColor || !onlineGame.peerConnected
                : localGame.gameMode === 'vs-ai' && activeTurn !== localGame.playerColor)
            }
            theme={theme}
          />

          {/* Bottom Player Card */}
          <PlayerCard
            {...bottomPlayerInfo}
            timeControl={isOnlineMode ? 'rapid' : localGame.timeControl}
            totalInitialTime={600}
            theme={theme}
          />

          {/* Toolbar Controls */}
          <GameControls
            onUndo={() => {
              if (!isOnlineMode) localGame.undo();
            }}
            onResign={() => {
              if (isOnlineMode) onlineGame.resign();
              else localGame.resign();
            }}
            onOfferDraw={() => {
              if (isOnlineMode) onlineGame.offerDraw();
              else localGame.offerDraw();
            }}
            onFlipBoard={() => {
              if (!isOnlineMode) {
                setLocalFlipped((prev) => !prev);
                localGame.flipBoard();
              }
            }}
            onNewGame={() => {
              if (isOnlineMode) {
                onlineGame.requestRestart();
              } else {
                setIsGameOverDismissed(false);
                setIsNewGameOpen(true);
              }
            }}
            onOpenRules={() => setIsRulesOpen(true)}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            canUndo={!isOnlineMode && localGame.history.length > 0}
            isGameOver={activeGameStatus.isOver}
            isAiThinking={!isOnlineMode && localGame.isAiThinking}
            theme={theme}
          />

          {/* Voice & Video Call Controls (Active in Online Room) */}
          {isOnlineMode && (
            <VoiceVideoCallWidget
              ws={onlineGame.ws}
              roomId={onlineRoomId}
              playerName={onlinePlayerName}
              peerPlayerName={peerPlayer?.name || 'Friend'}
              peerConnected={onlineGame.peerConnected}
              webrtcSignal={onlineGame.webrtcSignal}
              peerCallStatus={onlineGame.peerCallStatus}
              isDarkTheme={isDarkTheme}
            />
          )}
        </div>

        {/* Right Column: Move History, PGN export, Game Details */}
        <div className="w-full max-w-[580px] lg:max-w-sm flex flex-col gap-4 self-stretch">
          {/* Move History Panel */}
          <div className="h-[280px] lg:h-[460px] flex flex-col">
            <MoveHistory
              history={(isOnlineMode ? onlineGame.history : localGame.history) as any}
              inCheck={activeInCheck}
              isOver={activeGameStatus.isOver}
              theme={theme}
            />
          </div>

          {/* Match Info Card */}
          <div
            className={`p-4 rounded-xl border text-xs space-y-2.5 transition-colors duration-200 ${
              isDarkTheme
                ? 'bg-neutral-900/40 border-neutral-800'
                : 'bg-[#fbf9f5] border-stone-300 shadow-sm'
            }`}
          >
            <div
              className={`flex items-center justify-between ${
                isDarkTheme ? 'text-neutral-400' : 'text-stone-600'
              }`}
            >
              <span
                className={`font-semibold flex items-center gap-1.5 ${
                  isDarkTheme ? 'text-neutral-300' : 'text-stone-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Active Match
              </span>
              <span className={`font-mono ${isDarkTheme ? 'text-neutral-400' : 'text-stone-500'}`}>
                {isOnlineMode
                  ? `Online Room (${onlineRoomId})`
                  : localGame.gameMode === 'vs-ai'
                  ? 'Player vs AI'
                  : 'Local 2-Player'}
              </span>
            </div>

            <div
              className={`pt-2 border-t flex items-center justify-between ${
                isDarkTheme ? 'border-neutral-800/80 text-neutral-400' : 'border-stone-200 text-stone-600'
              }`}
            >
              <span>Turn Status</span>
              <span
                className={`font-semibold ${
                  isDarkTheme ? 'text-neutral-200' : 'text-stone-900'
                }`}
              >
                {activeGameStatus.isOver
                  ? 'Completed'
                  : activeTurn === 'w'
                  ? 'Silver (White) to Move'
                  : 'Obsidian (Black) to Move'}
              </span>
            </div>

            <div
              className={`flex items-center justify-between ${
                isDarkTheme ? 'text-neutral-400' : 'text-stone-600'
              }`}
            >
              <span>Engine Status</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1.5 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isOnlineMode ? 'WebSocket Live Sync' : 'chess.js 1.4.0 verified'}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Promotion Dialog */}
      {activePendingPromotion && (
        <PromotionModal
          color={activeTurn}
          onSelect={(piece) => {
            if (isOnlineMode) onlineGame.handlePromotionSelect(piece);
            else localGame.handlePromotionSelect(piece);
          }}
        />
      )}

      {/* Game Over Modal */}
      {!isGameOverDismissed && activeGameStatus.isOver && (
        <GameOverModal
          status={activeGameStatus}
          history={(isOnlineMode ? onlineGame.history : localGame.history) as any}
          theme={theme}
          onRematch={() => {
            setIsGameOverDismissed(false);
            if (isOnlineMode) onlineGame.requestRestart();
            else localGame.resetGame();
          }}
          onNewGameConfig={() => {
            setIsGameOverDismissed(false);
            if (isOnlineMode) setIsOnlineModalOpen(true);
            else setIsNewGameOpen(true);
          }}
          onClose={() => setIsGameOverDismissed(true)}
        />
      )}

      {/* Game Mode Selector Modal (Offline vs AI / Pass & Play, and Online) */}
      <GameModeSelectModal
        isOpen={isNewGameOpen}
        onClose={() => setIsNewGameOpen(false)}
        onStartOfflineVsAI={(color, tc, diff) => {
          localGame.resetGame('vs-ai', color, tc, diff);
        }}
        onStartOfflinePassAndPlay={(tc) => {
          localGame.resetGame('pass-and-play', 'w', tc, 'novice');
        }}
        onOpenOnlineRoom={() => {
          setIsNewGameOpen(false);
          setIsOnlineModalOpen(true);
        }}
        currentColor={localGame.playerColor}
        currentTimeControl={localGame.timeControl}
        currentDifficulty={localGame.botDifficulty}
      />

      {/* Online Room Modal */}
      <OnlineRoomModal
        isOpen={isOnlineModalOpen}
        onClose={() => setIsOnlineModalOpen(false)}
        onJoinRoom={handleJoinOnlineRoom}
      />

      {/* Rules & Guide Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* Tactical Levels & Challenges Modal with Daily Challenge */}
      <LevelSelectModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        completedLevelIds={completedLevelIds}
        dailyChallengesCompleted={currentUser?.dailyChallengesCompleted || []}
        onSelectLevel={(puzzle) => {
          setActivePuzzle(puzzle);
          localGame.loadPuzzlePosition(puzzle.fen, puzzle.turn);
        }}
      />

      {/* User Authentication & OTP Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          localStorage.setItem('chessplus-current-user', JSON.stringify(user));
          if (user.completedLevels && user.completedLevels.length > 0) {
            setCompletedLevelIds(user.completedLevels);
            localStorage.setItem('chessplus-completed-levels', JSON.stringify(user.completedLevels));
          }
        }}
      />

      {/* App Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          localStorage.removeItem('chessplus-current-user');
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSetTheme={setTheme}
        soundEnabled={!isMuted}
        onToggleSound={toggleMute}
        onResetProgress={() => {
          setCompletedLevelIds([]);
          localStorage.removeItem('chessplus-completed-levels');
          if (currentUser) {
            const updated = { ...currentUser, completedLevels: [] };
            setCurrentUser(updated);
            localStorage.setItem('chessplus-current-user', JSON.stringify(updated));
          }
        }}
      />

      {/* Admin Control Panel Modal */}
      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
