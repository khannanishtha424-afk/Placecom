import React from 'react';
import { 
  Play, 
  Flame, 
  Sparkles, 
  Target, 
  Layers, 
  Radio, 
  ArrowRight, 
  Compass, 
  Maximize2, 
  ShieldAlert, 
  Zap,
  Activity,
  Award
} from 'lucide-react';
import { Course, Chapter, Lesson } from '../../types/course';
import { UserProfile, UserProgress } from '../../types/user';
import { OceanCanvas } from '../ocean3d/OceanCanvas';
import { Ocean2DFallback } from '../ocean3d/Ocean2DFallback';
import { SonarMinimap } from '../common/SonarMinimap';
import { SoundEffects } from '../../services/audio';

interface BridgeViewProps {
  course: Course;
  profile: UserProfile;
  progress: UserProgress;
  onSelectChapter: (chapter: Chapter) => void;
  onStartLesson: (lessonId: string) => void;
  onOpenMissions: () => void;
  onOpenSkillTree: () => void;
  onOpenExam: () => void;
  motionIntensity: 'off' | 'calm' | 'full';
  use2DFallback: boolean;
}

export const BridgeView: React.FC<BridgeViewProps> = ({
  course,
  profile,
  progress,
  onSelectChapter,
  onStartLesson,
  onOpenMissions,
  onOpenSkillTree,
  onOpenExam,
  motionIntensity,
  use2DFallback
}) => {
  // Find current next recommended lesson
  const allLessons: Lesson[] = course.chapters.flatMap((c) => c.lessons);
  const nextLesson = allLessons.find((l) => !progress.completedLessonIds.includes(l.id)) || allLessons[0];
  const nextChapter = course.chapters.find((c) => c.id === nextLesson?.chapterId) || course.chapters[0];

  return (
    <div className="relative w-full h-[calc(100vh-62px)] overflow-hidden bg-[#03060B]">
      {/* 3D Interactive Ocean Canvas or 2D Fallback */}
      <div className="absolute inset-0 z-0">
        {use2DFallback ? (
          <Ocean2DFallback
            chapters={course.chapters}
            selectedChapterId={null}
            onSelectChapter={(chap) => chap && onSelectChapter(chap)}
            motionIntensity={motionIntensity}
            completedLessonIds={progress.completedLessonIds}
          />
        ) : (
          <OceanCanvas
            chapters={course.chapters}
            selectedChapterId={null}
            onSelectChapter={(chap) => chap && onSelectChapter(chap)}
            motionIntensity={motionIntensity}
            completedLessonIds={progress.completedLessonIds}
          />
        )}
      </div>

      {/* Submersible Bridge Cockpit HUD Glass Overlays */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-6">
        {/* Top HUD: Current Ocean Sector & Course Telemetry */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="pointer-events-auto submersible-glass px-4 py-3 rounded-2xl max-w-md border border-[#3FF2E6]/25 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[#3FF2E6] mb-1">
              <Compass className="w-4 h-4 animate-pulse" />
              <span>COMMAND BRIDGE · SECTOR TELEMETRY</span>
            </div>
            <h2 className="font-heading font-bold text-base text-[#E8F6FA] line-clamp-1">
              {course.title}
            </h2>
            <div className="flex items-center gap-3 text-[11px] font-mono text-[#8FA7B3] mt-1.5">
              <span>Instructor: {course.instructor}</span>
              <span>•</span>
              <span className="text-[#3FF2E6] font-semibold">{course.chapters.length} Reef Cities</span>
            </div>
          </div>

          {/* Sonar Minimap in Cockpit */}
          <div className="pointer-events-auto hidden md:block">
            <SonarMinimap
              chapters={course.chapters}
              selectedChapterId={null}
              onSelectChapter={onSelectChapter}
              currentDepth={profile.currentDepthMeters}
            />
          </div>
        </div>

        {/* Center Prompt Guidance */}
        <div className="self-center text-center pointer-events-none">
          <div className="submersible-glass px-4 py-1.5 rounded-full border border-[#3FF2E6]/30 text-xs font-mono text-[#3FF2E6] tracking-wider animate-pulse">
            INTERACTIVE 3D OCEAN ACTIVE · CLICK ANY REEF CITY TO DIVE IN
          </div>
        </div>

        {/* Bottom Cockpit Dock: Continue Learning, Daily Challenge, & Reef Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pointer-events-auto items-end">
          {/* 1. Continue Dive Card (Recommended Next) */}
          <div className="submersible-glass p-4 rounded-2xl border border-[#3FF2E6]/40 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#3FF2E6]/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-[11px] font-mono text-[#3FF2E6] mb-2">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                RECOMMENDED EXPEDITION
              </span>
              <span className="text-[#8FA7B3]">{nextLesson.depthMeters}M DEPTH</span>
            </div>
            <h3 className="font-bold text-sm text-[#E8F6FA] line-clamp-1 mb-1">
              {nextLesson.title}
            </h3>
            <p className="text-xs text-[#8FA7B3] line-clamp-2 mb-3">
              {nextLesson.objective}
            </p>
            <button
              onClick={() => {
                SoundEffects.playSonarPing();
                onStartLesson(nextLesson.id);
              }}
              className="w-full py-2.5 px-4 rounded-xl font-heading font-bold text-xs bg-gradient-to-r from-[#3FF2E6] to-[#5CC8FF] text-[#03060B] shadow-[0_0_15px_rgba(63,242,230,0.4)] hover:shadow-[0_0_25px_rgba(63,242,230,0.7)] flex items-center justify-center gap-2 transition-all"
            >
              <span>CONTINUE DIVE MISSION</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2. Daily Dive Challenge */}
          <div className="submersible-glass p-4 rounded-2xl border border-[#FF6B9A]/30 shadow-2xl">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#FF6B9A] mb-2">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                DAILY KNOWLEDGE DIVE
              </span>
              <span className="text-[#7CFFB2]">+100 XP</span>
            </div>
            <h4 className="font-bold text-sm text-[#E8F6FA] mb-1">
              Vanishing Gradient Probe
            </h4>
            <p className="text-xs text-[#8FA7B3] mb-3">
              Solve today's 3-minute acoustic telemetry challenge on activation function saturation.
            </p>
            <button
              onClick={() => {
                SoundEffects.playClick();
                onOpenMissions();
              }}
              className="w-full py-2 px-3 rounded-xl border border-[#FF6B9A]/40 text-[#FF6B9A] hover:bg-[#FF6B9A]/15 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <span>ACCEPT DIVE CHALLENGE</span>
            </button>
          </div>

          {/* 3. Expedition Quick Switcher */}
          <div className="submersible-glass p-4 rounded-2xl border border-[#9B7BFF]/30 shadow-2xl space-y-2">
            <div className="text-[11px] font-mono text-[#9B7BFF] mb-2 flex items-center justify-between">
              <span>EXPLORER CONSOLES</span>
              <span className="text-xs">LEVEL {profile.level}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { SoundEffects.playClick(); onOpenSkillTree(); }}
                className="p-2 rounded-xl bg-[#071426] border border-[#3FF2E6]/25 hover:border-[#3FF2E6] text-left transition-all"
              >
                <div className="text-xs font-bold text-[#E8F6FA] flex items-center gap-1">
                  <Layers className="w-3 h-3 text-[#3FF2E6]" />
                  <span>Coral Reef</span>
                </div>
                <div className="text-[10px] text-[#8FA7B3] font-mono">Skill Tree Map</div>
              </button>

              <button
                onClick={() => { SoundEffects.playSonarPing(); onOpenExam(); }}
                className="p-2 rounded-xl bg-[#071426] border border-[#FF6B9A]/25 hover:border-[#FF6B9A] text-left transition-all"
              >
                <div className="text-xs font-bold text-[#FF6B9A] flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>Leviathan</span>
                </div>
                <div className="text-[10px] text-[#8FA7B3] font-mono">Abyssal Exam</div>
              </button>
            </div>
            <div className="text-[10px] text-center font-mono text-[#8FA7B3] pt-1">
              Active Streak: {profile.streakDays} Days · {progress.completedLessonIds.length} Missions Mastered
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
