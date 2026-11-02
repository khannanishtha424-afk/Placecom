import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Clock, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Award, 
  ArrowRight, 
  RotateCcw, 
  Compass, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundEffects } from '../../services/audio';

interface LeviathanExamViewProps {
  onBackToBridge: () => void;
  onRecordExamScore: (score: number, xpEarned: number) => void;
}

interface ExamQuestion {
  id: string;
  depthZone: string;
  depthMeters: number;
  question: string;
  scenario?: string;
  type: 'scenario' | 'multiple-choice';
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
}

const LEVIATHAN_QUESTIONS: ExamQuestion[] = [
  {
    id: 'lev-1',
    depthZone: 'Twilight Shallows',
    depthMeters: 8200,
    type: 'multiple-choice',
    question: 'Why does stacking multiple purely linear transformation layers without non-linear activations fail to expand model capacity?',
    scenario: 'Telemetry telemetry calibration at 8,200m depth.',
    options: [
      'Matrix multiplication is associative: W_2 · (W_1 · X) mathematically collapses into a single composite matrix W_prime · X',
      'The learning rate is divided by the number of stacked layers, causing instant divergence',
      'Linear functions have undefined derivatives on GPU tensor cores',
      'Purely linear matrices cannot be inverted during backpropagation'
    ],
    correctIndex: 0,
    explanation: 'Because matrix multiplication is closed and associative under composition, any sequence of linear operations is strictly identical to a single linear map. Non-linear activations are required to bend and partition complex manifolds.',
    hint: 'Think about multiplying two matrices: W2 * W1 = W3.'
  },
  {
    id: 'lev-2',
    depthZone: 'Midnight Ridge',
    depthMeters: 8900,
    type: 'scenario',
    scenario: 'An autonomous deep trench probe reports that its gradient vector norm is rapidly exploding to NaN when descending steep underwater ravines.',
    question: 'Which architectural and algorithmic interventions immediately mitigate gradient explosion during backpropagation?',
    options: [
      'Gradient clipping by norm (e.g. max_norm = 1.0) and residual skip connections with LayerNorm',
      'Increasing the learning rate by a factor of 10 to speed past the steep canyon',
      'Removing all bias terms and replacing ReLU with standard Step functions',
      'Decreasing the batch size to 1 without momentum'
    ],
    correctIndex: 0,
    explanation: 'Gradient clipping restricts the maximum step vector magnitude, preventing catastrophic jumps off the loss cliff, while residual connections and LayerNorm stabilize variance across layers.',
    hint: 'Look for techniques that constrain the magnitude of the gradient vector.'
  },
  {
    id: 'lev-3',
    depthZone: 'Abyssal Spires',
    depthMeters: 9750,
    type: 'scenario',
    scenario: 'A transformer acoustic model is processing an ultra-long context window of 64,000 underwater audio tokens.',
    question: 'What is the computational and memory complexity of standard multi-head self-attention with respect to sequence length N?',
    options: [
      'O(N^2) quadratic complexity in both computation and memory for calculating the QK^T attention matrix',
      'O(N) strictly linear complexity',
      'O(log N) logarithmic tree complexity',
      'O(1) constant time tensor contraction'
    ],
    correctIndex: 0,
    explanation: 'Standard self-attention computes an N x N similarity matrix between every Query and every Key, scaling quadratically with sequence length N unless FlashAttention or sparse approximations are utilized.',
    hint: 'Every token must compute an inner product with every other token in the sequence.'
  },
  {
    id: 'lev-4',
    depthZone: 'Hadal Void Trench Floor',
    depthMeters: 10920,
    type: 'scenario',
    scenario: 'You stand before the majestic glowing Leviathan at 10,920m (Challenger Deep). The creature tests your mastery of autonomous reinforcement learning in unknown worlds.',
    question: 'How do World Model architectures (such as Dreamer) enable deep agents to learn sample-efficient behaviors in hazardous environments without risking physical hardware?',
    options: [
      'By learning a compressed latent dynamics model of the environment and training the actor-critic policy entirely inside imagined latent simulations',
      'By memorizing all previous state transitions in a lookup table without neural compression',
      'By forcing the environment to become deterministic through reward clipping',
      'By removing the discount factor γ entirely from the Bellman equation'
    ],
    correctIndex: 0,
    explanation: 'World Models separate world prediction from policy learning: the agent learns transition dynamics in latent space, then uses latent imagination to plan and optimize policies without costly or destructive real-world trials.',
    hint: 'Think about training an agent inside a dream simulation of the environment.'
  }
];

