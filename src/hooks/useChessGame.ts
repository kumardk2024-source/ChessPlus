import { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square, PieceSymbol, Color, Move } from 'chess.js';
import { audioManager } from '../utils/audioManager';
import { getAiMove, BotDifficulty } from '../utils/chessBot';
import confetti from 'canvas-confetti';

export type GameMode = 'vs-ai' | 'pass-and-play' | 'puzzle';
export type PlayerColor = 'w' | 'b';
export type TimeControl = 'unlimited' | '1+1' | '3+2' | '10+0' | '15+10';

export interface TimeControlConfig {
  name: string;
  initialSeconds: number;
  incrementSeconds: number;
}

export const TIME_CONTROLS: Record<TimeControl, TimeControlConfig> = {
  unlimited: { name: 'Untimed', initialSeconds: 0, incrementSeconds: 0 },
  '1+1': { name: 'Bullet 1|1', initialSeconds: 60, incrementSeconds: 1 },
  '3+2': { name: 'Blitz 3|2', initialSeconds: 180, incrementSeconds: 2 },
  '10+0': { name: 'Rapid 10|0', initialSeconds: 600, incrementSeconds: 0 },
  '15+10': { name: 'Classical 15|10', initialSeconds: 900, incrementSeconds: 10 },
};

export interface MoveRecord {
  san: string;
  from: Square;
  to: Square;
  piece: PieceSymbol;
  color: Color;
  captured?: PieceSymbol;
  fen: string;
  number: number;
}

export interface CapturedPieces {
  w: PieceSymbol[]; // Pieces captured by White (i.e. Black pieces lost)
  b: PieceSymbol[]; // Pieces captured by Black (i.e. White pieces lost)
}

export interface GameStatus {
  isOver: boolean;
  winner: Color | 'draw' | null;
  reason: string;
}

