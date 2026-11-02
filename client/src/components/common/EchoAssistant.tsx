import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, ShieldAlert, BookOpen, Brain, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Course, Lesson } from '../../types/course';
import { AiTutorService, EchoMessage, ExplanationLevel } from '../../services/aiTutor';
import { SoundEffects } from '../../services/audio';

interface EchoAssistantProps {
  course: Course;
  currentLesson?: Lesson;
  apiKey?: string;
  onNavigateLesson?: (lessonId: string) => void;
  onOpenFlashcards?: () => void;
}

export const EchoAssistant: React.FC<EchoAssistantProps> = ({
  course,
  currentLesson,
  apiKey,
  onNavigateLesson,
  onOpenFlashcards
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [level, setLevel] = useState<ExplanationLevel>('intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<EchoMessage[]>([
    {
      id: 'init-1',
      sender: 'echo',
      content: `Greetings Explorer. I am **ECHO**, your holographic oceanic tutor. 
Currently monitoring telemetry for **${currentLesson ? currentLesson.title : course.title}**.
How may I illuminate your deep expedition today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLive = AiTutorService.isConfigured(apiKey);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (customPrompt?: string) => {
    const text = (customPrompt || input).trim();
    if (!text || isLoading) return;

    SoundEffects.playClick();
    const userMsg: EchoMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await AiTutorService.askEcho(text, {
        course,
        currentLesson,
        level,
        apiKey
      });

      SoundEffects.playSonarPing();
      const echoMsg: EchoMessage = {
        id: 'echo-' + Date.now(),
        sender: 'echo',
        content: result.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: result.suggestedAction
      };
      setMessages((prev) => [...prev, echoMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Explain this concept in simple terms',
    'Summarize this lesson',
    'Why is the bias term necessary?',
    'What should I study next?'
  ];

  return (
    <>
      {/* Floating Holographic Assistant Orb (always docked bottom-right) */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); SoundEffects.playSonarPing(); }}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-3 submersible-glass px-4 py-3 rounded-full border border-[#9B7BFF]/40 hover:border-[#9B7BFF] transition-all hover:scale-105"
        >
          {/* Pulsing Light Orb */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#9B7BFF]/30 animate-ping" />
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#9B7BFF] to-[#3FF2E6] shadow-[0_0_15px_#9B7BFF]" />
          </div>
          <div className="text-left">
            <div className="text-xs font-mono font-bold text-[#9B7BFF] flex items-center gap-1.5">
              <span>ECHO AI TUTOR</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${isLive ? 'bg-emerald-950 text-emerald-400 border border-emerald-600' : 'bg-[#0A2A33] text-[#3FF2E6] border border-[#3FF2E6]/30'}`}>
                {isLive ? 'LIVE' : 'DEMO MODE'}
              </span>
            </div>
            <div className="text-[11px] text-[#8FA7B3]">Holographic Guidance</div>
          </div>
        </button>
      )}

      {/* Floating Holographic Assistant Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[580px] max-h-[85vh] flex flex-col submersible-glass-violet rounded-2xl border border-[#9B7BFF]/40 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-4 border-b border-[#9B7BFF]/20 flex items-center justify-between bg-[#071426]/80">
            <div className="flex items-center gap-3">
              {/* Elegant Holographic Pulsing Orb */}
              <div className="relative w-7 h-7 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full bg-[#9B7BFF]/30 ${isLoading ? 'animate-ping' : ''}`} />
                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#9B7BFF] to-[#3FF2E6] shadow-[0_0_12px_#9B7BFF]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#E8F6FA]">ECHO Ocean Tutor</h3>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isLive ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500' : 'bg-indigo-950 text-indigo-300 border border-indigo-700'}`}>
                    {isLive ? '● LIVE AI' : '● DEMO ENGINE'}
                  </span>
                </div>
                <div className="text-[10px] text-[#8FA7B3] font-mono">
                  {currentLesson ? `Attached: ${currentLesson.title.substring(0, 24)}...` : 'Deep Bridge Standby'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-[#8FA7B3] hover:text-white p-1 rounded-md hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Level Switcher */}
          <div className="px-4 py-2 bg-[#03060B]/60 border-b border-[#9B7BFF]/15 flex items-center justify-between text-xs font-mono">
            <span className="text-[#8FA7B3]">Depth Mode:</span>
            <div className="flex gap-1">
              {(['beginner', 'intermediate', 'advanced'] as ExplanationLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`px-2 py-0.5 rounded capitalize text-[10px] ${level === lvl ? 'bg-[#9B7BFF] text-[#03060B] font-bold' : 'text-[#8FA7B3] hover:text-white'}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm font-sans">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#3FF2E6]/20 border border-[#3FF2E6]/40 text-[#E8F6FA]'
                      : 'bg-[#071426]/90 border border-[#9B7BFF]/30 text-[#E8F6FA]'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {/* Optional Quick Action Button attached by ECHO */}
                  {m.suggestedAction && (
                    <button
                      onClick={() => {
                        if (m.suggestedAction?.actionType === 'navigate_lesson' && onNavigateLesson && m.suggestedAction.payload) {
                          onNavigateLesson(m.suggestedAction.payload);
                        } else if (m.suggestedAction?.actionType === 'open_flashcards' && onOpenFlashcards) {
                          onOpenFlashcards();
                        }
                      }}
                      className="mt-2.5 block w-full text-center py-1.5 px-3 rounded-lg bg-[#9B7BFF]/20 hover:bg-[#9B7BFF]/40 border border-[#9B7BFF]/50 text-xs font-mono text-[#9B7BFF] transition-all"
                    >
                      ▶ {m.suggestedAction.label}
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-[#8FA7B3] font-mono mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs font-mono text-[#9B7BFF]">
                <div className="w-2 h-2 rounded-full bg-[#9B7BFF] animate-ping" />
                <span>ECHO is traversing neural archives...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-[#03060B]/70 border-t border-[#9B7BFF]/15 flex items-center gap-1.5 overflow-x-auto">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp)}
                className="whitespace-nowrap px-2 py-1 rounded bg-[#0A2A33]/80 hover:bg-[#0A2A33] border border-[#3FF2E6]/25 text-[10px] text-[#3FF2E6] transition-all"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-[#071426]/90 border-t border-[#9B7BFF]/20 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask ECHO anything about this lesson..."
              className="flex-1 bg-[#03060B] border border-[#9B7BFF]/30 rounded-xl px-3 py-2 text-xs text-[#E8F6FA] focus:outline-none focus:border-[#9B7BFF] placeholder:text-[#8FA7B3]/50"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-xl bg-[#9B7BFF] text-[#03060B] font-bold hover:bg-[#9B7BFF]/80 disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
