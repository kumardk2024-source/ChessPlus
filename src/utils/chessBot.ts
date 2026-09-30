import { Chess, Square, PieceSymbol } from 'chess.js';

export type BotDifficulty = 'novice' | 'casual' | 'intermediate' | 'master';

// Piece baseline evaluation weights (centipawns)
const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece Square Tables (from White's perspective; inverted for Black)
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 25, 25, 10,  5,  5,
  0,  0,  0, 20, 20,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
  -5,  0,  5,  5,  5,  5,  0, -5,
  0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_TABLE_MID = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
  20, 20,  0,  0,  0,  0, 20, 20,
  20, 30, 10,  0,  0, 10, 30, 20
];

function squareToIndex(square: Square, color: 'w' | 'b'): number {
  const file = square.charCodeAt(0) - 97; // 0..7 (a..h)
  const rank = parseInt(square[1], 10) - 1; // 0..7 (1..8)
  if (color === 'w') {
    return (7 - rank) * 8 + file;
  } else {
    return rank * 8 + file;
  }
}

function getPositionalBonus(piece: PieceSymbol, square: Square, color: 'w' | 'b'): number {
  const index = squareToIndex(square, color);
  switch (piece) {
    case 'p': return PAWN_TABLE[index] || 0;
    case 'n': return KNIGHT_TABLE[index] || 0;
    case 'b': return BISHOP_TABLE[index] || 0;
    case 'r': return ROOK_TABLE[index] || 0;
    case 'q': return QUEEN_TABLE[index] || 0;
    case 'k': return KING_TABLE_MID[index] || 0;
    default: return 0;
  }
}

/**
 * Static Board Evaluation relative to side to move
 */
export function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    return -99999;
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
    return 0;
  }

  let whiteScore = 0;
  let blackScore = 0;

  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const fileChar = String.fromCharCode(97 + c);
      const rankNum = 8 - r;
      const sq = `${fileChar}${rankNum}` as Square;

      const material = PIECE_VALUES[piece.type];
      const positional = getPositionalBonus(piece.type, sq, piece.color);
      const total = material + positional;

      if (piece.color === 'w') {
        whiteScore += total;
      } else {
        blackScore += total;
      }
    }
  }

  const turn = chess.turn();
  return turn === 'w' ? whiteScore - blackScore : blackScore - whiteScore;
}

/**
 * Quiescence search for captures to prevent the horizon effect on higher difficulties
 */
function quiescence(chess: Chess, alpha: number, beta: number, depth: number): number {
  const standPat = evaluateBoard(chess);
  if (depth <= 0) return standPat;

  if (standPat >= beta) return beta;
  if (alpha < standPat) alpha = standPat;

  const legalMoves = chess.moves({ verbose: true });
  // Filter captures only
  const captureMoves = legalMoves.filter(
    (m) => m.captured !== undefined || (typeof m.isCapture === 'function' && m.isCapture())
  );

  // MVV-LVA (Most Valuable Victim - Least Valuable Attacker) sort
  captureMoves.sort((a, b) => {
    const valA = (a.captured ? PIECE_VALUES[a.captured] : 0) - PIECE_VALUES[a.piece];
    const valB = (b.captured ? PIECE_VALUES[b.captured] : 0) - PIECE_VALUES[b.piece];
    return valB - valA;
  });

  for (const move of captureMoves) {
    chess.move(move);
    const score = -quiescence(chess, -beta, -alpha, depth - 1);
    chess.undo();

    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }

  return alpha;
}

/**
 * Minimax with Alpha-Beta Pruning
 */
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  useQuiescence: boolean
): number {
  if (chess.isGameOver()) {
    if (chess.isCheckmate()) return -99999 + (10 - depth); // Prefer faster mates
    return 0; // Draw
  }

  if (depth === 0) {
    if (useQuiescence) {
      return quiescence(chess, alpha, beta, 2);
    }
    return evaluateBoard(chess);
  }

  const moves = chess.moves({ verbose: true });

  // Prioritize captures first for move ordering efficiency
  moves.sort((a, b) => {
    const aCap = a.captured ? 1000 : 0;
    const bCap = b.captured ? 1000 : 0;
    return bCap - aCap;
  });

  let maxEval = -Infinity;

  for (const move of moves) {
    chess.move(move);
    const evaluation = -minimax(chess, depth - 1, -beta, -alpha, useQuiescence);
    chess.undo();

    maxEval = Math.max(maxEval, evaluation);
    alpha = Math.max(alpha, evaluation);
    if (beta <= alpha) {
      break; // Alpha-beta cutoff
    }
  }

  return maxEval;
}

/**
 * Calculates the best move for the AI bot according to difficulty
 */
export async function getAiMove(
  chess: Chess,
  difficulty: BotDifficulty
): Promise<{ from: Square; to: Square; promotion?: PieceSymbol } | null> {
  const legalMoves = chess.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  // Artificial thinking delay (350ms - 800ms) for humanized rhythm
  const delay = difficulty === 'novice' ? 400 : difficulty === 'casual' ? 500 : 750;
  await new Promise((res) => setTimeout(res, delay));

  // 1. Novice (~600 Elo):
  // 65% random move, 35% simple capture or check
  if (difficulty === 'novice') {
    const captures = legalMoves.filter(
      (m) => m.captured !== undefined || (typeof m.isCapture === 'function' && m.isCapture())
    );
    if (captures.length > 0 && Math.random() < 0.45) {
      const selected = captures[Math.floor(Math.random() * captures.length)];
      return { from: selected.from, to: selected.to, promotion: 'q' };
    }
    const chosen = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return { from: chosen.from, to: chosen.to, promotion: 'q' };
  }

  // 2. Casual (~1100 Elo):
  // Depth 1 evaluation with light randomness to avoid robotic play
  if (difficulty === 'casual') {
    let bestScore = -Infinity;
    let candidates: typeof legalMoves = [];

    for (const move of legalMoves) {
      chess.move(move);
      const score = -evaluateBoard(chess) + (Math.random() * 30 - 15);
      chess.undo();

      if (score > bestScore) {
        bestScore = score;
        candidates = [move];
      } else if (Math.abs(score - bestScore) < 15) {
        candidates.push(move);
      }
    }

    const picked = candidates[Math.floor(Math.random() * candidates.length)] || legalMoves[0];
    return { from: picked.from, to: picked.to, promotion: 'q' };
  }

  // 3. Intermediate (~1550 Elo):
  // Minimax Depth 2 with Alpha-Beta
  if (difficulty === 'intermediate') {
    let bestScore = -Infinity;
    let bestMove = legalMoves[0];

    for (const move of legalMoves) {
      chess.move(move);
      const score = -minimax(chess, 2, -Infinity, Infinity, false);
      chess.undo();

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return { from: bestMove.from, to: bestMove.to, promotion: 'q' };
  }

  // 4. Master (~1950 Elo):
  // Minimax Depth 3 + Quiescence search
  let bestScore = -Infinity;
  let bestMove = legalMoves[0];

  for (const move of legalMoves) {
    chess.move(move);
    const score = -minimax(chess, 3, -Infinity, Infinity, true);
    chess.undo();

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return { from: bestMove.from, to: bestMove.to, promotion: 'q' };
}
