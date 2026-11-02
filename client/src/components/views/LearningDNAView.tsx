import React from 'react';
import { 
  FileCode, 
  Clock, 
  Award, 
  CheckCircle, 
  TrendingUp, 
  Flame, 
  Compass, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  Brain
} from 'lucide-react';
import { UserProfile, UserProgress } from '../../types/user';
import { Course } from '../../types/course';
import { SoundEffects } from '../../services/audio';

interface LearningDNAViewProps {
  profile: UserProfile;
  progress: UserProgress;
  course: Course;
  onNavigateLesson: (lessonId: string) => void;
}

export const LearningDNAView: React.FC<LearningDNAViewProps> = ({
  profile,
  progress,
  course,
  onNavigateLesson
}) => {
  const allLessons = course.chapters.flatMap((c) => c.lessons);
  const totalLessonsCount = allLessons.length;
  const completedCount = progress.completedLessonIds.length;
  const completionPercentage = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

  // Compute average quiz accuracy
  const scores = Object.values(progress.quizScores);
  const avgQuizScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  // Estimate total dive time
  const totalMinutes = progress.completedLessonIds.reduce((acc, id) => {
    const les = allLessons.find((l) => l.id === id);
    return acc + (les ? les.durationMin : 25);
  }, 0);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;

  // Next recommendation calculation
  const nextLesson = allLessons.find((l) => !progress.completedLessonIds.includes(l.id)) || allLessons[0];
  const nextChapter = course.chapters.find((c) => c.id === nextLesson?.chapterId) || course.chapters[0];

  return (
    <div className="relative min-h-[calc(100vh-62px)] bg-[#03060B] text-[#E8F6FA] p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#3FF2E6] mb-1">
              <FileCode className="w-4 h-4 animate-pulse" />
              <span>EXPLORER TELEMETRY & DIVE LOG · LEARNING DNA</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#E8F6FA]">
              Learning DNA Log
            </h1>
            <p className="text-xs text-[#8FA7B3]">
              Personal explorer analytics derived from actual dive log telemetry, depth milestones, and synaptic accuracy.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="px-3 py-1 rounded-full bg-[#071426] border border-[#3FF2E6]/30 text-[#3FF2E6]">
              Explorer: {profile.name} ({profile.callsign})
            </span>
          </div>
        </div>

        {/* Hero Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="submersible-glass p-5 rounded-2xl border border-[#3FF2E6]/25 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-[#8FA7B3]">
              <span>TOTAL DIVE TIME</span>
              <Clock className="w-4 h-4 text-[#3FF2E6]" />
            </div>
            <div className="font-mono text-2xl font-bold text-[#E8F6FA]">
              {hours}h {remainingMins}m
            </div>
            <div className="text-[10px] text-[#3FF2E6] font-mono">
              Across {progress.completedLessonIds.length} Missions
            </div>
          </div>

          <div className="submersible-glass p-5 rounded-2xl border border-[#5CC8FF]/25 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-[#8FA7B3]">
              <span>QUIZ ACCURACY</span>
              <Award className="w-4 h-4 text-[#5CC8FF]" />
            </div>
            <div className="font-mono text-2xl font-bold text-[#E8F6FA]">
              {avgQuizScore}%
            </div>
            <div className="text-[10px] text-[#5CC8FF] font-mono">
              Passing threshold: 70%
            </div>
          </div>

          <div className="submersible-glass p-5 rounded-2xl border border-[#9B7BFF]/25 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-[#8FA7B3]">
              <span>DEEPEST DEPTH</span>
              <Compass className="w-4 h-4 text-[#9B7BFF]" />
            </div>
            <div className="font-mono text-2xl font-bold text-[#E8F6FA]">
              {profile.currentDepthMeters}M
            </div>
            <div className="text-[10px] text-[#9B7BFF] font-mono uppercase">
              {profile.deepestZone} Zone
            </div>
          </div>

          <div className="submersible-glass p-5 rounded-2xl border border-[#FF6B9A]/25 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-[#8FA7B3]">
              <span>ACTIVE STREAK</span>
              <Flame className="w-4 h-4 text-[#FF6B9A]" />
            </div>
            <div className="font-mono text-2xl font-bold text-[#E8F6FA]">
              {profile.streakDays} Days
            </div>
            <div className="text-[10px] text-[#FF6B9A] font-mono">
              Next milestone: 7 Days
            </div>
          </div>
        </div>

        {/* Personalized Next Expedition Recommendation with Rationale */}
        <div className="submersible-glass p-6 sm:p-8 rounded-3xl border border-[#3FF2E6]/40 shadow-xl bg-gradient-to-r from-[#071426] to-[#0A2A33]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 font-mono text-xs text-[#3FF2E6]">
                <Brain className="w-4 h-4" />
                <span>AI TELEMETRY RECOMMENDATION · WHY THIS MISSION</span>
              </div>
              <h3 className="font-heading font-extrabold text-xl text-[#E8F6FA]">
                Next Dive: {nextLesson.title} ({nextLesson.depthMeters}M)
              </h3>
              <p className="text-xs text-[#8FA7B3] leading-relaxed">
                <strong>Algorithmic Rationale:</strong> You have fully calibrated the mathematical neuron foundation. To navigate the Midnight Ridge without diverging, you must understand non-linear activations and gradient trajectories.
              </p>
            </div>

            <button
              onClick={() => { SoundEffects.playSonarPing(); onNavigateLesson(nextLesson.id); }}
              className="py-3 px-6 rounded-xl font-heading font-bold text-xs bg-gradient-to-r from-[#3FF2E6] to-[#5CC8FF] text-[#03060B] shadow-[0_0_20px_rgba(63,242,230,0.5)] hover:shadow-[0_0_30px_rgba(63,242,230,0.8)] flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span>Launch Recommended Dive</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Strongest vs Weakest Concepts & Dive History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strongest & Developing Sectors */}
          <div className="submersible-glass p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="font-heading font-bold text-base text-[#E8F6FA]">
              Sector Competencies & Mastery Radar
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-[#7CFFB2]">Artificial Neuron Dot Products</span>
                  <span className="text-[#E8F6FA]">100% Mastery</span>
                </div>
                <div className="w-full bg-[#03060B] h-2 rounded-full overflow-hidden border border-white/10">
                  <div className="bg-[#7CFFB2] h-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-[#3FF2E6]">Activation Function Derivatives</span>
                  <span className="text-[#E8F6FA]">85% Mastery</span>
                </div>
                <div className="w-full bg-[#03060B] h-2 rounded-full overflow-hidden border border-white/10">
                  <div className="bg-[#3FF2E6] h-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-[#5CC8FF]">Gradient Descent & Loss Ravines</span>
                  <span className="text-[#E8F6FA]">70% Developing</span>
                </div>
                <div className="w-full bg-[#03060B] h-2 rounded-full overflow-hidden border border-white/10">
                  <div className="bg-[#5CC8FF] h-full" style={{ width: '70%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-[#9B7BFF]">Transformer Multi-Head Attention</span>
                  <span className="text-[#E8F6FA]">In Progress</span>
                </div>
                <div className="w-full bg-[#03060B] h-2 rounded-full overflow-hidden border border-white/10">
                  <div className="bg-[#9B7BFF] h-full" style={{ width: '45%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Actual Logged Dive History */}
          <div className="submersible-glass p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="font-heading font-bold text-base text-[#E8F6FA]">
              Submersible Log Activity Entries
            </h3>

            <div className="space-y-2.5">
              {progress.diveHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#071426] border border-white/10 flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <div className="text-[#E8F6FA] font-medium">{item.activity}</div>
                    <div className="text-[10px] text-[#8FA7B3]">{item.date} · {item.depthMeters}M Depth</div>
                  </div>
                  <span className="text-[#7CFFB2] font-semibold">+{item.xpEarned} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
