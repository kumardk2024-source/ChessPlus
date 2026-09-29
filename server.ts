import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { Chess } from 'chess.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory Room State
interface RoomPlayer {
  id: string;
  name: string;
  color: 'w' | 'b';
  ws: WebSocket;
}

interface RoomGame {
  roomId: string;
  fen: string;
  history: Array<{ from: string; to: string; promotion?: string; san: string; fen: string }>;
  turn: 'w' | 'b';
  whiteTime: number;
  blackTime: number;
  timeControl: string;
  initialTime: number;
  increment: number;
  isOver: boolean;
  winner: 'w' | 'b' | 'draw' | null;
  reason: string;
  players: Record<string, RoomPlayer>; // playerId -> RoomPlayer
  lastMoveTimestamp: number | null;
  timerInterval?: NodeJS.Timeout;
}

const rooms = new Map<string, RoomGame>();

// Helper to broadcast to a room
function broadcastToRoom(roomId: string, message: object, excludePlayerId?: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const data = JSON.stringify(message);
  Object.values(room.players).forEach((p) => {
    if (p.id !== excludePlayerId && p.ws.readyState === WebSocket.OPEN) {
      p.ws.send(data);
    }
  });
}

function startRoomClock(room: RoomGame) {
  if (room.timerInterval) clearInterval(room.timerInterval);
  if (room.timeControl === 'unlimited' || room.isOver) return;

  room.lastMoveTimestamp = Date.now();
  room.timerInterval = setInterval(() => {
    if (room.isOver) {
      if (room.timerInterval) clearInterval(room.timerInterval);
      return;
    }

    if (room.turn === 'w') {
      room.whiteTime = Math.max(0, room.whiteTime - 1);
      if (room.whiteTime === 0) {
        room.isOver = true;
        room.winner = 'b';
        room.reason = 'Obsidian wins on time';
        clearInterval(room.timerInterval);
        broadcastToRoom(room.roomId, {
          type: 'GAME_OVER',
          winner: room.winner,
          reason: room.reason,
          whiteTime: room.whiteTime,
          blackTime: room.blackTime,
        });
      }
    } else {
      room.blackTime = Math.max(0, room.blackTime - 1);
      if (room.blackTime === 0) {
        room.isOver = true;
        room.winner = 'w';
        room.reason = 'Silver wins on time';
        clearInterval(room.timerInterval);
        broadcastToRoom(room.roomId, {
          type: 'GAME_OVER',
          winner: room.winner,
          reason: room.reason,
          whiteTime: room.whiteTime,
          blackTime: room.blackTime,
        });
      }
    }

    // Periodically sync clock every 3 seconds or on critical seconds
    if (room.whiteTime % 3 === 0 || room.blackTime % 3 === 0 || room.whiteTime <= 10 || room.blackTime <= 10) {
      broadcastToRoom(room.roomId, {
        type: 'CLOCK_TICK',
        whiteTime: room.whiteTime,
        blackTime: room.blackTime,
      });
    }
  }, 1000);
}

