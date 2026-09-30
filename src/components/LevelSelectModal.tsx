import React, { useState } from 'react';
import { CHESS_LEVELS, ChessPuzzle, getTodayDailyPuzzle, getTodayKey } from '../utils/chessLevels';
import { 
  Trophy, 
  Star, 
  Lock, 
  CheckCircle2, 
  Play, 
  Flame, 
  HelpCircle, 
  X, 
  ChevronRight, 
  Award,
  Calendar,
  Sparkles
} from 'lucide-react';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLevel: (puzzle: ChessPuzzle) => void;
  completedLevelIds: string[];
  dailyChallengesCompleted?: string[];
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectLevel,
  completedLevelIds,
  dailyChallengesCompleted = [],
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const todayKey = getTodayKey();
  const dailyPuzzle = getTodayDailyPuzzle();
  const isDailyCompleted = dailyChallengesCompleted.includes(todayKey) || completedLevelIds.includes(dailyPuzzle.id);

  const filteredLevels =
    selectedCategory === 'all'
      ? CHESS_LEVELS
      : CHESS_LEVELS.filter((lvl) => lvl.category === selectedCategory);

  const getDifficultyBadge = (diff: ChessPuzzle['difficulty']) => {
    switch (diff) {
      case 'Beginner':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Club':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'Expert':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Grandmaster':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-700/80 rounded-2xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl text-neutral-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white font-display">
              Chess Challenge Levels (शतरंज लेवल चुनौतियाँ)
            </h2>
            <p className="text-xs text-neutral-400">
              प्रत्येक लेवल पर अलग पहेली, रणनीति और चेकमेट हल करें और स्टार्स जीतें!
            </p>
          </div>
        </div>

        {/* Highlighted Daily Challenge Card */}
        <div className="my-3.5 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-neutral-900 to-amber-950/20 border border-amber-500/40 shadow-lg relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 shadow-xs uppercase font-mono">
                  <Flame className="w-3 h-3" />
                  Daily Challenge
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  {todayKey}
                </span>
                {isDailyCompleted && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    Solved Today (+50 Elo)
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>{dailyPuzzle.title}</span>
              </h3>

              <p className="text-xs text-neutral-300 leading-relaxed max-w-md">
                {dailyPuzzle.description}
              </p>
            </div>

            <button
              onClick={() => {
                onSelectLevel(dailyPuzzle);
                onClose();
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer shrink-0 ${
                isDailyCompleted
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                  : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-500/20'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isDailyCompleted ? 'Replay Challenge' : 'Play Today’s Challenge'}</span>
            </button>
          </div>
        </div>

        {/* Progress Stats Bar */}
        <div className="my-3 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-semibold text-neutral-300">Level Progress</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono font-bold text-amber-400">
              {completedLevelIds.length} / {CHESS_LEVELS.length} Cleared
            </div>
            <div className="w-24 sm:w-32 h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                style={{
                  width: `${(completedLevelIds.length / CHESS_LEVELS.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Filter Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {[
            { id: 'all', label: 'All Levels' },
            { id: 'mate-in-1', label: 'Mate in 1' },
            { id: 'mate-in-2', label: 'Mate in 2' },
            { id: 'fork', label: 'Tactical Forks' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Level Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredLevels.map((lvl) => {
            const isCompleted = completedLevelIds.includes(lvl.id);
            return (
              <div
                key={lvl.id}
                onClick={() => {
                  onSelectLevel(lvl);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                  isCompleted
                    ? 'bg-emerald-500/5 border-emerald-500/40 hover:border-emerald-500'
                    : 'bg-neutral-900/60 border-neutral-800 hover:border-amber-500/60 hover:bg-neutral-850'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      Level {lvl.level}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getDifficultyBadge(
                        lvl.difficulty
                      )}`}
                    >
                      {lvl.difficulty}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-neutral-100 mb-1 flex items-center gap-1.5">
                    {isCompleted && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span>{lvl.title}</span>
                  </h3>

                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed mb-3">
                    {lvl.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-neutral-500 font-mono text-[11px]">
                    {lvl.category.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>{isCompleted ? 'Replay' : 'Play Level'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
