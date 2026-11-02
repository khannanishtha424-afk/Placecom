import React, { useState } from 'react';
import { Layers, CheckCircle, Lock, Play, ArrowRight, Sparkles, Compass, ShieldAlert } from 'lucide-react';
import { Course, Topic } from '../../types/course';
import { UserProgress } from '../../types/user';
import { SoundEffects } from '../../services/audio';

interface CoralKnowledgeReefViewProps {
  course: Course;
  progress: UserProgress;
  onNavigateLesson: (lessonId: string) => void;
}

export const CoralKnowledgeReefView: React.FC<CoralKnowledgeReefViewProps> = ({
  course,
  progress,
  onNavigateLesson
}) => {
  const [selectedTopic, setSelectedTopic] = useState<{ topic: Topic; chapterNum: number; lessonId: string } | null>(null);

  // Flatten all topics with their corresponding chapter and lesson
  const allTopicNodes = course.chapters.flatMap((chap) =>
    chap.topics.map((t, idx) => ({
      topic: t,
      chapter: chap,
      lesson: chap.lessons[idx] || chap.lessons[0]
    }))
  );

  return (
    <div className="relative min-h-[calc(100vh-62px)] bg-[#03060B] text-[#E8F6FA] p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#3FF2E6] mb-1">
              <Layers className="w-4 h-4 animate-pulse" />
              <span>SYNAPTIC CORAL MORPHOLOGY · KNOWLEDGE SKILL TREE</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#E8F6FA]">
              Coral Knowledge Reef
            </h1>
            <p className="text-xs text-[#8FA7B3]">
              A branching bioluminescent polyp network. Light flows along branches from mastered concepts toward newly unlocked neural frontiers.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#7CFFB2] shadow-[0_0_6px_#7CFFB2]" />
              <span className="text-[#7CFFB2]">Mastered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#3FF2E6] shadow-[0_0_6px_#3FF2E6]" />
              <span className="text-[#3FF2E6]">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#8FA7B3]/40" />
              <span className="text-[#8FA7B3]">Locked Depth</span>
            </div>
          </div>
        </div>

        {/* Interactive Branching Coral Canvas & Node Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Visual Coral Polyps Grid */}
          <div className="lg:col-span-2 submersible-glass p-6 rounded-3xl border border-[#3FF2E6]/25 min-h-[480px] relative overflow-hidden">
            {/* Background Coral Branch Tendrils (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <path
                d="M 120 80 Q 240 180 360 140 T 600 240"
                fill="none"
                stroke="#3FF2E6"
                strokeWidth="2.5"
                strokeDasharray="6 8"
                className="animate-pulse"
              />
              <path
                d="M 240 180 Q 340 320 480 340 T 700 400"
                fill="none"
                stroke="#5CC8FF"
                strokeWidth="2"
                strokeDasharray="4 6"
              />
            </svg>

            {/* Depth Zone Groupings */}
            <div className="space-y-8 relative z-10">
              {course.chapters.map((chap, cIdx) => (
                <div key={chap.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                      style={{ backgroundColor: `${chap.accentColor}20`, color: chap.accentColor, border: `1px solid ${chap.accentColor}40` }}
                    >
                      {chap.depthZone} ({chap.depthMeters}M)
                    </span>
                    <span className="font-heading font-semibold text-xs text-[#E8F6FA]">
                      CH {chap.number}: {chap.reefName}
                    </span>
                  </div>

                  {/* Polyps in this Chapter */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {chap.topics.map((t, tIdx) => {
                      const isMastered = t.isMastered || false;
                      const isUnlocked = t.isUnlocked || isMastered;
                      const isSelected = selectedTopic?.topic.id === t.id;
                      const correspondingLesson = chap.lessons[tIdx] || chap.lessons[0];

                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            SoundEffects.playClick();
                            setSelectedTopic({
                              topic: t,
                              chapterNum: chap.number,
                              lessonId: correspondingLesson.id
                            });
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                            isSelected
                              ? 'bg-[#0A2A33] border-[#3FF2E6] shadow-[0_0_15px_rgba(63,242,230,0.3)]'
                              : isMastered
                              ? 'bg-[#071426]/80 border-[#7CFFB2]/40 hover:border-[#7CFFB2]'
                              : isUnlocked
                              ? 'bg-[#071426]/80 border-[#3FF2E6]/30 hover:border-[#3FF2E6]'
                              : 'bg-[#03060B]/80 border-white/10 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-[10px] text-[#8FA7B3]">
                              POLYP {chap.number}.{tIdx + 1}
                            </span>
                            {isMastered ? (
                              <CheckCircle className="w-4 h-4 text-[#7CFFB2]" />
                            ) : isUnlocked ? (
                              <div className="w-2.5 h-2.5 rounded-full bg-[#3FF2E6] animate-pulse" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-[#8FA7B3]" />
                            )}
                          </div>

                          <h4 className="font-heading font-bold text-xs text-[#E8F6FA] line-clamp-1 mb-1">
                            {t.title}
                          </h4>
                          <p className="text-[11px] text-[#8FA7B3] line-clamp-2">
                            {t.summary}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inspector Panel for Selected Polyp */}
          <div className="submersible-glass p-6 rounded-3xl border border-[#3FF2E6]/30 space-y-4">
            {selectedTopic ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-mono text-[#3FF2E6]">
                  <span>POLYP INSPECTOR</span>
                  <span className="text-[#8FA7B3]">CH {selectedTopic.chapterNum}</span>
                </div>

                <h3 className="font-heading font-bold text-lg text-[#E8F6FA]">
                  {selectedTopic.topic.title}
                </h3>

                <p className="text-xs text-[#8FA7B3] leading-relaxed">
                  {selectedTopic.topic.summary}
                </p>

                <div className="p-3.5 rounded-xl bg-[#03060B] border border-white/10 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#8FA7B3]">Prerequisites:</span>
                    <span className="text-[#3FF2E6]">
                      {selectedTopic.topic.prerequisites.length > 0 ? selectedTopic.topic.prerequisites.join(', ') : 'None (Foundational)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8FA7B3]">Mastery State:</span>
                    <span className={selectedTopic.topic.isMastered ? 'text-[#7CFFB2] font-semibold' : 'text-[#5CC8FF]'}>
                      {selectedTopic.topic.isMastered ? 'Mastered (Polyp Illuminated)' : 'Ready for Dive Verification'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    SoundEffects.playSonarPing();
                    onNavigateLesson(selectedTopic.lessonId);
                  }}
                  className="w-full py-3 px-4 rounded-xl font-heading font-bold text-xs bg-gradient-to-r from-[#3FF2E6] to-[#5CC8FF] text-[#03060B] shadow-[0_0_15px_rgba(63,242,230,0.4)] hover:shadow-[0_0_25px_rgba(63,242,230,0.7)] flex items-center justify-center gap-2 transition-all"
                >
                  <span>Launch Connected Dive Mission</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center py-16 space-y-3 text-[#8FA7B3]">
                <Compass className="w-8 h-8 mx-auto text-[#3FF2E6] animate-pulse" />
                <h4 className="font-bold text-sm text-[#E8F6FA]">Select a Coral Polyp Node</h4>
                <p className="text-xs max-w-xs mx-auto">
                  Click on any concept in the skill tree above to inspect its prerequisites, dependencies, and jump into the corresponding lesson.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