export function useChessGame() {
  const chessRef = useRef<Chess>(new Chess());
  const [fen, setFen] = useState<string>(chessRef.current.fen());
  const [board, setBoard] = useState(chessRef.current.board());
  const [turn, setTurn] = useState<Color>(chessRef.current.turn());
  
  // Game Setup
  const [gameMode, setGameMode] = useState<GameMode>('vs-ai');
  const [playerColor, setPlayerColor] = useState<PlayerColor>('w');
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('intermediate');
  const [timeControl, setTimeControl] = useState<TimeControl>('3+2');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [flipped, setFlipped] = useState<boolean>(false);

  // Clocks
  const [whiteTime, setWhiteTime] = useState<number>(TIME_CONTROLS['3+2'].initialSeconds);
  const [blackTime, setBlackTime] = useState<number>(TIME_CONTROLS['3+2'].initialSeconds);

  // Move tracking
  const [history, setHistory] = useState<MoveRecord[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMovesForSelected, setLegalMovesForSelected] = useState<Square[]>([]);
  
  // Pending promotion state
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  // Status & Material
  const [inCheck, setInCheck] = useState<boolean>(false);
  const [checkSquare, setCheckSquare] = useState<Square | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>({
    isOver: false,
    winner: null,
    reason: '',
  });
  const [capturedPieces, setCapturedPieces] = useState<CapturedPieces>({ w: [], b: [] });
  const [materialAdvantage, setMaterialAdvantage] = useState<{ w: number; b: number }>({ w: 0, b: 0 });

  // Update check square
  const findKingSquare = (color: Color, currentChess: Chess): Square | null => {
    const b = currentChess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = b[r][c];
        if (piece && piece.type === 'k' && piece.color === color) {
          return `${String.fromCharCode(97 + c)}${8 - r}` as Square;
        }
      }
    }
    return null;
  };

  // Compute captured pieces & material difference
  const computeMaterial = (currentChess: Chess) => {
    const initialPieceCounts: Record<Color, Record<PieceSymbol, number>> = {
      w: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
      b: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
    };

    const currentPieceCounts: Record<Color, Record<PieceSymbol, number>> = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    };

    const b = currentChess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = b[r][c];
        if (piece) {
          currentPieceCounts[piece.color][piece.type]++;
        }
      }
    }

    const capturedW: PieceSymbol[] = []; // Black pieces taken by White
    const capturedB: PieceSymbol[] = []; // White pieces taken by Black

    (['p', 'n', 'b', 'r', 'q'] as PieceSymbol[]).forEach((type) => {
      const missingB = Math.max(0, initialPieceCounts.b[type] - currentPieceCounts.b[type]);
      for (let i = 0; i < missingB; i++) capturedW.push(type);

      const missingW = Math.max(0, initialPieceCounts.w[type] - currentPieceCounts.w[type]);
      for (let i = 0; i < missingW; i++) capturedB.push(type);
    });

    const values: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    let scoreW = 0;
    let scoreB = 0;
    capturedW.forEach((p) => (scoreW += values[p]));
    capturedB.forEach((p) => (scoreB += values[p]));

    setCapturedPieces({ w: capturedW, b: capturedB });
    setMaterialAdvantage({
      w: Math.max(0, scoreW - scoreB),
      b: Math.max(0, scoreB - scoreW),
    });
  };

  // Clock countdown timer
  useEffect(() => {
    if (timeControl === 'unlimited' || gameStatus.isOver) return;

    const interval = setInterval(() => {
      if (turn === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            handleTimeout('w');
            return 0;
          }
          if (prev <= 10) audioManager.playClockTick();
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            handleTimeout('b');
            return 0;
          }
          if (prev <= 10) audioManager.playClockTick();
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [turn, timeControl, gameStatus.isOver]);

  const handleTimeout = (loser: Color) => {
    const winner = loser === 'w' ? 'b' : 'w';
    setGameStatus({
      isOver: true,
      winner,
      reason: `${loser === 'w' ? 'White' : 'Black'} ran out of time`,
    });
    if (gameMode === 'vs-ai') {
      if (winner === playerColor) {
        audioManager.playWin();
        triggerVictoryConfetti();
      } else {
        audioManager.playLoss();
      }
    } else {
      audioManager.playWin();
    }
  };

  const triggerVictoryConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#cbd5e1', '#ffffff', '#e2e8f0', '#f59e0b'],
    });
  };

  // Evaluate game end conditions and play sounds
  const evaluateGameState = (currentChess: Chess, moveResult: Move) => {
    const isCheckmate = currentChess.isCheckmate();
    const isStalemate = currentChess.isStalemate();
    const isThreefold = currentChess.isThreefoldRepetition();
    const isInsufficient = currentChess.isInsufficientMaterial();
    const isDraw = currentChess.isDraw();
    const currentInCheck = currentChess.inCheck();

    setInCheck(currentInCheck);
    if (currentInCheck) {
      setCheckSquare(findKingSquare(currentChess.turn(), currentChess));
    } else {
      setCheckSquare(null);
    }

    if (isCheckmate) {
      const winner = currentChess.turn() === 'w' ? 'b' : 'w';
      setGameStatus({
        isOver: true,
        winner,
        reason: `Checkmate! ${winner === 'w' ? 'White' : 'Black'} wins`,
      });
      audioManager.playCheckmate();
      setTimeout(() => {
        if (gameMode === 'vs-ai') {
          if (winner === playerColor) {
            audioManager.playWin();
            triggerVictoryConfetti();
          } else {
            audioManager.playLoss();
          }
        } else {
          audioManager.playWin();
        }
      }, 500);
      return;
    }

    if (isStalemate) {
      setGameStatus({ isOver: true, winner: 'draw', reason: 'Draw by Stalemate' });
      audioManager.playDraw();
      return;
    }

    if (isThreefold) {
      setGameStatus({ isOver: true, winner: 'draw', reason: 'Draw by Threefold Repetition' });
      audioManager.playDraw();
      return;
    }

    if (isInsufficient) {
      setGameStatus({ isOver: true, winner: 'draw', reason: 'Draw by Insufficient Material' });
      audioManager.playDraw();
      return;
    }

    if (isDraw) {
      setGameStatus({ isOver: true, winner: 'draw', reason: 'Draw by 50-move rule' });
      audioManager.playDraw();
      return;
    }

    // Normal move audio
    const isCastleMove =
      moveResult.flags.includes('k') ||
      moveResult.flags.includes('q') ||
      (typeof moveResult.isKingsideCastle === 'function' && moveResult.isKingsideCastle()) ||
      (typeof moveResult.isQueensideCastle === 'function' && moveResult.isQueensideCastle());

    if (currentInCheck) {
      audioManager.playCheck();
    } else if (
      moveResult.captured ||
      (typeof moveResult.isCapture === 'function' && moveResult.isCapture())
    ) {
      audioManager.playCapture();
    } else if (isCastleMove) {
      audioManager.playCastle();
    } else {
      audioManager.playMove();
    }
  };

  // Perform a move
  const executeMove = useCallback(
    (from: Square, to: Square, promotionPiece?: PieceSymbol): boolean => {
      const currentChess = chessRef.current;
      if (gameStatus.isOver) return false;

      // Check if this move requires pawn promotion
      const piece = currentChess.get(from);
      if (piece && piece.type === 'p') {
        const isPromotionRank = (piece.color === 'w' && to[1] === '8') || (piece.color === 'b' && to[1] === '1');
        if (isPromotionRank && !promotionPiece) {
          // Open promotion modal
          setPendingPromotion({ from, to });
          return false;
        }
      }

      try {
        const moveOptions = {
          from,
          to,
          promotion: promotionPiece || 'q',
        };

        const result = currentChess.move(moveOptions);
        if (!result) {
          audioManager.playIllegal();
          return false;
        }

        // Apply clock increment
        const config = TIME_CONTROLS[timeControl];
        if (config.incrementSeconds > 0) {
          if (piece?.color === 'w') {
            setWhiteTime((prev) => prev + config.incrementSeconds);
          } else {
            setBlackTime((prev) => prev + config.incrementSeconds);
          }
        }

        // Update states
        setFen(currentChess.fen());
        setBoard(currentChess.board());
        setTurn(currentChess.turn());
        setLastMove({ from, to });
        setSelectedSquare(null);
        setLegalMovesForSelected([]);
        setPendingPromotion(null);

        // Update Move History
        const moveCount = Math.floor(history.length / 2) + 1;
        const newRecord: MoveRecord = {
          san: result.san,
          from,
          to,
          piece: result.piece,
          color: result.color,
          captured: result.captured,
          fen: currentChess.fen(),
          number: moveCount,
        };
        setHistory((prev) => [...prev, newRecord]);

        computeMaterial(currentChess);
        evaluateGameState(currentChess, result);

        return true;
      } catch (err) {
        console.error('Invalid move attempt:', err);
        audioManager.playIllegal();
        return false;
      }
    },
    [gameStatus.isOver, history.length, timeControl, gameMode, playerColor]
  );

  // Trigger AI move if in 'vs-ai' mode and it's AI's turn
  useEffect(() => {
    if (
      gameMode !== 'vs-ai' ||
      gameStatus.isOver ||
      isAiThinking ||
      turn === playerColor
    ) {
      return;
    }

    let isMounted = true;
    setIsAiThinking(true);

    getAiMove(chessRef.current, botDifficulty).then((aiMove) => {
      if (!isMounted || !aiMove) {
        setIsAiThinking(false);
        return;
      }

      executeMove(aiMove.from, aiMove.to, aiMove.promotion || 'q');
      setIsAiThinking(false);
    });

    return () => {
      isMounted = false;
    };
  }, [turn, gameMode, playerColor, gameStatus.isOver, botDifficulty, executeMove]);

  // Click square handler
  const handleSquareClick = (square: Square) => {
    if (gameStatus.isOver || isAiThinking) return;

    // In vs-ai mode, player cannot click when it's not their turn
    if (gameMode === 'vs-ai' && turn !== playerColor) return;

    const currentChess = chessRef.current;
    const clickedPiece = currentChess.get(square);

    // If already selected, try to move to clicked square
    if (selectedSquare) {
      if (selectedSquare === square) {
        // Deselect
        setSelectedSquare(null);
        setLegalMovesForSelected([]);
        return;
      }

      // Check if clicking another piece of the same color
      if (clickedPiece && clickedPiece.color === turn) {
        setSelectedSquare(square);
        audioManager.playSelect();
        const moves = currentChess.moves({ square, verbose: true });
        setLegalMovesForSelected(moves.map((m) => m.to));
        return;
      }

      // Attempt move
      const isLegal = legalMovesForSelected.includes(square);
      if (isLegal) {
        executeMove(selectedSquare, square);
      } else {
        setSelectedSquare(null);
        setLegalMovesForSelected([]);
      }
      return;
    }

    // Select if piece belongs to current player's turn
    if (clickedPiece && clickedPiece.color === turn) {
      setSelectedSquare(square);
      audioManager.playSelect();
      const moves = currentChess.moves({ square, verbose: true });
      setLegalMovesForSelected(moves.map((m) => m.to));
    }
  };

  // Promotion choice selection
  const handlePromotionSelect = (piece: PieceSymbol) => {
    if (!pendingPromotion) return;
    executeMove(pendingPromotion.from, pendingPromotion.to, piece);
  };

  // Undo move
  const undo = () => {
    if (isAiThinking || history.length === 0) return;
    const currentChess = chessRef.current;

    // In vs-ai mode, undo 2 plies if both player and AI have moved, or 1 if only 1 move made
    const pliesToUndo = gameMode === 'vs-ai' ? Math.min(2, history.length) : 1;
    for (let i = 0; i < pliesToUndo; i++) {
      currentChess.undo();
    }

    setFen(currentChess.fen());
    setBoard(currentChess.board());
    setTurn(currentChess.turn());
    setSelectedSquare(null);
    setLegalMovesForSelected([]);
    setPendingPromotion(null);
    setGameStatus({ isOver: false, winner: null, reason: '' });

    const newHistory = history.slice(0, Math.max(0, history.length - pliesToUndo));
    setHistory(newHistory);
    const prev = newHistory[newHistory.length - 1];
    setLastMove(prev ? { from: prev.from, to: prev.to } : null);

    setInCheck(currentChess.inCheck());
    setCheckSquare(currentChess.inCheck() ? findKingSquare(currentChess.turn(), currentChess) : null);
    computeMaterial(currentChess);
    audioManager.playMove();
  };

  // Resign
  const resign = () => {
    if (gameStatus.isOver) return;
    const resigningColor = gameMode === 'vs-ai' ? playerColor : turn;
    const winner = resigningColor === 'w' ? 'b' : 'w';
    setGameStatus({
      isOver: true,
      winner,
      reason: `${resigningColor === 'w' ? 'White' : 'Black'} resigned`,
    });
    audioManager.playLoss();
  };

  // Offer draw
  const offerDraw = () => {
    if (gameStatus.isOver) return;
    // In vs AI: AI accepts draw if evaluation is balanced (-100 to +100 centipawns)
    if (gameMode === 'vs-ai') {
      const evaluation = Math.abs(getBoardEvaluation(chessRef.current));
      if (evaluation < 150) {
        setGameStatus({
          isOver: true,
          winner: 'draw',
          reason: 'Draw agreed by mutual consensus',
        });
        audioManager.playDraw();
      } else {
        audioManager.playIllegal();
      }
    } else {
      setGameStatus({
        isOver: true,
        winner: 'draw',
        reason: 'Draw agreed by mutual consensus',
      });
      audioManager.playDraw();
    }
  };

  // Reset / New Game
  const resetGame = (
    mode: GameMode = gameMode,
    color: PlayerColor = playerColor,
    tc: TimeControl = timeControl,
    diff: BotDifficulty = botDifficulty
  ) => {
    chessRef.current.reset();
    setFen(chessRef.current.fen());
    setBoard(chessRef.current.board());
    setTurn('w');
    setGameMode(mode);
    setPlayerColor(color);
    setBotDifficulty(diff);
    setTimeControl(tc);
    setWhiteTime(TIME_CONTROLS[tc].initialSeconds);
    setBlackTime(TIME_CONTROLS[tc].initialSeconds);
    setHistory([]);
    setLastMove(null);
    setSelectedSquare(null);
    setLegalMovesForSelected([]);
    setPendingPromotion(null);
    setInCheck(false);
    setCheckSquare(null);
    setGameStatus({ isOver: false, winner: null, reason: '' });
    setCapturedPieces({ w: [], b: [] });
    setMaterialAdvantage({ w: 0, b: 0 });
    setIsAiThinking(false);
    setFlipped(color === 'b');
    audioManager.playMove();
  };

  // Load a tactical puzzle / level position
  const loadPuzzlePosition = (fenString: string, puzzleTurn: PlayerColor = 'w') => {
    chessRef.current.load(fenString);
    setFen(chessRef.current.fen());
    setBoard(chessRef.current.board());
    setTurn(chessRef.current.turn());
    setGameMode('puzzle');
    setPlayerColor(puzzleTurn);
    setTimeControl('unlimited');
    setWhiteTime(0);
    setBlackTime(0);
    setHistory([]);
    setLastMove(null);
    setSelectedSquare(null);
    setLegalMovesForSelected([]);
    setPendingPromotion(null);
    setInCheck(chessRef.current.inCheck());
    setCheckSquare(chessRef.current.inCheck() ? findKingSquare(chessRef.current.turn(), chessRef.current) : null);
    setGameStatus({ isOver: false, winner: null, reason: '' });
    computeMaterial(chessRef.current);
    setIsAiThinking(false);
    setFlipped(puzzleTurn === 'b');
    audioManager.playMove();
  };

  const flipBoard = () => {
    setFlipped((prev) => !prev);
  };

  return {
    fen,
    board,
    turn,
    gameMode,
    playerColor,
    botDifficulty,
    timeControl,
    isAiThinking,
    flipped,
    whiteTime,
    blackTime,
    history,
    lastMove,
    selectedSquare,
    legalMovesForSelected,
    pendingPromotion,
    inCheck,
    checkSquare,
    gameStatus,
    capturedPieces,
    materialAdvantage,
    handleSquareClick,
    handlePromotionSelect,
    executeMove,
    undo,
    resign,
    offerDraw,
    resetGame,
    loadPuzzlePosition,
    flipBoard,
    setBotDifficulty,
    setTimeControl,
    setGameMode,
    setPlayerColor,
  };
}

function getBoardEvaluation(chess: Chess): number {
  const values: Record<PieceSymbol, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  let score = 0;
  const b = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = b[r][c];
      if (p) {
        const val = values[p.type];
        score += p.color === 'w' ? val : -val;
      }
    }
  }
  return score;
}
