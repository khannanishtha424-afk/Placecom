import React from 'react';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  Lock, 
  Clock, 
  Award, 
  Layers, 
  Radio, 
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { Chapter, Lesson, Topic } from '../../types/course';
import { UserProgress } from '../../types/user';
import { SoundEffects } from '../../services/audio';

interface ReefExplorerViewProps {
  chapter: Chapter;
  progress: UserProgress;
  onBackToOcean: () => void;
  onSelectLesson: (lessonId: string) => void;
}

export const ReefExplorerView: React.FC<ReefExplorerViewProps> = ({
  chapter,
  progress,
  onBackToOcean,
  onSelectLesson
}) => {
  // Compute completion stats for this reef city
  const totalLessons = chapter.lessons.length;
  const completedLessons = chapter.lessons.filter((l) =>
    progress.completedLessonIds.includes(l.id)
  ).length;
  const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="relative min-h-[calc(100vh-62px)] bg-[#03060B] text-[#E8F6FA] p-4 sm:p-8 overflow-y-auto">
      {/* Background Depth Ambient Gradient */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: `radial-gradient(circle at 75% 20%, ${chapter.accentColor} 0%, transparent 60%)`
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => { SoundEffects.playClick(); onBackToOcean(); }}
            className="flex items-center gap-2 text-xs font-mono text-[#8FA7B3] hover:text-[#3FF2E6] transition-all px-3 py-1.5 rounded-lg border border-[#3FF2E6]/20 bg-[#071426]/60"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO OCEAN MAP</span>
          </button>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
              style={{
                backgroundColor: `${chapter.accentColor}20`,
                color: chapter.accentColor,
                border: `1px solid ${chapter.accentColor}50`
              }}
            >
              {chapter.depthZone} Zone · {chapter.depthMeters}M
            </span>
            <span className="text-[#8FA7B3]">{chapter.difficulty}</span>
          </div>
        </div>

        {/* Reef City Hero Overview Header */}
        <div className="submersible-glass p-6 sm:p-8 rounded-3xl border border-[#3FF2E6]/30 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 font-mono text-xs text-[#3FF2E6]">
                <Layers className="w-4 h-4" />
                <span>REEF EXPEDITION CHAPTER {chapter.number}</span>
              </div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#E8F6FA]">
                {chapter.reefName}
              </h1>
              <h2 className="text-base text-[#5CC8FF] font-medium">
                {chapter.title}
              </h2>
              <p className="text-xs text-[#8FA7B3] leading-relaxed pt-1">
                {chapter.summary}
              </p>
            </div>

            {/* Quick Stats Pill & Big DIVE IN Action */}
            <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
              <div className="submersible-glass px-5 py-3 rounded-2xl border border-white/10 text-center">
                <div className="font-mono text-2xl font-bold text-[#3FF2E6]">
                  {completionPercentage}%
                </div>
                <div className="text-[10px] font-mono text-[#8FA7B3] uppercase">
                  Reef Mastery
                </div>
              </div>

              {chapter.lessons.length > 0 && (
                <button
                  onClick={() => {
                    const firstIncomplete = chapter.lessons.find((l) => !progress.completedLessonIds.includes(l.id)) || chapter.lessons[0];
                    SoundEffects.playSonarPing();
                    onSelectLesson(firstIncomplete.id);
                  }}
                  className="py-4 px-6 rounded-2xl font-heading font-bold text-sm tracking-wide bg-gradient-to-r from-[#3FF2E6] to-[#5CC8FF] text-[#03060B] shadow-[0_0_25px_rgba(63,242,230,0.4)] hover:shadow-[0_0_35px_rgba(63,242,230,0.7)] flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <span>DIVE IN</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Subtopic / Coral Pods Bar */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap gap-2 items-center">
            <span className="text-[11px] font-mono text-[#8FA7B3] mr-2">SUBTOPIC PODS:</span>
            {chapter.topics.map((t) => {
              const isMastered = t.isMastered || false;
              return (
                <div
                  key={t.id}
                  className={`px-3 py-1 rounded-full text-xs font-mono flex items-center gap-1.5 border transition-all ${
                    isMastered
                      ? 'bg-[#7CFFB2]/15 border-[#7CFFB2]/40 text-[#7CFFB2]'
                      : 'bg-[#071426] border-white/15 text-[#E8F6FA]'
                  }`}
                >
                  {isMastered ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-[#3FF2E6]" />}
                  <span>{t.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dive Missions Chamber Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-lg text-[#E8F6FA] flex items-center gap-2">
              <Radio className="w-5 h-5 text-[#3FF2E6]" />
              <span>Available Dive Missions in this Reef</span>
            </h3>
            <span className="font-mono text-xs text-[#8FA7B3]">
              {completedLessons} / {totalLessons} Missions Completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chapter.lessons.map((lesson, idx) => {
              const isCompleted = progress.completedLessonIds.includes(lesson.id);
              const score = progress.quizScores[lesson.id];

              return (
                <div
                  key={lesson.id}
                  onClick={() => {
                    SoundEffects.playSonarPing();
                    onSelectLesson(lesson.id);
                  }}
                  className={`submersible-glass p-5 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.01] ${
                    isCompleted
                      ? 'border-[#7CFFB2]/30 hover:border-[#7CFFB2]'
                      : 'border-[#3FF2E6]/25 hover:border-[#3FF2E6]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 font-mono text-xs text-[#3FF2E6]">
                      <span className="px-2 py-0.5 rounded bg-[#0A2A33] border border-[#3FF2E6]/30">
                        MISSION {chapter.number}.{idx + 1}
                      </span>
                      <span>{lesson.depthMeters}M</span>
                    </div>

                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-xs font-mono text-[#7CFFB2] font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        Mastered ({score || 100}%)
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-[#3FF2E6] flex items-center gap-1 group-hover:underline">
                        <span>Launch Dive</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <h4 className="font-heading font-bold text-base text-[#E8F6FA] mb-1 group-hover:text-[#3FF2E6] transition-colors">
                    {lesson.title}
                  </h4>
                  <p className="text-xs text-[#8FA7B3] line-clamp-2 mb-4 leading-relaxed">
                    {lesson.objective}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs font-mono text-[#8FA7B3]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{lesson.durationMin} MINS</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#3FF2E6]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>+{lesson.xpReward} XP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chapter Project Assignment Card if present */}
        {chapter.assignment && (
          <div className="submersible-glass p-6 rounded-2xl border border-[#9B7BFF]/30 mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-[#9B7BFF] font-bold">
                REEF CAPSTONE PROJECT ASSIGNMENT
              </span>
              <span className="text-xs font-mono text-[#7CFFB2]">
                +{chapter.assignment.xpReward} XP REWARD
              </span>
            </div>
            <h4 className="font-bold text-base text-[#E8F6FA] mb-2">
              {chapter.assignment.title}
            </h4>
            <p className="text-xs text-[#8FA7B3] mb-4 leading-relaxed">
              {chapter.assignment.brief}
            </p>
            <div className="flex items-center justify-between text-xs font-mono text-[#8FA7B3]">
              <span>Deliverable: {chapter.assignment.deliverable}</span>
              <span className="text-[#FF6B9A]">Due: {chapter.assignment.deadline}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
