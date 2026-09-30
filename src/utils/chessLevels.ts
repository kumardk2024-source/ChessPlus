export interface ChessPuzzle {
  id: string;
  level: number;
  title: string;
  category: 'mate-in-1' | 'mate-in-2' | 'fork' | 'pin' | 'skewer' | 'endgame';
  difficulty: 'Beginner' | 'Club' | 'Expert' | 'Grandmaster';
  fen: string;
  turn: 'w' | 'b';
  description: string;
  hint: string;
  solutionMoves: Array<{ from: string; to: string; promotion?: string }>;
  explanation: string;
}

export const CHESS_LEVELS: ChessPuzzle[] = [
  {
    id: 'lvl-1',
    level: 1,
    title: "Scholar's Checkmate",
    category: 'mate-in-1',
    difficulty: 'Beginner',
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
    turn: 'w',
    description: 'White has concentrated firepower on the f7 weakness. Deliver checkmate in one single decisive move!',
    hint: 'Queen attacks f7 defended by the Bishop.',
    solutionMoves: [{ from: 'f3', to: 'f7' }],
    explanation: 'Qxf7# attacks the Black King while protected by the Bishop on c4. The King cannot escape or take the Queen!',
  },
  {
    id: 'lvl-2',
    level: 2,
    title: 'Back-Rank Decapitation',
    category: 'mate-in-1',
    difficulty: 'Beginner',
    fen: '6k1/5ppp/8/8/8/8/4R3/4K3 w - - 0 1',
    turn: 'w',
    description: 'Black’s king is trapped behind its own pawns. Infiltrate the back rank for immediate checkmate!',
    hint: 'Move the Rook to the 8th rank.',
    solutionMoves: [{ from: 'e2', to: 'e8' }],
    explanation: 'Re8# traps the Black King on the back rank behind the g7, f7, and h7 pawns.',
  },
  {
    id: 'lvl-3',
    level: 3,
    title: 'The Royal Knight Fork',
    category: 'fork',
    difficulty: 'Club',
    fen: 'r3k2r/ppp2ppp/2n5/3q4/3N4/8/PPP2PPP/R1BQK2R w KQkq - 0 1',
    turn: 'w',
    description: 'Use the leaping agility of the Knight to fork King and Queen simultaneously.',
    hint: 'Check the king while eyeing the queen on d5 or c7.',
    solutionMoves: [
      { from: 'd4', to: 'c6' }
    ],
    explanation: 'Nxc6 wins the piece and dismantles Black’s active defense!',
  },
  {
    id: 'lvl-4',
    level: 4,
    title: 'Arabian Mate Finale',
    category: 'mate-in-1',
    difficulty: 'Club',
    fen: '7k/R7/5N2/8/8/8/8/4K3 w - - 0 1',
    turn: 'w',
    description: 'Knight and Rook unite in the ancient Arabian checkmate coordination.',
    hint: 'Slide the Rook along the 7th rank to corner the King.',
    solutionMoves: [{ from: 'a7', to: 'h7' }],
    explanation: 'Rh7# delivers checkmate supported by the f6 Knight guarding h7 and g8.',
  },
  {
    id: 'lvl-5',
    level: 5,
    title: 'Anastasia’s Mate',
    category: 'mate-in-2',
    difficulty: 'Expert',
    fen: '5rk1/1p3ppp/4N3/8/8/8/5PPP/R3R1K1 w - - 0 1',
    turn: 'w',
    description: 'Sacrifice or trade on f8 to exploit the Knight’s clamp on g7.',
    hint: 'Take the defender on f8 with check.',
    solutionMoves: [
      { from: 'e6', to: 'f8' }
    ],
    explanation: 'Nxf8 removes the defensive perimeter and secures dominant board control.',
  },
  {
    id: 'lvl-6',
    level: 6,
    title: 'Smothered Mate (Philidor’s Legacy)',
    category: 'mate-in-1',
    difficulty: 'Expert',
    fen: '6rk/6pp/7N/8/8/8/8/4K3 w - - 0 1',
    turn: 'w',
    description: 'The King is completely boxed in by its own army. Strike with a surgical Knight jump!',
    hint: 'Knight lands on f7 with double check/mate.',
    solutionMoves: [{ from: 'h6', to: 'f7' }],
    explanation: 'Nf7# is the legendary smothered mate! The King has no squares because his own Rook and pawns block all escapes.',
  },
  {
    id: 'lvl-7',
    level: 7,
    title: 'Epaulette Checkmate',
    category: 'mate-in-1',
    difficulty: 'Expert',
    fen: '4rk1r/8/8/8/8/8/5Q2/4K3 w - - 0 1',
    turn: 'w',
    description: 'Flanked by his own cornered rooks, the king has no lateral flight squares.',
    hint: 'Drive the Queen directly into the King’s face.',
    solutionMoves: [{ from: 'f2', to: 'f7' }],
    explanation: 'Qf7# is decisive with no legal escapes available.',
  },
  {
    id: 'lvl-8',
    level: 8,
    title: 'Grandmaster Queen Sacrifice',
    category: 'mate-in-1',
    difficulty: 'Grandmaster',
    fen: 'r1b2r1k/pp3p1p/2p1p1p1/8/2B1N3/5Q2/Pq3PPP/R4RK1 w - - 0 1',
    turn: 'w',
    description: 'Shatter the Black kingside fortress with an irresistible tactical blow.',
    hint: 'Push the Queen to f6 to seize the dark-square diagonals.',
    solutionMoves: [{ from: 'f3', to: 'f6' }],
    explanation: 'Qf6+ creates unstoppable mate threats on g7 and h7, forcing capitulation!',
  },
];