export const LeviathanExamView: React.FC<LeviathanExamViewProps> = ({
  onBackToBridge,
  onRecordExamScore
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [currentDepth, setCurrentDepth] = useState(8000);
  const [oxygenSeconds, setOxygenSeconds] = useState(300); // 5-minute oxygen reserve
  const [sonarHintsLeft, setSonarHintsLeft] = useState(3);
  const [revealedHint, setRevealedHint] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [score, setScore] = useState(0);

  // Oxygen Timer countdown
  useEffect(() => {
    let timer: any;
    if (!examFinished && oxygenSeconds > 0) {
      timer = setInterval(() => {
        setOxygenSeconds((prev) => {
          if (prev <= 1) {
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examFinished, oxygenSeconds]);

  const handleSelectOption = (optIdx: number) => {
    if (examFinished) return;
    SoundEffects.playClick();
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: optIdx }));
  };

  const handleNextQuestion = () => {
    SoundEffects.playSonarPing();
    const isCorrect = selectedAnswers[currentIdx] === LEVIATHAN_QUESTIONS[currentIdx].correctIndex;
    if (isCorrect) {
      // Sink deeper toward Challenger Deep
      setCurrentDepth((prev) => Math.min(10920, prev + 730));
    }

    if (currentIdx < LEVIATHAN_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setRevealedHint(false);
    } else {
      handleFinishExam();
    }
  };

  const handleUseHint = () => {
    if (sonarHintsLeft <= 0 || revealedHint) return;
    SoundEffects.playSonarPing();
    setSonarHintsLeft(sonarHintsLeft - 1);
    setRevealedHint(true);
  };

  const handleFinishExam = () => {
    let correct = 0;
    LEVIATHAN_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });

    const finalScore = Math.round((correct / LEVIATHAN_QUESTIONS.length) * 100);
    setScore(finalScore);
    setExamFinished(true);

    if (finalScore >= 75) {
      SoundEffects.playSuccess();
      confetti({
        particleCount: 100,
        spread: 80,
        colors: ['#FF6B9A', '#9B7BFF', '#3FF2E6', '#7CFFB2']
      });
      onRecordExamScore(finalScore, 800);
    }
  };

  const question = LEVIATHAN_QUESTIONS[currentIdx];
  const oxygenMinutes = Math.floor(oxygenSeconds / 60);
  const oxygenRemainingSecs = oxygenSeconds % 60;
  const isOxygenLow = oxygenSeconds < 60;

  return (
    <div className="relative min-h-[calc(100vh-62px)] bg-[#03060B] text-[#E8F6FA] p-4 sm:p-8 overflow-y-auto">
      {/* Background Majestic Leviathan Bioluminescent Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(ellipse_at_50%_70%,#FF6B9A_0%,#9B7BFF_30%,transparent_70%)]" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Navigation & Telemetry HUD */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            onClick={() => { SoundEffects.playClick(); onBackToBridge(); }}
            className="flex items-center gap-2 text-xs font-mono text-[#8FA7B3] hover:text-[#3FF2E6] transition-all px-3 py-1.5 rounded-lg border border-white/10 bg-[#071426]/60"
          >
            <span>ABORT EXAM & RETURN TO BRIDGE</span>
          </button>

          {/* Oxygen Reserve & Depth Gauges */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${isOxygenLow ? 'bg-[#FF6B9A]/20 border-[#FF6B9A] text-[#FF6B9A] animate-pulse' : 'bg-[#071426] border-white/15 text-[#3FF2E6]'}`}>
              <Clock className="w-3.5 h-3.5" />
              <span>OXYGEN: {oxygenMinutes}:{oxygenRemainingSecs < 10 ? `0${oxygenRemainingSecs}` : oxygenRemainingSecs}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#071426] border border-[#FF6B9A]/40 text-[#FF6B9A] font-bold">
              <Compass className="w-3.5 h-3.5" />
              <span>DEPTH: {currentDepth.toLocaleString()}M</span>
            </div>
          </div>
        </div>

        {!examFinished ? (
          /* Active Exam Dive Card */
          <div className="submersible-glass p-6 sm:p-8 rounded-3xl border border-[#FF6B9A]/40 shadow-2xl space-y-6">
            {/* Header / Leviathan Presence */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#FF6B9A] mb-1">
                  <Zap className="w-4 h-4 animate-pulse" />
                  <span>LEVIATHAN TRENCH ENCOUNTER · TRIAL {currentIdx + 1} OF {LEVIATHAN_QUESTIONS.length}</span>
                </div>
                <h2 className="font-heading font-extrabold text-xl text-[#E8F6FA]">
                  {question.depthZone} ({question.depthMeters}M)
                </h2>
              </div>

              {/* Sonar Hints Left Button */}
              <button
                onClick={handleUseHint}
                disabled={sonarHintsLeft <= 0 || revealedHint}
                className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#0A2A33] border border-[#3FF2E6]/30 text-[#3FF2E6] hover:bg-[#3FF2E6]/20 disabled:opacity-40 flex items-center gap-1.5 transition-all"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Sonar Hint ({sonarHintsLeft} Left)</span>
              </button>
            </div>

            {/* Scenario Box */}
            {question.scenario && (
              <div className="p-4 rounded-2xl bg-[#03060B]/80 border border-[#9B7BFF]/30 text-xs font-mono text-[#9B7BFF] leading-relaxed">
                <strong>Submersible Telemetry Scenario:</strong> {question.scenario}
              </div>
            )}

            {/* Question Text */}
            <h3 className="font-medium text-base text-[#E8F6FA] leading-relaxed">
              {question.question}
            </h3>

            {/* Revealed Hint */}
            {revealedHint && (
              <div className="p-3.5 rounded-xl bg-[#0A2A33] border border-[#3FF2E6]/40 text-xs font-mono text-[#3FF2E6] animate-in fade-in">
                <strong>Leviathan Sonar Hint:</strong> {question.hint}
              </div>
            )}

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((opt, oIdx) => {
                const isSelected = selectedAnswers[currentIdx] === oIdx;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`w-full p-4 rounded-xl text-left text-xs font-sans border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#FF6B9A]/20 border-[#FF6B9A] text-[#E8F6FA] font-semibold shadow-[0_0_15px_rgba(255,107,154,0.3)]'
                        : 'bg-[#071426]/70 border-white/10 text-[#8FA7B3] hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B9A] shadow-[0_0_8px_#FF6B9A]" />}
                  </button>
                );
              })}
            </div>

            {/* Next / Dive Sinking Action */}
            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs font-mono text-[#8FA7B3]">
                Correct answers sink your submersible deeper into the abyss.
              </span>

              <button
                onClick={handleNextQuestion}
                disabled={selectedAnswers[currentIdx] === undefined}
                className="py-3 px-6 rounded-xl font-heading font-bold text-xs bg-gradient-to-r from-[#FF6B9A] to-[#9B7BFF] text-[#03060B] shadow-[0_0_20px_rgba(255,107,154,0.4)] hover:shadow-[0_0_25px_rgba(255,107,154,0.7)] disabled:opacity-40 flex items-center gap-2 transition-all"
              >
                <span>{currentIdx < LEVIATHAN_QUESTIONS.length - 1 ? 'Sink Deeper & Continue' : 'Conclude Leviathan Encounter'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Exam Performance Report */
          <div className="submersible-glass p-8 rounded-3xl border border-[#FF6B9A]/40 shadow-2xl text-center space-y-6 animate-in fade-in">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#FF6B9A]/20 border border-[#FF6B9A] flex items-center justify-center shadow-[0_0_20px_#FF6B9A]">
              <Award className="w-8 h-8 text-[#FF6B9A]" />
            </div>

            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#FF6B9A] mb-1">
                EXAMINATION DEBRIEF & TELEMETRY
              </div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#E8F6FA]">
                {score >= 75 ? 'Leviathan Synthesis Mastered!' : 'Expedition Pressures High'}
              </h2>
              <p className="text-xs text-[#8FA7B3] mt-2 max-w-md mx-auto">
                {score >= 75
                  ? 'You descended into Challenger Deep (10,920m) and communicated with the apex neural intelligence.'
                  : 'Your oxygen or pressure seals wavered. Revisit the Twilight and Midnight foundations in the Tidal Vortex.'}
              </p>
            </div>

            {/* Score Pill */}
            <div className="inline-flex items-center gap-6 px-6 py-4 rounded-2xl bg-[#071426] border border-white/10 font-mono">
              <div>
                <div className="text-2xl font-bold text-[#3FF2E6]">{score}%</div>
                <div className="text-[10px] text-[#8FA7B3]">SYNAPSE SCORE</div>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div>
                <div className="text-2xl font-bold text-[#7CFFB2]">
                  {score >= 75 ? '+800 XP' : '+200 XP'}
                </div>
                <div className="text-[10px] text-[#8FA7B3]">BOUNTY REWARD</div>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div>
                <div className="text-2xl font-bold text-[#FF6B9A]">{currentDepth}M</div>
                <div className="text-[10px] text-[#8FA7B3]">DEPTH ATTAINED</div>
              </div>
            </div>

            {/* Explanations Review List */}
            <div className="text-left space-y-3 pt-4 border-t border-white/10">
              <h4 className="font-mono text-xs text-[#3FF2E6] font-bold">DETAILED TRIAL DEBRIEF:</h4>
              {LEVIATHAN_QUESTIONS.map((q, idx) => {
                const userChoice = selectedAnswers[idx];
                const isCorrect = userChoice === q.correctIndex;
                return (
                  <div key={q.id} className="p-3.5 rounded-xl bg-[#03060B] border border-white/10 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8FA7B3]">Trial {idx + 1} ({q.depthMeters}M)</span>
                      <span className={isCorrect ? 'text-[#7CFFB2] font-semibold' : 'text-[#FF6B9A]'}>
                        {isCorrect ? 'Mastered' : 'Incorrect'}
                      </span>
                    </div>
                    <div className="text-[#E8F6FA] font-medium">{q.question}</div>
                    <div className="text-[#8FA7B3] text-[11px] pt-1">{q.explanation}</div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={() => {
                  setExamFinished(false);
                  setCurrentIdx(0);
                  setSelectedAnswers({});
                  setCurrentDepth(8000);
                  setOxygenSeconds(300);
                  setSonarHintsLeft(3);
                  SoundEffects.playClick();
                }}
                className="py-2.5 px-5 rounded-xl border border-white/20 text-xs font-mono text-[#8FA7B3] hover:text-white flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-attempt Exam</span>
              </button>

              <button
                onClick={() => { SoundEffects.playSonarPing(); onBackToBridge(); }}
                className="py-2.5 px-6 rounded-xl font-heading font-bold text-xs bg-[#3FF2E6] text-[#03060B] shadow-[0_0_15px_#3FF2E6]"
              >
                Return to Bridge Command
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
