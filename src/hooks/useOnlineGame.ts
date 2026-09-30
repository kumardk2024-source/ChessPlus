import { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square, PieceSymbol, Color, Move } from 'chess.js';
import { audioManager } from '../utils/audioManager';
import confetti from 'canvas-confetti';

export interface OnlinePlayer {
  id: string;
  name: string;
  color: 'w' | 'b';
}

export interface UseOnlineGameProps {
  roomId: string | null;
  playerName: string;
  onLeaveRoom: () => void;
}

export function useOnlineGame({ roomId, playerName, onLeaveRoom }: UseOnlineGameProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const chessRef = useRef<Chess>(new Chess());

  const [connected, setConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [myColor, setMyColor] = useState<Color>('w');
  const [players, setPlayers] = useState<OnlinePlayer[]>([]);
  const [peerConnected, setPeerConnected] = useState<boolean>(false);

  const [fen, setFen] = useState<string>(chessRef.current.fen());
  const [board, setBoard] = useState(chessRef.current.board());
  const [turn, setTurn] = useState<Color>('w');
  const [history, setHistory] = useState<Array<{ from: Square; to: Square; san: string; fen: string }>>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  const [whiteTime, setWhiteTime] = useState<number>(600);
  const [blackTime, setBlackTime] = useState<number>(600);

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMovesForSelected, setLegalMovesForSelected] = useState<Square[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  const [inCheck, setInCheck] = useState<boolean>(false);
  const [checkSquare, setCheckSquare] = useState<Square | null>(null);
  const [gameStatus, setGameStatus] = useState<{
    isOver: boolean;
    winner: Color | 'draw' | null;
    reason: string;
  }>({
    isOver: false,
    winner: null,
    reason: '',
  });

  const [capturedPieces, setCapturedPieces] = useState<{ w: PieceSymbol[]; b: PieceSymbol[] }>({
    w: [],
    b: [],
  });
  const [materialAdvantage, setMaterialAdvantage] = useState<{ w: number; b: number }>({
    w: 0,
    b: 0,
  });

  const [drawOfferedBy, setDrawOfferedBy] = useState<string | null>(null);
  const [webrtcSignal, setWebrtcSignal] = useState<{ signalData: any; callType: 'audio' | 'video' } | null>(null);
  const [peerCallStatus, setPeerCallStatus] = useState<{
    isCalling: boolean;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    playerName: string;
  } | null>(null);

  // Compute captured and material
  const syncMaterial = useCallback((chess: Chess) => {
    const counts = { p: 0, n: 0, b: 0, r: 0, q: 0 };
    const initialCounts = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    const boardState = chess.board();

    const whiteRemaining = { ...counts };
    const blackRemaining = { ...counts };

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c];
        if (!piece || piece.type === 'k') continue;
        if (piece.color === 'w') whiteRemaining[piece.type]++;
        else blackRemaining[piece.type]++;
      }
    }

    const capturedByWhite: PieceSymbol[] = [];
    const capturedByBlack: PieceSymbol[] = [];

    (Object.keys(initialCounts) as (keyof typeof initialCounts)[]).forEach((type) => {
      const missingBlack = initialCounts[type] - blackRemaining[type];
      for (let i = 0; i < missingBlack; i++) capturedByWhite.push(type);

      const missingWhite = initialCounts[type] - whiteRemaining[type];
      for (let i = 0; i < missingWhite; i++) capturedByBlack.push(type);
    });

    setCapturedPieces({ w: capturedByWhite, b: capturedByBlack });

    const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    const whiteScore = Object.entries(whiteRemaining).reduce(
      (acc, [t, count]) => acc + count * (values[t] || 0),
      0
    );
    const blackScore = Object.entries(blackRemaining).reduce(
      (acc, [t, count]) => acc + count * (values[t] || 0),
      0
    );

    const diff = whiteScore - blackScore;
    setMaterialAdvantage({
      w: diff > 0 ? diff : 0,
      b: diff < 0 ? Math.abs(diff) : 0,
    });
  }, []);

  // Connect to WebSocket room
  useEffect(() => {
    if (!roomId) return;

    setConnecting(true);
    setConnectionError(null);

    // Get stored playerId or generate new one
    let pid = localStorage.getItem('chessplus-player-id');
    if (!pid) {
      pid = 'usr_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('chessplus-player-id', pid);
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setConnecting(false);
      ws.send(
        JSON.stringify({
          type: 'JOIN_ROOM',
          roomId: roomId.toUpperCase(),
          playerId: pid,
          playerName: playerName || 'Player',
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'ROOM_JOINED') {
          setMyColor(msg.yourColor);
          chessRef.current.load(msg.fen);
          setFen(msg.fen);
          setBoard(chessRef.current.board());
          setTurn(msg.turn);
          setWhiteTime(msg.whiteTime);
          setBlackTime(msg.blackTime);
          setPlayers(msg.players || []);
          setPeerConnected(msg.players?.length >= 2);
          setHistory(msg.history || []);
          syncMaterial(chessRef.current);

          if (msg.history && msg.history.length > 0) {
            const last = msg.history[msg.history.length - 1];
            setLastMove({ from: last.from, to: last.to });
          }

          if (msg.isOver) {
            setGameStatus({
              isOver: true,
              winner: msg.winner,
              reason: msg.reason,
            });
          }
        }

        if (msg.type === 'PEER_JOINED') {
          setPlayers(msg.players || []);
          setPeerConnected(true);
          audioManager.playSelect();
        }

        if (msg.type === 'PEER_DISCONNECTED') {
          setPeerConnected(false);
        }

        if (msg.type === 'MOVE_EXECUTED') {
          const { from, to, san, fen: nextFen, turn: nextTurn, isOver, winner, reason } = msg;
          const chess = chessRef.current;
          chess.load(nextFen);

          setFen(nextFen);
          setBoard(chess.board());
          setTurn(nextTurn);
          setLastMove({ from, to });
          setHistory((prev) => [...prev, { from, to, san, fen: nextFen }]);
          setSelectedSquare(null);
          setLegalMovesForSelected([]);
          syncMaterial(chess);

          const isCapture = san.includes('x');
          const isCheckNow = chess.inCheck();
          setInCheck(isCheckNow);

          if (isCheckNow) {
            audioManager.playCheck();
          } else if (isCapture) {
            audioManager.playCapture();
          } else {
            audioManager.playMove();
          }

          if (isOver) {
            setGameStatus({ isOver: true, winner, reason });
            if (winner && winner !== 'draw') {
              audioManager.playWin();
              confetti({ particleCount: 70, spread: 60 });
            }
          }
        }

        if (msg.type === 'CLOCK_TICK') {
          setWhiteTime(msg.whiteTime);
          setBlackTime(msg.blackTime);
        }

        if (msg.type === 'GAME_OVER') {
          setGameStatus({
            isOver: true,
            winner: msg.winner,
            reason: msg.reason,
          });
          setWhiteTime(msg.whiteTime);
          setBlackTime(msg.blackTime);

          if (msg.winner && msg.winner !== 'draw') {
            audioManager.playWin();
            confetti({ particleCount: 70, spread: 60 });
          }
        }

        if (msg.type === 'DRAW_OFFERED') {
          setDrawOfferedBy(msg.fromPlayerName);
        }

        if (msg.type === 'WEBRTC_SIGNAL') {
          setWebrtcSignal({
            signalData: msg.signalData,
            callType: msg.callType || 'audio',
          });
        }

        if (msg.type === 'PEER_CALL_STATUS') {
          setPeerCallStatus({
            isCalling: msg.isCalling,
            isAudioEnabled: msg.isAudioEnabled,
            isVideoEnabled: msg.isVideoEnabled,
            playerName: msg.playerName,
          });
        }

        if (msg.type === 'ROOM_RESTARTED') {
          setMyColor(msg.yourColor);
          chessRef.current.load(msg.fen);
          setFen(msg.fen);
          setBoard(chessRef.current.board());
          setTurn(msg.turn);
          setWhiteTime(msg.whiteTime);
          setBlackTime(msg.blackTime);
          setHistory([]);
          setLastMove(null);
          setSelectedSquare(null);
          setLegalMovesForSelected([]);
          setGameStatus({ isOver: false, winner: null, reason: '' });
          syncMaterial(chessRef.current);
          audioManager.playMove();
        }
      } catch (err) {
        console.error('Online WS error:', err);
      }
    };

    ws.onerror = () => {
      setConnectionError('Network connection failed. Retrying...');
    };

    ws.onclose = () => {
      setConnected(false);
      setConnecting(false);
    };

    return () => {
      ws.close();
    };
  }, [roomId, playerName, syncMaterial]);

  // Execute online move
  const executeOnlineMove = (from: Square, to: Square, promotionPiece?: PieceSymbol) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (turn !== myColor || gameStatus.isOver) return;

    wsRef.current.send(
      JSON.stringify({
        type: 'MAKE_MOVE',
        from,
        to,
        promotion: promotionPiece,
      })
    );
  };

  const handleSquareClick = (square: Square) => {
    if (turn !== myColor || gameStatus.isOver) return;

    const currentChess = chessRef.current;
    const clickedPiece = currentChess.get(square);

    // If a square is already selected, try to move
    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMovesForSelected([]);
        return;
      }

      // Check if move is legal
      const moves = currentChess.moves({ square: selectedSquare, verbose: true });
      const targetMove = moves.find((m) => m.to === square);

      if (targetMove) {
        // Check for pawn promotion
        const piece = currentChess.get(selectedSquare);
        const isPromotion =
          piece?.type === 'p' &&
          ((piece.color === 'w' && square[1] === '8') || (piece.color === 'b' && square[1] === '1'));

        if (isPromotion) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        executeOnlineMove(selectedSquare, square);
        setSelectedSquare(null);
        setLegalMovesForSelected([]);
        return;
      }
    }

    // Select piece if belongs to player
    if (clickedPiece && clickedPiece.color === myColor) {
      setSelectedSquare(square);
      audioManager.playSelect();
      const moves = currentChess.moves({ square, verbose: true });
      setLegalMovesForSelected(moves.map((m) => m.to));
    }
  };

  const handlePromotionSelect = (piece: PieceSymbol) => {
    if (!pendingPromotion) return;
    executeOnlineMove(pendingPromotion.from, pendingPromotion.to, piece);
    setPendingPromotion(null);
    setSelectedSquare(null);
    setLegalMovesForSelected([]);
  };

  const resign = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'RESIGN' }));
    }
  };

  const offerDraw = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'OFFER_DRAW' }));
    }
  };

  const acceptDraw = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ACCEPT_DRAW' }));
      setDrawOfferedBy(null);
    }
  };

  const declineDraw = () => {
    setDrawOfferedBy(null);
  };

  const requestRestart = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'RESTART_GAME' }));
    }
  };

  return {
    connected,
    connecting,
    connectionError,
    myColor,
    players,
    peerConnected,
    fen,
    board,
    turn,
    history,
    lastMove,
    whiteTime,
    blackTime,
    selectedSquare,
    legalMovesForSelected,
    pendingPromotion,
    inCheck,
    checkSquare,
    gameStatus,
    capturedPieces,
    materialAdvantage,
    drawOfferedBy,
    webrtcSignal,
    peerCallStatus,
    ws: wsRef.current,
    handleSquareClick,
    handlePromotionSelect,
    executeOnlineMove,
    resign,
    offerDraw,
    acceptDraw,
    declineDraw,
    requestRestart,
  };
}