export const DAILY_PUZZLES: ChessPuzzle[] = [
  {
    id: 'daily-1',
    level: 101,
    title: 'Daily Tactic: Greek Gift Sacrifice',
    category: 'mate-in-1',
    difficulty: 'Expert',
    fen: 'r1bq1rk1/ppp2ppp/2n1pn2/8/1bBP4/2N1PN2/PP3PPP/R1BQR1K1 w - - 0 1',
    turn: 'w',
    description: 'Bxh7+ classic piece sac ripping open the h-file for the royal battery. Discover the winning continuation!',
    hint: 'Bishop takes h7 with check.',
    solutionMoves: [{ from: 'c4', to: 'f7' }],
    explanation: 'Bxf7+ shatters the king’s shelter immediately, breaking the castled shell!',
  },
  {
    id: 'daily-2',
    level: 102,
    title: 'Daily Tactic: Boden’s Mate Criss-Cross',
    category: 'mate-in-1',
    difficulty: 'Club',
    fen: '2kr1b1r/pp1n1ppp/2p1pn2/8/8/1B1P1B2/PPPB1PPP/R3K2R w KQ - 0 1',
    turn: 'w',
    description: 'Two laser-focused bishops criss-crossing the light and dark diagonal alleys.',
    hint: 'Bishop takes a6 or delivers check along the diagonal.',
    solutionMoves: [{ from: 'd2', to: 'a5' }],
    explanation: 'Ba5 skewers the rook on d8 and penetrates Black’s queenside structure!',
  },
  {
    id: 'daily-3',
    level: 103,
    title: 'Daily Tactic: Queen & Knight Deflection',
    category: 'fork',
    difficulty: 'Club',
    fen: 'r1b2rk1/pp3ppp/2n5/2bq4/4N3/3B4/PPP2PPP/R1BQK2R w KQ - 0 1',
    turn: 'w',
    description: 'Unleash the hidden discovered attack on Black’s queen on d5.',
    hint: 'Move the knight with check or threat.',
    solutionMoves: [{ from: 'e4', to: 'f6' }],
    explanation: 'Nf6+ gives a discovered attack from the d3 bishop onto the unprotected d5 queen!',
  },
  {
    id: 'daily-4',
    level: 104,
    title: 'Daily Tactic: The Opera House Checkmate',
    category: 'mate-in-1',
    difficulty: 'Expert',
    fen: '4kb1r/p2n1ppp/4p3/4N3/3P4/8/PP3PPP/1R1R2K1 w k - 0 1',
    turn: 'w',
    description: 'Morphy’s legendary harmony between Rook and Bishop pinning and crushing the central king.',
    hint: 'Rook slides to d8 with checkmate.',
    solutionMoves: [{ from: 'd1', to: 'd8' }],
    explanation: 'Rd8# finishes the duel with relentless coordination!',
  },
  {
    id: 'daily-5',
    level: 105,
    title: 'Daily Tactic: Blackburne’s Double Bishop Mate',
    category: 'mate-in-1',
    difficulty: 'Grandmaster',
    fen: 'r1b2rk1/1pp2ppp/p1np4/8/B3n3/2B5/PPP2PPP/R3R1K1 w - - 0 1',
    turn: 'w',
    description: 'Black’s king is stripped of defenders on g8. Strike with unstoppable diagonal pressure.',
    hint: 'Sacrifice on e4 or exploit the c3 bishop line.',
    solutionMoves: [{ from: 'e1', to: 'e4' }],
    explanation: 'Rxe4 wins the key active knight and opens the decisive attack on g7!',
  },
  {
    id: 'daily-6',
    level: 106,
    title: 'Daily Tactic: Corner Trapped Rook',
    category: 'skewer',
    difficulty: 'Beginner',
    fen: '8/8/8/4k3/8/2B5/8/4K2R w K - 0 1',
    turn: 'w',
    description: 'The King and Rook line up on the long light diagonal. Skewer them instantly!',
    hint: 'Check the king with your bishop.',
    solutionMoves: [{ from: 'c3', to: 'e5' }],
    explanation: 'Bxe5+ or checks win the exchange effortlessly.',
  },
  {
    id: 'daily-7',
    level: 107,
    title: 'Daily Tactic: Damiano’s Mate Battery',
    category: 'mate-in-1',
    difficulty: 'Expert',
    fen: '5rk1/6p1/5p2/8/8/6Q1/7P/4R1K1 w - - 0 1',
    turn: 'w',
    description: 'Infiltrate down the e-file or h-file to trap the king against the back edge.',
    hint: 'Push the Rook to the 7th rank.',
    solutionMoves: [{ from: 'e1', to: 'e7' }],
    explanation: 'Re7 threatens decisive mate on g7 that cannot be parried!',
  }
];

export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDailyPuzzle(): ChessPuzzle & { dateKey: string } {
  const dateKey = getTodayKey();
  // Generate deterministic day-of-year hash
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const puzzle = DAILY_PUZZLES[dayOfYear % DAILY_PUZZLES.length];
  
  return {
    ...puzzle,
    id: `daily-${dateKey}`,
    dateKey,
  };
}

