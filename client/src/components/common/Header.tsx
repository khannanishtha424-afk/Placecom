import React, { useState } from 'react';
import { 
  Compass, 
  Volume2, 
  VolumeX, 
  Activity, 
  Layers, 
  Award, 
  User, 
  ShieldCheck, 
  Sparkles, 
  Flame, 
  Coins, 
  Eye, 
  Sliders, 
  Radio, 
  Menu, 
  X,
  FileCode,
  Anchor
} from 'lucide-react';
import { UserProfile } from '../../types/user';
import { DepthGauge } from './DepthGauge';
import { SoundEffects } from '../../services/audio';

export type ActiveScreen = 
  | 'bridge' 
  | 'reef-explorer' 
  | 'learning-chamber' 
  | 'mission-control' 
  | 'coral-knowledge' 
  | 'leviathan-exam' 
  | 'tidal-vortex' 
  | 'idea-currents' 
  | 'learning-dna' 
  | 'submersible-dock' 
  | 'instructor-studio';

interface HeaderProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  profile: UserProfile;
  onSwitchRole: (role: 'student' | 'instructor') => void;
  motionIntensity: 'off' | 'calm' | 'full';
  onChangeMotion: (intensity: 'off' | 'calm' | 'full') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  use2DFallback: boolean;
  onToggle2D: () => void;
  focusDiveMode: boolean;
  onToggleFocusDive: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  profile,
  onSwitchRole,
  motionIntensity,
  onChangeMotion,
  soundEnabled,
  onToggleSound,
  use2DFallback,
  onToggle2D,
  focusDiveMode,
  onToggleFocusDive
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navItems: { id: ActiveScreen; label: string; icon: React.ReactNode }[] = [
    { id: 'bridge', label: 'Ocean Bridge', icon: <Compass className="w-4 h-4" /> },
    { id: 'mission-control', label: 'Missions', icon: <Radio className="w-4 h-4" /> },
    { id: 'coral-knowledge', label: 'Coral Reef', icon: <Layers className="w-4 h-4" /> },
    { id: 'leviathan-exam', label: 'Leviathan Exam', icon: <Anchor className="w-4 h-4" /> },
    { id: 'tidal-vortex', label: 'Tidal Vortex', icon: <Activity className="w-4 h-4" /> },
    { id: 'idea-currents', label: 'Idea Currents', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'learning-dna', label: 'Learning DNA', icon: <FileCode className="w-4 h-4" /> },
    { id: 'submersible-dock', label: 'Submersible Dock', icon: <Award className="w-4 h-4" /> }
  ];

  return (
    <header className="sticky top-0 z-50 w-full submersible-glass border-b border-[#3FF2E6]/20 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { onNavigate('bridge'); SoundEffects.playClick(); }}
            className="flex items-center gap-2.5 group text-left"
          >
            <div className="relative w-8 h-8 rounded-lg bg-[#071426] border border-[#3FF2E6]/50 flex items-center justify-center group-hover:border-[#3FF2E6] transition-all shadow-[0_0_12px_rgba(63,242,230,0.3)]">
              <div className="w-3.5 h-3.5 rounded-full bg-[#3FF2E6] animate-pulse" />
              <div className="absolute inset-0 rounded-lg border border-[#5CC8FF]/30" />
            </div>
            <div>
              <div className="font-heading font-extrabold text-sm tracking-wider text-[#E8F6FA] flex items-center gap-1.5">
                <span>LUMINA</span>
                <span className="text-[#3FF2E6] font-mono font-medium text-xs">DEEP ACADEMY</span>
              </div>
              <div className="text-[10px] text-[#8FA7B3] font-mono hidden sm:block">
                Learn Beyond the Surface
              </div>
            </div>
          </button>

          {/* Depth Gauge */}
          <div className="hidden lg:block ml-2">
            <DepthGauge
              currentMeters={profile.currentDepthMeters}
              depthZone={profile.deepestZone}
            />
          </div>
        </div>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); SoundEffects.playClick(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-[#3FF2E6]/15 text-[#3FF2E6] border border-[#3FF2E6]/40 shadow-[0_0_10px_rgba(63,242,230,0.2)]'
                    : 'text-[#8FA7B3] hover:text-[#E8F6FA] hover:bg-[#071426]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Stats, Controls, Profile */}
        <div className="flex items-center gap-2.5">
          {/* XP & Credits Badges */}
          <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0A2A33] border border-[#3FF2E6]/30 text-[#3FF2E6]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{profile.xp.toLocaleString()} XP</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#071426] border border-[#FF6B9A]/30 text-[#FF6B9A]">
              <Flame className="w-3.5 h-3.5" />
              <span>{profile.streakDays}d Streak</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#071426] border border-[#7CFFB2]/30 text-[#7CFFB2]">
              <Coins className="w-3.5 h-3.5" />
              <span>{profile.credits} CR</span>
            </div>
          </div>

          {/* Instructor Studio Shortcut */}
          <button
            onClick={() => {
              if (profile.role === 'instructor') {
                onNavigate('instructor-studio');
              } else {
                onSwitchRole('instructor');
                onNavigate('instructor-studio');
              }
              SoundEffects.playClick();
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
              currentScreen === 'instructor-studio'
                ? 'bg-[#9B7BFF]/25 text-[#9B7BFF] border border-[#9B7BFF]'
                : 'bg-[#071426] text-[#9B7BFF] border border-[#9B7BFF]/30 hover:bg-[#9B7BFF]/15'
            }`}
            title="Open Instructor Studio"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Instructor Studio</span>
          </button>

          {/* Focus Dive Mode Toggle */}
          <button
            onClick={onToggleFocusDive}
            className={`p-1.5 rounded-lg border transition-all ${
              focusDiveMode
                ? 'bg-[#3FF2E6]/20 border-[#3FF2E6] text-[#3FF2E6]'
                : 'border-transparent text-[#8FA7B3] hover:text-[#E8F6FA] hover:bg-[#071426]'
            }`}
            title={focusDiveMode ? 'Disable Focus Dive' : 'Enable Focus Dive Mode (Calm Reading Backdrop)'}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleSound}
            className="p-1.5 rounded-lg text-[#8FA7B3] hover:text-[#E8F6FA] hover:bg-[#071426] transition-all"
            title={soundEnabled ? 'Mute Ocean Audio' : 'Unmute Ocean Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#3FF2E6]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Motion Light Intensity Dropdown / Settings */}
          <div className="relative">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-1.5 rounded-lg text-[#8FA7B3] hover:text-[#E8F6FA] hover:bg-[#071426] transition-all"
              title="Motion & Lighting Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-56 submersible-glass p-3 rounded-xl border border-[#3FF2E6]/30 shadow-xl z-50 text-xs font-mono animate-in fade-in">
                <div className="font-bold text-[#E8F6FA] mb-2 border-b border-[#3FF2E6]/20 pb-1 flex justify-between items-center">
                  <span>MOTION LIGHTS</span>
                  <span className="text-[10px] text-[#3FF2E6] uppercase">{motionIntensity}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 mb-3">
                  {(['off', 'calm', 'full'] as const).map((intensity) => (
                    <button
                      key={intensity}
                      onClick={() => { onChangeMotion(intensity); SoundEffects.playClick(); }}
                      className={`py-1 rounded text-center uppercase font-bold text-[10px] ${
                        motionIntensity === intensity
                          ? 'bg-[#3FF2E6] text-[#03060B]'
                          : 'bg-[#071426] text-[#8FA7B3] hover:text-white'
                      }`}
                    >
                      {intensity}
                    </button>
                  ))}
                </div>

                <div className="border-t border-[#3FF2E6]/20 pt-2 mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[#8FA7B3]">Engine:</span>
                    <button
                      onClick={onToggle2D}
                      className="px-2 py-0.5 rounded bg-[#0A2A33] border border-[#3FF2E6]/30 text-[#3FF2E6] hover:bg-[#3FF2E6]/20"
                    >
                      {use2DFallback ? '2D Sonar' : '3D WebGL'}
                    </button>
                  </div>
                </div>

                <div className="border-t border-[#3FF2E6]/20 pt-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#8FA7B3]">Role:</span>
                    <button
                      onClick={() => {
                        onSwitchRole(profile.role === 'student' ? 'instructor' : 'student');
                        SoundEffects.playClick();
                      }}
                      className="text-[#9B7BFF] hover:underline"
                    >
                      Switch to {profile.role === 'student' ? 'Instructor' : 'Student'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 rounded-lg text-[#8FA7B3] hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#3FF2E6]/20 mt-2 pt-2 px-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
                SoundEffects.playClick();
              }}
              className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 ${
                currentScreen === item.id
                  ? 'bg-[#3FF2E6]/20 text-[#3FF2E6] border border-[#3FF2E6]/40'
                  : 'text-[#8FA7B3] hover:bg-[#071426] hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
