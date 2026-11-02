import React, { useState } from 'react';
import { 
  Radio, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Upload, 
  FileText, 
  Zap, 
  ShieldAlert, 
  Filter, 
  Send, 
  Coins,
  ArrowRight
} from 'lucide-react';
import { Course, Chapter, Assignment } from '../../types/course';
import { UserProgress, AssignmentSubmission } from '../../types/user';
import { SoundEffects } from '../../services/audio';

interface MissionControlViewProps {
  course: Course;
  progress: UserProgress;
  onSelectLesson: (lessonId: string) => void;
  onSubmitAssignment: (assignmentId: string, submission: AssignmentSubmission) => void;
  onOpenLeviathanExam: () => void;
}

export const MissionControlView: React.FC<MissionControlViewProps> = ({
  course,
  progress,
  onSelectLesson,
  onSubmitAssignment,
  onOpenLeviathanExam
}) => {
  const [filter, setFilter] = useState<'all' | 'assignments' | 'lessons' | 'boss'>('all');
  const [activeAssignmentModal, setActiveAssignmentModal] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [fileName, setFileName] = useState('');

  // Collect all assignments
  const allAssignments = course.chapters.map((c) => c.assignment).filter((a): a is Assignment => Boolean(a));
  const allLessons = course.chapters.flatMap((c) => c.lessons);

  const handleOpenSubmission = (asg: Assignment) => {
    setActiveAssignmentModal(asg);
    const existing = progress.assignmentSubmissions[asg.id];
    setSubmissionText(existing?.content || '');
    setFileName(existing?.fileAttachmentName || '');
    SoundEffects.playClick();
  };

  const handleSendSubmission = () => {
    if (!activeAssignmentModal || !submissionText.trim()) return;
    SoundEffects.playSuccess();

    const submission: AssignmentSubmission = {
      assignmentId: activeAssignmentModal.id,
      submittedAt: new Date().toISOString(),
      content: submissionText,
      fileAttachmentName: fileName || 'oceanic_telemetry_report.pdf',
      grade: 95, // simulated automated instructor evaluation
      feedback: 'Outstanding mathematical derivation of oceanic tensors and synaptic loss surfaces.',
      status: 'graded'
    };

    onSubmitAssignment(activeAssignmentModal.id, submission);
    setActiveAssignmentModal(null);
  };

  return (
    <div className="relative min-h-[calc(100vh-62px)] bg-[#03060B] text-[#E8F6FA] p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#3FF2E6] mb-1">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>EXPEDITION COMMAND · MISSION DISPATCH</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#E8F6FA]">
              Mission Control
            </h1>
            <p className="text-xs text-[#8FA7B3]">
              Track your dive missions, capstone deliverables, and boss challenges across the four depth zones.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 submersible-glass p-1 rounded-xl border border-white/10 text-xs font-mono">
            {(['all', 'lessons', 'assignments', 'boss'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setFilter(tab); SoundEffects.playClick(); }}
                className={`px-3 py-1 rounded-lg capitalize transition-all ${
                  filter === tab
                    ? 'bg-[#3FF2E6] text-[#03060B] font-bold'
                    : 'text-[#8FA7B3] hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Leviathan Boss Challenge Highlight Banner */}
        {(filter === 'all' || filter === 'boss') && (
          <div className="submersible-glass p-6 rounded-3xl border border-[#FF6B9A]/40 shadow-2xl relative overflow-hidden bg-gradient-to-r from-[#071426] via-[#100b21] to-[#071426]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 font-mono text-xs text-[#FF6B9A]">
                  <Zap className="w-4 h-4 animate-pulse" />
                  <span>HADAL TRENCH BOSS EXPEDITION (8,500M+)</span>
                </div>
                <h2 className="font-heading font-extrabold text-xl text-[#E8F6FA]">
                  The Leviathan Deep Examination
                </h2>
                <p className="text-xs text-[#8FA7B3] leading-relaxed">
                  Encounter the colossal bioluminescent Leviathan at the trench floor. Prove your neural comprehension through high-stakes scenario challenges with real-time oxygen depletion.
                </p>
              </div>

              <button
                onClick={() => { SoundEffects.playSonarPing(); onOpenLeviathanExam(); }}
                className="py-3 px-6 rounded-xl font-heading font-bold text-xs bg-gradient-to-r from-[#FF6B9A] to-[#9B7BFF] text-[#03060B] shadow-[0_0_20px_rgba(255,107,154,0.4)] hover:shadow-[0_0_30px_rgba(255,107,154,0.7)] flex items-center gap-2 hover:scale-[1.02] transition-all"
              >
                <span>ENTER LEVIATHAN EXAM</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Assignments Section */}
        {(filter === 'all' || filter === 'assignments') && (
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg text-[#E8F6FA] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#9B7BFF]" />
              <span>Project Assignments & Capstone Reports</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allAssignments.map((asg) => {
                const sub = progress.assignmentSubmissions[asg.id];
                const isSubmitted = Boolean(sub);

                return (
                  <div
                    key={asg.id}
                    className="submersible-glass p-5 rounded-2xl border border-[#9B7BFF]/25 hover:border-[#9B7BFF]/50 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#9B7BFF]/20 text-[#9B7BFF] border border-[#9B7BFF]/40 font-semibold">
                        {asg.difficulty} Assignment
                      </span>
                      {isSubmitted ? (
                        <span className="flex items-center gap-1 text-xs font-mono text-[#7CFFB2] font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          <span>Graded ({sub.grade}/100)</span>
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-[#FF6B9A] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Due: {asg.deadline}</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-heading font-bold text-base text-[#E8F6FA]">
                      {asg.title}
                    </h4>
                    <p className="text-xs text-[#8FA7B3] line-clamp-2 leading-relaxed">
                      {asg.brief}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs font-mono">
                      <div className="flex items-center gap-2 text-[#7CFFB2]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>+{asg.xpReward} XP</span>
                        <Coins className="w-3.5 h-3.5 ml-2" />
                        <span>+{asg.creditReward} CR</span>
                      </div>

                      <button
                        onClick={() => handleOpenSubmission(asg)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                          isSubmitted
                            ? 'bg-[#071426] border border-[#7CFFB2]/40 text-[#7CFFB2] hover:bg-[#7CFFB2]/15'
                            : 'bg-[#9B7BFF]/20 border border-[#9B7BFF] text-[#9B7BFF] hover:bg-[#9B7BFF]/40'
                        }`}
                      >
                        {isSubmitted ? 'View Evaluation' : 'Submit Mission'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Regular Dive Missions List */}
        {(filter === 'all' || filter === 'lessons') && (
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg text-[#E8F6FA] flex items-center gap-2">
              <Radio className="w-5 h-5 text-[#3FF2E6]" />
              <span>Ocean Exploration Dives</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allLessons.map((les) => {
                const isMastered = progress.completedLessonIds.includes(les.id);
                return (
                  <div
                    key={les.id}
                    onClick={() => {
                      SoundEffects.playSonarPing();
                      onSelectLesson(les.id);
                    }}
                    className={`submersible-glass p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] ${
                      isMastered ? 'border-[#7CFFB2]/30' : 'border-[#3FF2E6]/25 hover:border-[#3FF2E6]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#8FA7B3] mb-2">
                      <span className="text-[#3FF2E6]">{les.depthMeters}M DEPTH</span>
                      {isMastered ? (
                        <span className="text-[#7CFFB2] flex items-center gap-1 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" /> Mastered
                        </span>
                      ) : (
                        <span>+{les.xpReward} XP</span>
                      )}
                    </div>
                    <h5 className="font-heading font-bold text-sm text-[#E8F6FA] mb-1 line-clamp-1">
                      {les.title}
                    </h5>
                    <p className="text-xs text-[#8FA7B3] line-clamp-2">
                      {les.objective}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Assignment Submission Modal */}
        {activeAssignmentModal && (
          <div className="fixed inset-0 z-50 bg-[#03060B]/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="submersible-glass p-6 sm:p-8 rounded-3xl border border-[#9B7BFF]/40 max-w-xl w-full shadow-2xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono text-[#9B7BFF]">ASSIGNMENT SUBMISSION CONSOLE</span>
                  <h3 className="font-heading font-bold text-xl text-[#E8F6FA] mt-1">
                    {activeAssignmentModal.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveAssignmentModal(null)}
                  className="text-[#8FA7B3] hover:text-white text-xs font-mono p-1"
                >
                  [CLOSE]
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#03060B] border border-white/10 text-xs text-[#8FA7B3] space-y-1">
                <div><strong>Deliverable:</strong> {activeAssignmentModal.deliverable}</div>
                <div><strong>Rewards:</strong> +{activeAssignmentModal.xpReward} XP, +{activeAssignmentModal.creditReward} Credits</div>
              </div>

              <div>
                <label className="text-xs font-mono text-[#8FA7B3] block mb-1">
                  Deliverable Analysis & Synthesis (Markdown / Code / Math Derivations):
                </label>
                <textarea
                  rows={6}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Paste your neural tensor derivations, PyTorch/NumPy equations, or oceanic case analysis..."
                  className="w-full bg-[#03060B] border border-white/15 rounded-xl p-3 text-xs text-[#E8F6FA] font-mono focus:outline-none focus:border-[#9B7BFF]"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-[#8FA7B3] block mb-1">
                  Attach Supplementary Dataset / PDF:
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. oceanic_loss_landscape_experiment.ipynb"
                  className="w-full bg-[#03060B] border border-white/15 rounded-xl px-3 py-2 text-xs text-[#E8F6FA] font-mono focus:outline-none focus:border-[#9B7BFF]"
                />
              </div>

              {/* Show feedback if already graded */}
              {progress.assignmentSubmissions[activeAssignmentModal.id]?.feedback && (
                <div className="p-3 rounded-xl bg-[#7CFFB2]/10 border border-[#7CFFB2]/30 text-xs font-mono text-[#7CFFB2]">
                  <strong>Instructor Evaluation (Grade: {progress.assignmentSubmissions[activeAssignmentModal.id].grade}/100):</strong>
                  <p className="mt-1">{progress.assignmentSubmissions[activeAssignmentModal.id].feedback}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setActiveAssignmentModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-[#8FA7B3] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendSubmission}
                  disabled={!submissionText.trim()}
                  className="px-6 py-2.5 rounded-xl font-heading font-bold text-xs bg-gradient-to-r from-[#9B7BFF] to-[#3FF2E6] text-[#03060B] shadow-[0_0_15px_rgba(155,123,255,0.4)] hover:shadow-[0_0_25px_rgba(155,123,255,0.7)] disabled:opacity-40 transition-all flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit to Instructor Studio</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
