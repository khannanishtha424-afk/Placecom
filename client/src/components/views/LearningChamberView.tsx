import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Bookmark, 
  FileText, 
  Play, 
  HelpCircle, 
  Sparkles, 
  Sliders, 
  Send, 
  RotateCcw,
  BookOpen,
  Eye,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lesson, Course } from '../../types/course';
import { UserProgress } from '../../types/user';
import { InteractiveSimulation } from './InteractiveSimulations';
import { SoundEffects } from '../../services/audio';

interface LearningChamberViewProps {
  lesson: Lesson;
  course: Course;
  progress: UserProgress;
  onBackToReef: () => void;
  onCompleteLesson: (lessonId: string, score: number) => void;
  onNextLesson?: (nextLessonId: string) => void;
  onSaveNote: (lessonId: string, note: string) => void;
  onToggleBookmark: (lessonId: string) => void;
  focusDiveMode: boolean;
}

export const LearningChamberView: React.FC<LearningChamberViewProps> = ({
  lesson,
  course,
  progress,
  onBackToReef,
  onCompleteLesson,
  onNextLesson,
  onSaveNote,
  onToggleBookmark,
  focusDiveMode
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'sandbox' | 'quiz'>('content');
  const [studentNote, setStudentNote] = useState<string>(progress.notes[lesson.id] || '');
  const [noteSaved, setNoteSaved] = useState(false);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState<Record<string, boolean>>({});

  const isBookmarked = progress.bookmarks.includes(lesson.id);
  const isCompleted = progress.completedLessonIds.includes(lesson.id);

  // Calculate next lesson
  const allLessons = course.chapters.flatMap((c) => c.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleSaveNote = () => {
    onSaveNote(lesson.id, studentNote);
    SoundEffects.playClick();
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (showQuizResults) return;
    SoundEffects.playClick();
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = () => {
    if (!lesson.quiz || lesson.quiz.questions.length === 0) return;
    SoundEffects.playSonarPing();

    let correctCount = 0;
    lesson.quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / lesson.quiz.questions.length) * 100);
    setShowQuizResults(true);

    if (score >= lesson.quiz.passingScore) {
      SoundEffects.playSuccess();
      // Bioluminescent celebration confetti bloom
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#3FF2E6', '#5CC8FF', '#9B7BFF', '#7CFFB2']
      });
      onCompleteLesson(lesson.id, score);
    }
  };

  return (
    <div className={`relative min-h-[calc(100vh-62px)] text-[#E8F6FA] p-4 sm:p-8 overflow-y-auto ${focusDiveMode ? 'focus-dive-mode' : 'bg-[#03060B]'}`}>
      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        {/* Top Navigation & Status Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => { SoundEffects.playClick(); onBackToReef(); }}
            className="flex items-center gap-2 text-xs font-mono text-[#8FA7B3] hover:text-[#3FF2E6] transition-all px-3 py-1.5 rounded-lg border border-[#3FF2E6]/20 bg-[#071426]/60"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO REEF CITY</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                SoundEffects.playClick();
                onToggleBookmark(lesson.id);
              }}
              className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border transition-all ${
                isBookmarked
                  ? 'bg-[#FF6B9A]/20 border-[#FF6B9A] text-[#FF6B9A]'
                  : 'bg-[#071426] border-white/10 text-[#8FA7B3] hover:text-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>{isBookmarked ? 'Bookmarked' : 'Bookmark Dive'}</span>
            </button>

            <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-[#0A2A33] border border-[#3FF2E6]/30 text-[#3FF2E6]">
              Depth: {lesson.depthMeters}M
            </span>
          </div>
        </div>

        {/* Mission Briefing Header */}
        <div className="submersible-glass p-6 rounded-2xl border border-[#3FF2E6]/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-[#3FF2E6] mb-1">
                {lesson.subtitle}
              </div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#E8F6FA]">
                {lesson.title}
              </h1>
              <p className="text-xs text-[#8FA7B3] mt-2 leading-relaxed">
                <strong className="text-[#3FF2E6]">Mission Objective:</strong> {lesson.objective}
              </p>
            </div>

            {isCompleted && (
              <div className="self-start md:self-center px-4 py-2 rounded-xl bg-[#7CFFB2]/15 border border-[#7CFFB2]/40 text-[#7CFFB2] text-xs font-mono flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Mission Mastered</span>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 mt-6 gap-2">
            <button
              onClick={() => { setActiveTab('content'); SoundEffects.playClick(); }}
              className={`px-4 py-2 text-xs font-mono font-bold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'content'
                  ? 'border-[#3FF2E6] text-[#3FF2E6]'
                  : 'border-transparent text-[#8FA7B3] hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Dive Reading & Video</span>
            </button>

            {lesson.simulationType && (
              <button
                onClick={() => { setActiveTab('sandbox'); SoundEffects.playClick(); }}
                className={`px-4 py-2 text-xs font-mono font-bold border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'sandbox'
                    ? 'border-[#5CC8FF] text-[#5CC8FF]'
                    : 'border-transparent text-[#8FA7B3] hover:text-white'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Interactive Sandbox</span>
              </button>
            )}

            <button
              onClick={() => { setActiveTab('quiz'); SoundEffects.playClick(); }}
              className={`px-4 py-2 text-xs font-mono font-bold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'quiz'
                  ? 'border-[#9B7BFF] text-[#9B7BFF]'
                  : 'border-transparent text-[#8FA7B3] hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Knowledge Check Quiz</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Lesson Reading & Video Content */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Reading Text Column (Min 16px font-size for sustained reading as requested) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Optional Video Resource */}
              {lesson.videoUrl && (
                <div className="submersible-glass rounded-2xl overflow-hidden border border-[#3FF2E6]/25 aspect-video shadow-xl">
                  <iframe
                    src={lesson.videoUrl}
                    title={lesson.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Lesson Text Reader with high readability */}
              <div className="submersible-glass p-6 sm:p-8 rounded-2xl border border-white/10 prose prose-invert max-w-none text-[16px] leading-[1.8] font-sans">
                <div className="whitespace-pre-line text-[#E8F6FA]/90">
                  {lesson.contentMarkdown}
                </div>
              </div>

              {/* Attached Learning Resources */}
              {lesson.resources.length > 0 && (
                <div className="submersible-glass p-5 rounded-2xl border border-white/10 space-y-3">
                  <h4 className="font-heading font-bold text-sm text-[#3FF2E6] flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Scientific Resources & Datasets</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {lesson.resources.map((res) => (
                      <a
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-xl bg-[#071426] border border-[#3FF2E6]/20 hover:border-[#3FF2E6] flex items-center justify-between text-xs transition-all group"
                      >
                        <div>
                          <div className="font-semibold text-[#E8F6FA] group-hover:text-[#3FF2E6]">
                            {res.title}
                          </div>
                          <div className="text-[10px] text-[#8FA7B3] font-mono">{res.meta}</div>
                        </div>
                        <span className="text-[#3FF2E6] text-xs font-mono group-hover:translate-x-0.5 transition-transform">
                          ↗
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar: Explorer Notes & Next Mission Launch */}
            <div className="space-y-6">
              {/* Personal Notes */}
              <div className="submersible-glass p-5 rounded-2xl border border-[#3FF2E6]/25 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-[#3FF2E6]">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    EXPLORER LOG NOTES
                  </span>
                  {noteSaved && <span className="text-[#7CFFB2]">Saved!</span>}
                </div>
                <textarea
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  placeholder="Record your observations, questions, and synaptic insights from this dive..."
                  rows={8}
                  className="w-full bg-[#03060B] border border-white/15 rounded-xl p-3 text-xs text-[#E8F6FA] focus:outline-none focus:border-[#3FF2E6] font-mono resize-none"
                />
                <button
                  onClick={handleSaveNote}
                  className="w-full py-2 rounded-xl bg-[#0A2A33] border border-[#3FF2E6]/40 text-xs font-mono text-[#3FF2E6] hover:bg-[#3FF2E6]/15 transition-all"
                >
                  Save Notes to Dive Log
                </button>
              </div>

              {/* Ready for Challenge Card */}
              <div className="submersible-glass p-5 rounded-2xl border border-[#9B7BFF]/30 space-y-3">
                <h4 className="font-heading font-bold text-sm text-[#E8F6FA] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#9B7BFF]" />
                  <span>Verify Synaptic Mastery</span>
                </h4>
                <p className="text-xs text-[#8FA7B3] leading-relaxed">
                  Test your understanding with the knowledge check quiz to earn +{lesson.xpReward} XP and advance toward deeper ocean zones.
                </p>
                <button
                  onClick={() => { setActiveTab('quiz'); SoundEffects.playSonarPing(); }}
                  className="w-full py-2.5 rounded-xl font-heading font-bold text-xs bg-gradient-to-r from-[#9B7BFF] to-[#3FF2E6] text-[#03060B] shadow-[0_0_15px_rgba(155,123,255,0.4)] hover:shadow-[0_0_20px_rgba(155,123,255,0.7)] transition-all"
                >
                  Take Knowledge Check
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Sandbox Simulation */}
        {activeTab === 'sandbox' && lesson.simulationType && (
          <div className="space-y-4">
            <InteractiveSimulation type={lesson.simulationType} />
            <div className="flex justify-end">
              <button
                onClick={() => { setActiveTab('quiz'); SoundEffects.playClick(); }}
                className="py-2.5 px-5 rounded-xl font-mono text-xs bg-[#0A2A33] border border-[#3FF2E6]/40 text-[#3FF2E6] hover:bg-[#3FF2E6]/20 transition-all flex items-center gap-2"
              >
                <span>Proceed to Quiz Challenge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Knowledge Check Quiz */}
        {activeTab === 'quiz' && (
          <div className="submersible-glass p-6 sm:p-8 rounded-2xl border border-[#9B7BFF]/30 space-y-6">
            <div>
              <h3 className="font-heading font-bold text-xl text-[#E8F6FA] mb-1">
                {lesson.quiz.title}
              </h3>
              <p className="text-xs text-[#8FA7B3]">
                {lesson.quiz.description} · Passing score: {lesson.quiz.passingScore}%
              </p>
            </div>

            {/* Questions Sequence */}
            <div className="space-y-6">
              {lesson.quiz.questions.map((q, qIdx) => {
                const userChoice = selectedAnswers[q.id];
                const isAnswered = userChoice !== undefined;
                const isCorrect = userChoice === q.correctIndex;
                const showHint = hintsRevealed[q.id];

                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl bg-[#071426]/70 border border-white/10 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-mono text-[#3FF2E6]">
                        <span>QUESTION {qIdx + 1} OF {lesson.quiz.questions.length}</span>
                      </div>

                      {q.hint && (
                        <button
                          onClick={() => {
                            setHintsRevealed((prev) => ({ ...prev, [q.id]: !prev[q.id] }));
                            SoundEffects.playClick();
                          }}
                          className="text-[11px] font-mono text-[#8FA7B3] hover:text-[#3FF2E6] flex items-center gap-1"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>{showHint ? 'Hide Hint' : 'Sonar Hint'}</span>
                        </button>
                      )}
                    </div>

                    <h4 className="font-medium text-sm text-[#E8F6FA] leading-relaxed">
                      {q.question}
                    </h4>

                    {/* Sonar Hint display */}
                    {showHint && (
                      <div className="p-3 rounded-xl bg-[#0A2A33] border border-[#3FF2E6]/30 text-xs text-[#3FF2E6] font-mono animate-in fade-in">
                        <strong>Sonar Hint:</strong> {q.hint}
                      </div>
                    )}

                    {/* Options list */}
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = userChoice === oIdx;
                        let optionStyle = 'bg-[#03060B] border-white/15 text-[#E8F6FA] hover:border-[#3FF2E6]/50';

                        if (showQuizResults) {
                          if (oIdx === q.correctIndex) {
                            optionStyle = 'bg-[#7CFFB2]/20 border-[#7CFFB2] text-[#7CFFB2] font-semibold';
                          } else if (isSelected && !isCorrect) {
                            optionStyle = 'bg-[#FF6B9A]/20 border-[#FF6B9A] text-[#FF6B9A]';
                          } else {
                            optionStyle = 'opacity-40 border-transparent';
                          }
                        } else if (isSelected) {
                          optionStyle = 'bg-[#3FF2E6]/20 border-[#3FF2E6] text-[#3FF2E6] font-semibold';
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={showQuizResults}
                            onClick={() => handleSelectOption(q.id, oIdx)}
                            className={`w-full p-3 rounded-xl text-left text-xs font-sans border transition-all flex items-center justify-between ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {showQuizResults && oIdx === q.correctIndex && (
                              <CheckCircle className="w-4 h-4 text-[#7CFFB2]" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation after submit */}
                    {showQuizResults && (
                      <div className={`p-3 rounded-xl text-xs font-mono leading-relaxed border ${isCorrect ? 'bg-[#7CFFB2]/10 border-[#7CFFB2]/30 text-[#7CFFB2]' : 'bg-[#FF6B9A]/10 border-[#FF6B9A]/30 text-[#FF6B9A]'}`}>
                        <strong>{isCorrect ? 'Correct Analysis:' : 'Debrief Analysis:'}</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz Submit / Retake Action */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              {!showQuizResults ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(selectedAnswers).length < lesson.quiz.questions.length}
                  className="w-full sm:w-auto py-3 px-8 rounded-xl font-heading font-bold text-xs bg-gradient-to-r from-[#3FF2E6] to-[#5CC8FF] text-[#03060B] shadow-[0_0_20px_rgba(63,242,230,0.5)] hover:shadow-[0_0_25px_rgba(63,242,230,0.8)] disabled:opacity-40 transition-all"
                >
                  Submit Dive Assessment
                </button>
              ) : (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setShowQuizResults(false);
                      setSelectedAnswers({});
                      SoundEffects.playClick();
                    }}
                    className="py-2.5 px-4 rounded-xl border border-white/20 text-xs font-mono text-[#8FA7B3] hover:text-white flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </button>

                  {nextLesson && (
                    <button
                      onClick={() => onNextLesson && onNextLesson(nextLesson.id)}
                      className="py-2.5 px-6 rounded-xl font-heading font-bold text-xs bg-[#3FF2E6] text-[#03060B] shadow-[0_0_15px_#3FF2E6] hover:scale-[1.02] flex items-center gap-2"
                    >
                      <span>Next Dive Mission</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
