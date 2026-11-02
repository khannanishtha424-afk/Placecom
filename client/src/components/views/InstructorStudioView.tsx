import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Edit3, 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Upload, 
  Users, 
  FileText, 
  CheckCircle, 
  RotateCcw,
  Sparkles,
  Layers,
  Award
} from 'lucide-react';
import { Course, Chapter, Lesson, QuizQuestion } from '../../types/course';
import { UserProgress } from '../../types/user';
import { SoundEffects } from '../../services/audio';

interface InstructorStudioViewProps {
  course: Course;
  progress: UserProgress;
  onSaveCourse: (course: Course) => void;
  onResetCourse: () => void;
}

export const InstructorStudioView: React.FC<InstructorStudioViewProps> = ({
  course,
  progress,
  onSaveCourse,
  onResetCourse
}) => {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'lessons' | 'students' | 'json'>('syllabus');
  const [courseState, setCourseState] = useState<Course>(course);
  const [selectedChapterId, setSelectedChapterId] = useState<string>(course.chapters[0]?.id || '');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(course.chapters[0]?.lessons[0]?.id || '');
  const [savedNotice, setSavedNotice] = useState(false);

  // Selected chapter & lesson
  const currentChapter = courseState.chapters.find((c) => c.id === selectedChapterId) || courseState.chapters[0];
  const currentLesson = currentChapter?.lessons.find((l) => l.id === selectedLessonId) || currentChapter?.lessons[0];

  const handleSaveAll = () => {
    SoundEffects.playSuccess();
    onSaveCourse(courseState);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleExportJSON = () => {
    SoundEffects.playClick();
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(courseState, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', jsonStr);
    dlAnchor.setAttribute('download', `${courseState.id}_curriculum.json`);
    dlAnchor.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.title && imported.chapters) {
          setCourseState(imported);
          onSaveCourse(imported);
          SoundEffects.playSuccess();
          alert('Course syllabus successfully imported!');
        }
      } catch (err) {
        alert('Failed to parse course JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative min-h-[calc(100vh-62px)] bg-[#03060B] text-[#E8F6FA] p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Studio Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#9B7BFF] mb-1">
              <ShieldCheck className="w-4 h-4 animate-pulse" />
              <span>INSTRUCTOR COMMAND STUDIO · CURRICULUM MANAGEMENT</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#E8F6FA]">
              Instructor Studio
            </h1>
            <p className="text-xs text-[#8FA7B3]">
              Customize any subject, edit chapters and dive missions, calibrate quiz questions, and view student cohort analytics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {savedNotice && (
              <span className="text-xs font-mono text-[#7CFFB2] flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Changes Persisted
              </span>
            )}
            <button
              onClick={handleSaveAll}
              className="py-2.5 px-5 rounded-xl font-heading font-bold text-xs bg-gradient-to-r from-[#9B7BFF] to-[#3FF2E6] text-[#03060B] shadow-[0_0_15px_rgba(155,123,255,0.4)] hover:shadow-[0_0_20px_rgba(155,123,255,0.7)] flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Course Syllabus</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 gap-2 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => { setActiveTab('syllabus'); SoundEffects.playClick(); }}
            className={`px-4 py-2.5 font-bold border-b-2 transition-all ${
              activeTab === 'syllabus' ? 'border-[#3FF2E6] text-[#3FF2E6]' : 'border-transparent text-[#8FA7B3] hover:text-white'
            }`}
          >
            Subject & Course Details
          </button>
          <button
            onClick={() => { setActiveTab('lessons'); SoundEffects.playClick(); }}
            className={`px-4 py-2.5 font-bold border-b-2 transition-all ${
              activeTab === 'lessons' ? 'border-[#5CC8FF] text-[#5CC8FF]' : 'border-transparent text-[#8FA7B3] hover:text-white'
            }`}
          >
            Chapter & Lesson Editor
          </button>
          <button
            onClick={() => { setActiveTab('students'); SoundEffects.playClick(); }}
            className={`px-4 py-2.5 font-bold border-b-2 transition-all ${
              activeTab === 'students' ? 'border-[#7CFFB2] text-[#7CFFB2]' : 'border-transparent text-[#8FA7B3] hover:text-white'
            }`}
          >
            Student Roster & Submissions
          </button>
          <button
            onClick={() => { setActiveTab('json'); SoundEffects.playClick(); }}
            className={`px-4 py-2.5 font-bold border-b-2 transition-all ${
              activeTab === 'json' ? 'border-[#9B7BFF] text-[#9B7BFF]' : 'border-transparent text-[#8FA7B3] hover:text-white'
            }`}
          >
            JSON Import / Export
          </button>
        </div>

        {/* TAB 1: Subject & Course Meta Editor */}
        {activeTab === 'syllabus' && (
          <div className="submersible-glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <h3 className="font-heading font-bold text-lg text-[#E8F6FA]">
              Subject & Global Course Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-[#8FA7B3] block mb-1">
                  Primary Subject Name:
                </label>
                <input
                  type="text"
                  value={courseState.subject}
                  onChange={(e) => setCourseState({ ...courseState, subject: e.target.value })}
                  className="w-full bg-[#03060B] border border-white/15 rounded-xl p-3 text-xs text-[#E8F6FA] font-mono focus:border-[#3FF2E6] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-[#8FA7B3] block mb-1">
                  Course Title:
                </label>
                <input
                  type="text"
                  value={courseState.title}
                  onChange={(e) => setCourseState({ ...courseState, title: e.target.value })}
                  className="w-full bg-[#03060B] border border-white/15 rounded-xl p-3 text-xs text-[#E8F6FA] font-mono focus:border-[#3FF2E6] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-[#8FA7B3] block mb-1">
                  Lead Instructor Name:
                </label>
                <input
                  type="text"
                  value={courseState.instructor}
                  onChange={(e) => setCourseState({ ...courseState, instructor: e.target.value })}
                  className="w-full bg-[#03060B] border border-white/15 rounded-xl p-3 text-xs text-[#E8F6FA] font-mono focus:border-[#3FF2E6] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-[#8FA7B3] block mb-1">
                  Instructor Title & Affiliation:
                </label>
                <input
                  type="text"
                  value={courseState.instructorTitle}
                  onChange={(e) => setCourseState({ ...courseState, instructorTitle: e.target.value })}
                  className="w-full bg-[#03060B] border border-white/15 rounded-xl p-3 text-xs text-[#E8F6FA] font-mono focus:border-[#3FF2E6] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-[#8FA7B3] block mb-1">
                Course Description & Syllabus Brief:
              </label>
              <textarea
                rows={4}
                value={courseState.description}
                onChange={(e) => setCourseState({ ...courseState, description: e.target.value })}
                className="w-full bg-[#03060B] border border-white/15 rounded-xl p-3 text-xs text-[#E8F6FA] font-mono focus:border-[#3FF2E6] focus:outline-none resize-none"
              />
            </div>
          </div>
        )}

        {/* TAB 2: Chapter & Lesson Editor */}
        {activeTab === 'lessons' && currentChapter && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Chapter Selector */}
            <div className="submersible-glass p-4 rounded-2xl border border-white/10 space-y-3">
              <div className="text-xs font-mono text-[#8FA7B3]">REEF CHAPTERS:</div>
              <div className="space-y-1.5">
                {courseState.chapters.map((chap) => (
                  <button
                    key={chap.id}
                    onClick={() => {
                      setSelectedChapterId(chap.id);
                      setSelectedLessonId(chap.lessons[0]?.id || '');
                      SoundEffects.playClick();
                    }}
                    className={`w-full p-3 rounded-xl text-left text-xs font-mono border transition-all ${
                      selectedChapterId === chap.id
                        ? 'bg-[#0A2A33] border-[#3FF2E6] text-[#3FF2E6] font-bold'
                        : 'bg-[#071426] border-transparent text-[#8FA7B3] hover:text-white'
                    }`}
                  >
                    <div>CH {chap.number}: {chap.reefName}</div>
                    <div className="text-[10px] text-[#8FA7B3] font-normal">{chap.depthMeters}M · {chap.depthZone}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Lesson & Quiz Editor */}
            <div className="lg:col-span-2 submersible-glass p-6 rounded-2xl border border-white/10 space-y-5">
              {currentLesson ? (
                <>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h4 className="font-heading font-bold text-base text-[#E8F6FA]">
                      Editing: {currentLesson.title}
                    </h4>
                    <span className="text-xs font-mono text-[#3FF2E6]">
                      {currentLesson.depthMeters}M Depth
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-mono text-[#8FA7B3] block mb-1">
                        Lesson Title:
                      </label>
                      <input
                        type="text"
                        value={currentLesson.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCourseState({
                            ...courseState,
                            chapters: courseState.chapters.map((c) =>
                              c.id === currentChapter.id
                                ? {
                                    ...c,
                                    lessons: c.lessons.map((l) =>
                                      l.id === currentLesson.id ? { ...l, title: val } : l
                                    )
                                  }
                                : c
                            )
                          });
                        }}
                        className="w-full bg-[#03060B] border border-white/15 rounded-xl p-2.5 text-xs text-[#E8F6FA] font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono text-[#8FA7B3] block mb-1">
                        Learning Objective:
                      </label>
                      <input
                        type="text"
                        value={currentLesson.objective}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCourseState({
                            ...courseState,
                            chapters: courseState.chapters.map((c) =>
                              c.id === currentChapter.id
                                ? {
                                    ...c,
                                    lessons: c.lessons.map((l) =>
                                      l.id === currentLesson.id ? { ...l, objective: val } : l
                                    )
                                  }
                                : c
                            )
                          });
                        }}
                        className="w-full bg-[#03060B] border border-white/15 rounded-xl p-2.5 text-xs text-[#E8F6FA] font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono text-[#8FA7B3] block mb-1">
                        Lesson Content (Markdown & KaTeX LaTeX math support):
                      </label>
                      <textarea
                        rows={10}
                        value={currentLesson.contentMarkdown}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCourseState({
                            ...courseState,
                            chapters: courseState.chapters.map((c) =>
                              c.id === currentChapter.id
                                ? {
                                    ...c,
                                    lessons: c.lessons.map((l) =>
                                      l.id === currentLesson.id ? { ...l, contentMarkdown: val } : l
                                    )
                                  }
                                : c
                            )
                          });
                        }}
                        className="w-full bg-[#03060B] border border-white/15 rounded-xl p-3 text-xs text-[#E8F6FA] font-mono focus:border-[#3FF2E6] resize-none"
                      />
                    </div>

                    {/* Quiz Questions Count Notice */}
                    <div className="p-3.5 rounded-xl bg-[#071426] border border-white/10 flex items-center justify-between text-xs font-mono">
                      <span>Quiz Questions: {currentLesson.quiz.questions.length} Questions</span>
                      <span className="text-[#3FF2E6]">Passing Threshold: {currentLesson.quiz.passingScore}%</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-[#8FA7B3] text-xs font-mono">
                  Select a lesson to edit content.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Student Roster & Submissions */}
        {activeTab === 'students' && (
          <div className="submersible-glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <h3 className="font-heading font-bold text-lg text-[#E8F6FA]">
              Active Cohort Roster & Performance Analytics
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#071426] border border-white/10 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#3FF2E6]/20 border border-[#3FF2E6] flex items-center justify-center font-bold text-[#3FF2E6]">
                    AV
                  </div>
                  <div>
                    <div className="font-bold text-[#E8F6FA]">Alex Vance (You)</div>
                    <div className="text-[#8FA7B3]">alex.vance@lumina.edu · Callsign: Abyss-Walker</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[#7CFFB2]">Level {progress.completedLessonIds.length + 1}</span>
                  <span className="text-[#3FF2E6] font-bold">{progress.completedLessonIds.length} Lessons Mastered</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#071426] border border-white/10 flex items-center justify-between text-xs font-mono opacity-80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#5CC8FF]/20 border border-[#5CC8FF] flex items-center justify-center font-bold text-[#5CC8FF]">
                    SK
                  </div>
                  <div>
                    <div className="font-bold text-[#E8F6FA]">Samantha Reed</div>
                    <div className="text-[#8FA7B3]">sreed@oceanic.edu · Callsign: Trench-Echo</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[#7CFFB2]">Level 4</span>
                  <span className="text-[#3FF2E6] font-bold">3 Lessons Mastered</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#071426] border border-white/10 flex items-center justify-between text-xs font-mono opacity-80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#9B7BFF]/20 border border-[#9B7BFF] flex items-center justify-center font-bold text-[#9B7BFF]">
                    JM
                  </div>
                  <div>
                    <div className="font-bold text-[#E8F6FA]">Julian Mercer</div>
                    <div className="text-[#8FA7B3]">jmercer@oceanic.edu · Callsign: Depth-Prime</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[#7CFFB2]">Level 2</span>
                  <span className="text-[#3FF2E6] font-bold">1 Lesson Mastered</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: JSON Export & Import */}
        {activeTab === 'json' && (
          <div className="submersible-glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <h3 className="font-heading font-bold text-lg text-[#E8F6FA]">
              Curriculum Data Interchange (JSON Export & Import)
            </h3>
            <p className="text-xs text-[#8FA7B3] leading-relaxed">
              Export your customized course data to JSON for backup or deployment to other academies. You can also import any course curriculum structured in the Lumina JSON format.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={handleExportJSON}
                className="py-3 px-5 rounded-xl font-heading font-bold text-xs bg-[#0A2A33] border border-[#3FF2E6]/40 text-[#3FF2E6] hover:bg-[#3FF2E6]/20 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Course to JSON</span>
              </button>

              <label className="py-3 px-5 rounded-xl font-heading font-bold text-xs bg-[#071426] border border-white/20 text-[#E8F6FA] hover:border-[#9B7BFF] transition-all flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4 text-[#9B7BFF]" />
                <span>Import Course from JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => {
                  if (confirm('Reset course to factory default? Any custom edits will be reverted.')) {
                    onResetCourse();
                    SoundEffects.playClick();
                  }
                }}
                className="py-3 px-5 rounded-xl font-mono text-xs border border-[#FF6B9A]/30 text-[#FF6B9A] hover:bg-[#FF6B9A]/15 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Factory Default</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
