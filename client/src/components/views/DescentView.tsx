import React, { useState, useEffect } from 'react';
import { Compass, ArrowDown, User, ShieldCheck, Sparkles, Key, CheckCircle, Play } from 'lucide-react';
import { SoundEffects } from '../../services/audio';

interface DescentViewProps {
  onBeginDescent: (role: 'student' | 'instructor') => void;
  courseSubject: string;
}

export const DescentView: React.FC<DescentViewProps> = ({ onBeginDescent, courseSubject }) => {
  const [depthMeter, setDepthMeter] = useState(0);
  const [isDescending, setIsDescending] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'student' | 'instructor'>('student');
  const [callsign, setCallsign] = useState('Alex Vance');
  const [email, setEmail] = useState('alex.vance@lumina.edu');

  // Handle cinematic descent animation
  useEffect(() => {
    let timer: any;
    if (isDescending) {
      SoundEffects.playSonarPing();
      timer = setInterval(() => {
        setDepthMeter((prev) => {
          if (prev >= 650) {
            clearInterval(timer);
            onBeginDescent(selectedRole);
            return 650;
          }
          return prev + 25;
        });
      }, 50);
    }
    return () => clearInterval(timer);
  }, [isDescending, selectedRole, onBeginDescent]);

  const handleStartDive = () => {
    SoundEffects.playClick();
    setIsDescending(true);
  };

  const handleSkipCinematic = () => {
    SoundEffects.playSonarPing();
    onBeginDescent(selectedRole);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#03060B] overflow-hidden flex flex-col justify-between items-center text-[#E8F6FA] select-none p-6">
      {/* Background Volumetric Light Shafts & Ocean Gradient */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at 50% ${Math.max(0, 30 - depthMeter * 0.04)}%, rgba(63, 242, 230, ${Math.max(0.04, 0.25 - depthMeter * 0.0003)}) 0%, #071426 40%, #03060B 85%)`
        }}
      />

      {/* Drifting Bioluminescent Plankton Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#3FF2E6]/60 animate-pulse"
            style={{
              width: `${(i % 4) * 2 + 3}px`,
              height: `${(i % 4) * 2 + 3}px`,
              left: `${(i * 17) % 96}%`,
              top: `${(i * 23) % 94}%`,
              animationDuration: `${3 + (i % 5)}s`,
              boxShadow: '0 0 10px #3FF2E6'
            }}
          />
        ))}
      </div>

      {/* Top Bar: Skip Cinematic & Status */}
      <div className="relative z-20 w-full max-w-5xl flex items-center justify-between pt-4">
        <div className="flex items-center gap-2 font-mono text-xs text-[#3FF2E6]">
          <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '12s' }} />
          <span>EXPEDITION PROTOCOL: LUMINA-V4</span>
        </div>
        <button
          onClick={handleSkipCinematic}
          className="text-xs font-mono text-[#8FA7B3] hover:text-[#3FF2E6] px-3 py-1.5 rounded-lg border border-[#8FA7B3]/30 hover:border-[#3FF2E6] transition-all flex items-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Skip Cinematic Descent</span>
        </button>
      </div>

      {/* Main Central Cockpit Gate */}
      <div className="relative z-20 w-full max-w-lg my-auto py-8">
        <div className="submersible-glass p-8 rounded-3xl border border-[#3FF2E6]/30 shadow-2xl backdrop-blur-2xl text-center">
          {/* Emblem & Title */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#071426] border border-[#3FF2E6] flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(63,242,230,0.4)]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3FF2E6] to-[#9B7BFF] animate-pulse" />
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-[#E8F6FA] mb-2">
            LUMINA DEEP ACADEMY
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-[#3FF2E6] mb-3">
            Learn Beyond the Surface
          </p>
          <p className="text-xs text-[#8FA7B3] mb-6 leading-relaxed">
            Welcome to the 3D bioluminescent learning ocean. Every chapter is a glowing reef city, every quiz is a dive challenge, and progress is depth.
          </p>

          {/* Depth Counter during descent */}
          {isDescending ? (
            <div className="py-6 space-y-3 animate-in fade-in">
              <div className="font-mono text-4xl font-extrabold text-[#3FF2E6] tracking-wider animate-pulse">
                {depthMeter} METERS
              </div>
              <div className="text-xs font-mono text-[#5CC8FF]">
                {depthMeter < 200 ? 'Traversing Twilight Shallows...' : 'Passing into Midnight Abyss...'}
              </div>
              <div className="w-full bg-[#071426] h-2 rounded-full overflow-hidden border border-[#3FF2E6]/30">
                <div
                  className="bg-gradient-to-r from-[#3FF2E6] to-[#9B7BFF] h-full transition-all duration-75"
                  style={{ width: `${(depthMeter / 650) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-5 text-left">
              {/* Role Selection */}
              <div>
                <label className="text-[11px] font-mono text-[#8FA7B3] block mb-2">
                  SELECT EXPLORER CALLSIGN & ROLE:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('student');
                      setCallsign('Alex Vance');
                      setEmail('alex.vance@lumina.edu');
                      SoundEffects.playClick();
                    }}
                    className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2.5 transition-all ${
                      selectedRole === 'student'
                        ? 'bg-[#3FF2E6]/20 border-[#3FF2E6] text-[#E8F6FA] shadow-[0_0_12px_rgba(63,242,230,0.2)]'
                        : 'bg-[#071426]/60 border-white/10 text-[#8FA7B3] hover:border-white/20'
                    }`}
                  >
                    <User className="w-4 h-4 text-[#3FF2E6]" />
                    <div>
                      <div className="font-bold">Student Explorer</div>
                      <div className="text-[10px] text-[#8FA7B3]">Alex Vance</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('instructor');
                      setCallsign('Dr. Marina Chen');
                      setEmail('dr.chen@deepocean.ai');
                      SoundEffects.playClick();
                    }}
                    className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2.5 transition-all ${
                      selectedRole === 'instructor'
                        ? 'bg-[#9B7BFF]/25 border-[#9B7BFF] text-[#E8F6FA] shadow-[0_0_12px_rgba(155,123,255,0.2)]'
                        : 'bg-[#071426]/60 border-white/10 text-[#8FA7B3] hover:border-white/20'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-[#9B7BFF]" />
                    <div>
                      <div className="font-bold">Course Instructor</div>
                      <div className="text-[10px] text-[#8FA7B3]">Dr. Marina Chen</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Login Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-mono text-[#8FA7B3] block mb-1">
                    Explorer Identity:
                  </label>
                  <input
                    type="text"
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value)}
                    className="w-full bg-[#03060B] border border-[#3FF2E6]/30 rounded-xl px-3.5 py-2.5 text-xs text-[#E8F6FA] focus:outline-none focus:border-[#3FF2E6] font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[#8FA7B3] block mb-1">
                    Telemetry Frequency (Email):
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#03060B] border border-[#3FF2E6]/30 rounded-xl px-3.5 py-2.5 text-xs text-[#E8F6FA] focus:outline-none focus:border-[#3FF2E6] font-mono"
                  />
                </div>
              </div>

              {/* Primary Action Button: BEGIN DESCENT */}
              <button
                type="button"
                onClick={handleStartDive}
                className="w-full py-3.5 px-6 rounded-xl font-heading font-bold text-sm tracking-wide bg-gradient-to-r from-[#3FF2E6] to-[#5CC8FF] text-[#03060B] shadow-[0_0_20px_rgba(63,242,230,0.5)] hover:shadow-[0_0_30px_rgba(63,242,230,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>BEGIN EXPEDITION DESCENT</span>
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="relative z-20 w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#8FA7B3] border-t border-[#3FF2E6]/15 pt-3 gap-2">
        <div>PRIMARY SUBJECT: <span className="text-[#3FF2E6] font-semibold">{courseSubject}</span></div>
        <div className="flex items-center gap-4">
          <span>FOUR DEPTH ZONES (0M - 11,000M)</span>
          <span>● WEBGL 3D RUNTIME</span>
        </div>
      </div>
    </div>
  );
};
