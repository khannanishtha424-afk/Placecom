import React, { useState } from 'react';
import { 
  Activity, 
  RotateCcw, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Brain, 
  ArrowRight, 
  HelpCircle,
  Eye,
  ChevronRight
} from 'lucide-react';
import { Flashcard } from '../../types/user';
import { Course } from '../../types/course';
import { SoundEffects } from '../../services/audio';

interface TidalVortexViewProps {
  course: Course;
  flashcards: Flashcard[];
  onUpdateFlashcards: (cards: Flashcard[]) => void;
  onNavigateLesson: (lessonId: string) => void;
}

export const TidalVortexView: React.FC<TidalVortexViewProps> = ({
  course,
  flashcards,
  onUpdateFlashcards,
  onNavigateLesson
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState<'flashcards' | 'whirlpool' | 'weak-topics'>('flashcards');

  const currentCard = flashcards[currentCardIndex] || flashcards[0];

  const handleRate = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    SoundEffects.playClick();
    if (!currentCard) return;

    // Spaced repetition scheduling formula (SuperMemo inspired)
    let newInterval = currentCard.intervalDays;
    let newEase = currentCard.easeFactor;

    if (rating === 'again') {
      newInterval = 1;
      newEase = Math.max(1.3, newEase - 0.2);
    } else if (rating === 'hard') {
      newInterval = Math.max(1, Math.round(newInterval * 1.2));
      newEase = Math.max(1.3, newEase - 0.15);
    } else if (rating === 'good') {
      newInterval = Math.round(newInterval * newEase);
    } else if (rating === 'easy') {
      newInterval = Math.round(newInterval * newEase * 1.3);
      newEase += 0.15;
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);

    const updated = flashcards.map((c) =>
      c.id === currentCard.id
        ? {
            ...c,
            intervalDays: newInterval,
            easeFactor: newEase,
            repetitions: c.repetitions + 1,
            nextReviewDate: nextDate.toISOString(),
            lastRating: rating
          }
        : c
    );

    onUpdateFlashcards(updated);
    setIsFlipped(false);

    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      SoundEffects.playSuccess();
      setCurrentCardIndex(0);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-62px)] bg-[#03060B] text-[#E8F6FA] p-4 sm:p-8 overflow-y-auto">
      {/* Background Spiraling Whirlpool Atmosphere */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_40%,#5CC8FF_0%,#0A2A33_50%,transparent_80%)]" />

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#5CC8FF] mb-1">
              <Activity className="w-4 h-4 animate-spin" style={{ animationDuration: '10s' }} />
              <span>SPACED REPETITION · TIDAL MEMORY VORTEX</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#E8F6FA]">
              Tidal Memory Vortex
            </h1>
            <p className="text-xs text-[#8FA7B3]">
              Revisit neural fundamentals and reinforce long-term memory through spiraling spaced repetition cycles.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 submersible-glass p-1 rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => { setMode('flashcards'); SoundEffects.playClick(); }}
              className={`px-3 py-1 rounded-lg capitalize transition-all ${
                mode === 'flashcards' ? 'bg-[#5CC8FF] text-[#03060B] font-bold' : 'text-[#8FA7B3] hover:text-white'
              }`}
            >
              Flashcards
            </button>
            <button
              onClick={() => { setMode('whirlpool'); SoundEffects.playClick(); }}
              className={`px-3 py-1 rounded-lg capitalize transition-all ${
                mode === 'whirlpool' ? 'bg-[#5CC8FF] text-[#03060B] font-bold' : 'text-[#8FA7B3] hover:text-white'
              }`}
            >
              Whirlpool Timeline
            </button>
            <button
              onClick={() => { setMode('weak-topics'); SoundEffects.playClick(); }}
              className={`px-3 py-1 rounded-lg capitalize transition-all ${
                mode === 'weak-topics' ? 'bg-[#5CC8FF] text-[#03060B] font-bold' : 'text-[#8FA7B3] hover:text-white'
              }`}
            >
              Weak Sectors
            </button>
          </div>
        </div>

        {/* Tab 1: Spaced Repetition Flashcards */}
        {mode === 'flashcards' && currentCard && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-mono text-[#8FA7B3]">
              <span>CARD {currentCardIndex + 1} OF {flashcards.length}</span>
              <span>Next Review Interval: {currentCard.intervalDays} Days</span>
            </div>

            {/* Flip Card Container */}
            <div
              onClick={() => { setIsFlipped(!isFlipped); SoundEffects.playClick(); }}
              className="submersible-glass p-8 sm:p-12 rounded-3xl border border-[#5CC8FF]/35 shadow-2xl min-h-[300px] flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-xs font-mono text-[#5CC8FF]">
                <span className="uppercase">{isFlipped ? 'REVERSE · DEFINITION & CONTEXT' : 'OBVERSE · SYNAPTIC CONCEPT'}</span>
                <span className="text-[#8FA7B3]">[CLICK ANYWHERE TO FLIP]</span>
              </div>

              <div className="my-auto text-center space-y-4 py-6">
                {!isFlipped ? (
                  <>
                    <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#E8F6FA]">
                      {currentCard.concept}
                    </h3>
                    <p className="text-xs font-mono text-[#8FA7B3]">
                      What is the mathematical formulation and intuitive role of this mechanism?
                    </p>
                  </>
                ) : (
                  <>
                    <div className="font-mono text-xl sm:text-2xl text-[#3FF2E6] font-bold tracking-wide">
                      {currentCard.definition}
                    </div>
                    <p className="text-xs text-[#E8F6FA]/90 max-w-lg mx-auto leading-relaxed pt-2">
                      {currentCard.contextExample}
                    </p>
                  </>
                )}
              </div>

              <div className="text-[11px] text-center font-mono text-[#8FA7B3]">
                Repetitions: {currentCard.repetitions} · Ease Factor: {currentCard.easeFactor.toFixed(2)}
              </div>
            </div>

            {/* Rating Buttons (Spaced Repetition Feedback) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <button
                onClick={() => handleRate('again')}
                className="py-3 px-4 rounded-xl border border-[#FF6B9A]/40 bg-[#071426] hover:bg-[#FF6B9A]/20 text-[#FF6B9A] text-xs font-mono font-bold transition-all"
              >
                Again (1 Day)
              </button>
              <button
                onClick={() => handleRate('hard')}
                className="py-3 px-4 rounded-xl border border-[#5CC8FF]/40 bg-[#071426] hover:bg-[#5CC8FF]/20 text-[#5CC8FF] text-xs font-mono font-bold transition-all"
              >
                Hard ({Math.max(1, Math.round(currentCard.intervalDays * 1.2))} Days)
              </button>
              <button
                onClick={() => handleRate('good')}
                className="py-3 px-4 rounded-xl border border-[#7CFFB2]/40 bg-[#071426] hover:bg-[#7CFFB2]/20 text-[#7CFFB2] text-xs font-mono font-bold transition-all"
              >
                Good ({Math.round(currentCard.intervalDays * currentCard.easeFactor)} Days)
              </button>
              <button
                onClick={() => handleRate('easy')}
                className="py-3 px-4 rounded-xl border border-[#9B7BFF]/40 bg-[#071426] hover:bg-[#9B7BFF]/20 text-[#9B7BFF] text-xs font-mono font-bold transition-all"
              >
                Easy ({Math.round(currentCard.intervalDays * currentCard.easeFactor * 1.3)} Days)
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Whirlpool Timeline */}
        {mode === 'whirlpool' && (
          <div className="submersible-glass p-6 sm:p-8 rounded-3xl border border-[#5CC8FF]/30 space-y-6">
            <h3 className="font-heading font-bold text-lg text-[#E8F6FA]">
              Whirlpool Lesson Descent Timeline
            </h3>
            <p className="text-xs text-[#8FA7B3]">
              Older foundational lessons rest deeper in the spiral vortex, continually reinforced by newer insights.
            </p>

            <div className="space-y-4 relative">
              {course.chapters.map((chap, cIdx) => (
                <div
                  key={chap.id}
                  className="p-4 rounded-2xl bg-[#071426]/70 border border-white/10 hover:border-[#5CC8FF] transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0A2A33] border border-[#5CC8FF]/40 flex items-center justify-center font-mono text-xs text-[#5CC8FF] font-bold">
                      {chap.number}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#E8F6FA]">{chap.title}</div>
                      <div className="text-[11px] text-[#8FA7B3] font-mono">{chap.depthMeters}M Depth · {chap.lessons.length} Missions</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      SoundEffects.playSonarPing();
                      onNavigateLesson(chap.lessons[0].id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#0A2A33] border border-[#3FF2E6]/30 text-xs font-mono text-[#3FF2E6] hover:bg-[#3FF2E6]/20 transition-all flex items-center gap-1.5"
                  >
                    <span>Revisit Reef</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Weak Topics Revisit */}
        {mode === 'weak-topics' && (
          <div className="submersible-glass p-6 sm:p-8 rounded-3xl border border-[#FF6B9A]/30 space-y-4">
            <h3 className="font-heading font-bold text-lg text-[#E8F6FA] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#FF6B9A]" />
              <span>Targeted Weak Sector Recommendations</span>
            </h3>
            <p className="text-xs text-[#8FA7B3]">
              Based on recent dive logs and quiz telemetry, these specific concept areas benefit from immediate reinforcement:
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-[#071426] border border-[#FF6B9A]/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-[#E8F6FA]">Vanishing Gradients in Sigmoid Networks</div>
                  <div className="text-xs text-[#8FA7B3] font-mono">Max derivative: 0.25 at z = 0 · Twilight Zone</div>
                </div>
                <button
                  onClick={() => onNavigateLesson('les-1-2')}
                  className="px-3 py-1 rounded bg-[#FF6B9A]/20 border border-[#FF6B9A]/50 text-xs font-mono text-[#FF6B9A] hover:bg-[#FF6B9A]/40"
                >
                  Review Lesson
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#071426] border border-[#5CC8FF]/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-[#E8F6FA]">Scaled Dot-Product Attention (√d_k Normalization)</div>
                  <div className="text-xs text-[#8FA7B3] font-mono">Softmax variance stabilization · Abyssal Zone</div>
                </div>
                <button
                  onClick={() => onNavigateLesson('les-3-1')}
                  className="px-3 py-1 rounded bg-[#5CC8FF]/20 border border-[#5CC8FF]/50 text-xs font-mono text-[#5CC8FF] hover:bg-[#5CC8FF]/40"
                >
                  Review Lesson
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