// REST API for room details check
app.get('/api/rooms/:roomId', (req, res) => {
  const room = rooms.get(req.params.roomId.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const playerList = Object.values(room.players).map((p) => ({
    id: p.id,
    name: p.name,
    color: p.color,
  }));

  res.json({
    roomId: room.roomId,
    playerCount: playerList.length,
    players: playerList,
    fen: room.fen,
    turn: room.turn,
    timeControl: room.timeControl,
    isOver: room.isOver,
  });
});

// WebSocket Server attached to same HTTP server
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  let boundRoomId: string | null = null;
  let boundPlayerId: string | null = null;

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      const { type } = data;

      if (type === 'JOIN_ROOM') {
        const { roomId, playerId, playerName, preferredColor, timeControl = '10m' } = data;
        const normalizedRoomId = roomId.toUpperCase().trim();
        boundRoomId = normalizedRoomId;
        boundPlayerId = playerId;

        let room = rooms.get(normalizedRoomId);

        if (!room) {
          // Create room
          const initialSecs =
            timeControl === 'rapid' ? 600 :
            timeControl === 'blitz' ? 180 :
            timeControl === 'bullet' ? 60 :
            timeControl === 'classical' ? 1800 :
            timeControl === 'unlimited' ? 0 : 600;

          const chosenColor: 'w' | 'b' =
            preferredColor === 'b' ? 'b' :
            preferredColor === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : 'w';

          room = {
            roomId: normalizedRoomId,
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            history: [],
            turn: 'w',
            whiteTime: initialSecs,
            blackTime: initialSecs,
            timeControl,
            initialTime: initialSecs,
            increment: 0,
            isOver: false,
            winner: null,
            reason: '',
            players: {},
            lastMoveTimestamp: null,
          };
          rooms.set(normalizedRoomId, room);
        }

        // Determine this player's color
        let playerColor: 'w' | 'b' = 'w';
        const existingPlayerIds = Object.keys(room.players);
        
        if (room.players[playerId]) {
          // Reconnecting player
          playerColor = room.players[playerId].color;
          room.players[playerId].ws = ws;
          room.players[playerId].name = playerName || room.players[playerId].name;
        } else if (existingPlayerIds.length === 0) {
          playerColor = preferredColor === 'b' ? 'b' : 'w';
          room.players[playerId] = {
            id: playerId,
            name: playerName || 'Player 1',
            color: playerColor,
            ws,
          };
        } else if (existingPlayerIds.length === 1) {
          // Opposite of first player
          const firstPlayer = room.players[existingPlayerIds[0]];
          playerColor = firstPlayer.color === 'w' ? 'b' : 'w';
          room.players[playerId] = {
            id: playerId,
            name: playerName || 'Player 2',
            color: playerColor,
            ws,
          };

          // If second player joined and game hasn't started clock, start clock!
          if (room.history.length === 0 && !room.timerInterval) {
            startRoomClock(room);
          }
        } else {
          // Spectator or reconnect fallback
          playerColor = 'b';
          room.players[playerId] = {
            id: playerId,
            name: playerName || `Spectator ${playerId.slice(0, 4)}`,
            color: 'b',
            ws,
          };
        }

        const playersSummary = Object.values(room.players).map((p) => ({
          id: p.id,
          name: p.name,
          color: p.color,
        }));

        // Send full sync to the joined player
        ws.send(
          JSON.stringify({
            type: 'ROOM_JOINED',
            roomId: room.roomId,
            yourColor: playerColor,
            fen: room.fen,
            turn: room.turn,
            history: room.history,
            whiteTime: room.whiteTime,
            blackTime: room.blackTime,
            timeControl: room.timeControl,
            isOver: room.isOver,
            winner: room.winner,
            reason: room.reason,
            players: playersSummary,
          })
        );

        // Notify other player that a peer has connected
        broadcastToRoom(
          room.roomId,
          {
            type: 'PEER_JOINED',
            players: playersSummary,
            newPlayer: { id: playerId, name: playerName, color: playerColor },
          },
          playerId
        );
      }

      if (type === 'MAKE_MOVE') {
        if (!boundRoomId || !boundPlayerId) return;
        const room = rooms.get(boundRoomId);
        if (!room || room.isOver) return;

        const player = room.players[boundPlayerId];
        if (!player) return;

        // Verify turn
        if (player.color !== room.turn) {
          ws.send(JSON.stringify({ type: 'MOVE_REJECTED', reason: 'Not your turn' }));
          return;
        }

        const { from, to, promotion } = data;
        const chess = new Chess(room.fen);

        try {
          const moveResult = chess.move({
            from,
            to,
            promotion: promotion || 'q',
          });

          if (!moveResult) {
            ws.send(JSON.stringify({ type: 'MOVE_REJECTED', reason: 'Illegal move' }));
            return;
          }

          // Update room state
          room.fen = chess.fen();
          room.turn = chess.turn();
          room.history.push({
            from,
            to,
            promotion,
            san: moveResult.san,
            fen: room.fen,
          });

          // Check for game over condition
          if (chess.isGameOver()) {
            room.isOver = true;
            if (chess.isCheckmate()) {
              room.winner = player.color;
              room.reason = `Checkmate! ${player.color === 'w' ? 'Silver' : 'Obsidian'} wins`;
            } else if (chess.isDraw()) {
              room.winner = 'draw';
              if (chess.isStalemate()) room.reason = 'Draw by stalemate';
              else if (chess.isThreefoldRepetition()) room.reason = 'Draw by threefold repetition';
              else if (chess.isInsufficientMaterial()) room.reason = 'Draw by insufficient material';
              else room.reason = 'Draw by 50-move rule';
            }
            if (room.timerInterval) clearInterval(room.timerInterval);
          }

          // Broadcast move to all players in room
          broadcastToRoom(room.roomId, {
            type: 'MOVE_EXECUTED',
            from,
            to,
            promotion,
            san: moveResult.san,
            fen: room.fen,
            turn: room.turn,
            whiteTime: room.whiteTime,
            blackTime: room.blackTime,
            isOver: room.isOver,
            winner: room.winner,
            reason: room.reason,
          });
        } catch {
          ws.send(JSON.stringify({ type: 'MOVE_REJECTED', reason: 'Invalid move' }));
        }
      }

      if (type === 'RESIGN') {
        if (!boundRoomId || !boundPlayerId) return;
        const room = rooms.get(boundRoomId);
        if (!room || room.isOver) return;

        const player = room.players[boundPlayerId];
        if (!player) return;

        room.isOver = true;
        room.winner = player.color === 'w' ? 'b' : 'w';
        room.reason = `${player.name} resigned. ${room.winner === 'w' ? 'Silver' : 'Obsidian'} wins`;
        if (room.timerInterval) clearInterval(room.timerInterval);

        broadcastToRoom(room.roomId, {
          type: 'GAME_OVER',
          winner: room.winner,
          reason: room.reason,
          whiteTime: room.whiteTime,
          blackTime: room.blackTime,
        });
      }

      if (type === 'OFFER_DRAW') {
        if (!boundRoomId || !boundPlayerId) return;
        const room = rooms.get(boundRoomId);
        if (!room || room.isOver) return;

        const player = room.players[boundPlayerId];
        if (!player) return;

        // Forward draw offer to opponent
        broadcastToRoom(
          room.roomId,
          {
            type: 'DRAW_OFFERED',
            fromPlayerName: player.name,
          },
          boundPlayerId
        );
      }

      if (type === 'ACCEPT_DRAW') {
        if (!boundRoomId) return;
        const room = rooms.get(boundRoomId);
        if (!room || room.isOver) return;

        room.isOver = true;
        room.winner = 'draw';
        room.reason = 'Game drawn by agreement';
        if (room.timerInterval) clearInterval(room.timerInterval);

        broadcastToRoom(room.roomId, {
          type: 'GAME_OVER',
          winner: room.winner,
          reason: room.reason,
          whiteTime: room.whiteTime,
          blackTime: room.blackTime,
        });
      }

      if (type === 'RESTART_GAME') {
        if (!boundRoomId) return;
        const room = rooms.get(boundRoomId);
        if (!room) return;

        const initialSecs = room.initialTime;
        room.fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        room.history = [];
        room.turn = 'w';
        room.whiteTime = initialSecs;
        room.blackTime = initialSecs;
        room.isOver = false;
        room.winner = null;
        room.reason = '';

        // Swap colors for rematch fun!
        Object.values(room.players).forEach((p) => {
          p.color = p.color === 'w' ? 'b' : 'w';
        });

        startRoomClock(room);

        const playersSummary = Object.values(room.players).map((p) => ({
          id: p.id,
          name: p.name,
          color: p.color,
        }));

        Object.values(room.players).forEach((p) => {
          if (p.ws.readyState === WebSocket.OPEN) {
            p.ws.send(
              JSON.stringify({
                type: 'ROOM_RESTARTED',
                roomId: room.roomId,
                yourColor: p.color,
                fen: room.fen,
                turn: room.turn,
                whiteTime: room.whiteTime,
                blackTime: room.blackTime,
                players: playersSummary,
              })
            );
          }
        });
      }

      // WebRTC Audio/Video Call Signaling (P2P Call between the 2 friends in the room)
      if (type === 'WEBRTC_SIGNAL') {
        if (!boundRoomId || !boundPlayerId) return;
        const { targetPlayerId, signalData, callType } = data;

        // Relay signal directly to the other player in the room
        broadcastToRoom(
          boundRoomId,
          {
            type: 'WEBRTC_SIGNAL',
            senderPlayerId: boundPlayerId,
            signalData,
            callType,
          },
          boundPlayerId
        );
      }

      if (type === 'CALL_STATUS') {
        if (!boundRoomId || !boundPlayerId) return;
        const { isCalling, isAudioEnabled, isVideoEnabled, playerName } = data;

        // Broadcast call status (e.g. mic mute/unmute, video on/off)
        broadcastToRoom(
          boundRoomId,
          {
            type: 'PEER_CALL_STATUS',
            senderPlayerId: boundPlayerId,
            isCalling,
            isAudioEnabled,
            isVideoEnabled,
            playerName,
          },
          boundPlayerId
        );
      }
    } catch (err) {
      console.error('WebSocket message parsing error:', err);
    }
  });

  ws.on('close', () => {
    if (boundRoomId && boundPlayerId) {
      const room = rooms.get(boundRoomId);
      if (room) {
        broadcastToRoom(boundRoomId, {
          type: 'PEER_DISCONNECTED',
          playerId: boundPlayerId,
        });
      }
    }
  });
});

// Mount Vite middleware in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, when running dist/server.js or server.ts, resolve dist correctly
    const distPath = path.resolve(__dirname.endsWith('dist') ? __dirname : path.join(__dirname, 'dist'));
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`ChessPlus Server with Real-time WebSockets listening on port ${PORT}`);
  });
}

startServer();
