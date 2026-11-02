import React, { useState } from 'react';
import { 
  Award, 
  Coins, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Lock, 
  Flame, 
  Compass, 
  Wind, 
  Zap,
  Eye
} from 'lucide-react';
import { UserProfile, UserProgress, SubmersiblePart, SubmersiblePartCategory } from '../../types/user';
import { INITIAL_SUBMERSIBLE_PARTS } from '../../data/initialSubmersibles';
import { SoundEffects } from '../../services/audio';

interface SubmersibleDockViewProps {
  profile: UserProfile;
  progress: UserProgress;
  onEquipPart: (category: SubmersiblePartCategory, partId: string) => void;
  onUnlockPart: (partId: string, costCredits: number) => void;
}

export const SubmersibleDockView: React.FC<SubmersibleDockViewProps> = ({
  profile,
  progress,
  onEquipPart,
  onUnlockPart
}) => {
  const [activeCategory, setActiveCategory] = useState<SubmersiblePartCategory>('hull');

  const filteredParts = INITIAL_SUBMERSIBLE_PARTS.filter(
    (p) => p.category === activeCategory
  );

  const equippedPartId =
    activeCategory === 'hull'
      ? progress.submersible.hullId
      : activeCategory === 'propulsion'
      ? progress.submersible.propulsionId
      : activeCategory === 'tool'
      ? progress.submersible.toolId
      : activeCategory === 'trail'
      ? progress.submersible.trailId
      : progress.submersible.themeId;

  const handleEquip = (part: SubmersiblePart) => {
    SoundEffects.playClick();
    onEquipPart(part.category, part.id);
  };

  const handlePurchase = (part: SubmersiblePart) => {
    if (profile.credits < part.costCredits) return;
    SoundEffects.playSuccess();
    onUnlockPart(part.id, part.costCredits);
  };

  const activeHull = INITIAL_SUBMERSIBLE_PARTS.find(
    (p) => p.id === progress.submersible.hullId
  ) || INITIAL_SUBMERSIBLE_PARTS[0];

  return (
    <div className="relative min-h-[calc(100vh-62px)] bg-[#03060B] text-[#E8F6FA] p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#3FF2E6] mb-1">
              <Award className="w-4 h-4 animate-pulse" />
              <span>SUBMERSIBLE DRYDOCK & OUTFITTING HANGAR</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#E8F6FA]">
              Submersible Customization Dock
            </h1>
            <p className="text-xs text-[#8FA7B3]">
              Upgrade hulls, propulsion systems, sonar arrays, and bioluminescent wake trails earned through lesson mastery.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#071426] border border-[#7CFFB2]/40 text-[#7CFFB2] font-bold">
              <Coins className="w-4 h-4" />
              <span>{profile.credits} Research Credits</span>
            </div>
          </div>
        </div>

        {/* 3D Drydock Submersible Hologram Preview Card */}
        <div className="submersible-glass p-6 sm:p-8 rounded-3xl border border-[#3FF2E6]/30 shadow-2xl relative overflow-hidden bg-gradient-to-b from-[#071426] to-[#03060B]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Visual Schematic of Submersible */}
            <div className="relative h-56 sm:h-64 flex items-center justify-center border border-white/10 rounded-2xl bg-[#03060B]/70 overflow-hidden">
              {/* Radial Drydock Ring */}
              <div className="absolute w-48 h-48 rounded-full border border-[#3FF2E6]/25 animate-spin" style={{ animationDuration: '24s' }} />
              <div className="absolute w-36 h-36 rounded-full border border-[#5CC8FF]/20" />

              {/* Submersible Visual Silhouette */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className="w-32 h-16 rounded-full border-2 shadow-2xl flex items-center justify-center relative transition-all"
                  style={{
                    backgroundColor: '#071426',
                    borderColor: activeHull.accentColor || '#3FF2E6',
                    boxShadow: `0 0 25px ${activeHull.accentColor || '#3FF2E6'}44`
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-[#3FF2E6]/30 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-[#3FF2E6] animate-pulse" />
                  </div>
                  {/* Thruster Jets */}
                  <div className="absolute -left-3 w-4 h-8 rounded-l-lg bg-[#0A2A33] border-l-2 border-[#5CC8FF]" />
                  {/* Sonar Dome */}
                  <div className="absolute -right-2 w-4 h-6 rounded-r-full bg-[#3FF2E6]/40" />
                </div>
                <div className="font-mono text-xs text-[#E8F6FA] font-bold mt-4 tracking-wider">
                  {activeHull.name.toUpperCase()}
                </div>
                <div className="text-[10px] font-mono text-[#3FF2E6]">
                  {activeHull.bonusStat}
                </div>
              </div>

              {/* Grid Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#3FF2E608_1px,transparent_1px),linear-gradient(to_bottom,#3FF2E608_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            {/* Current Active Submersible Loadout */}
            <div className="space-y-4">
              <div className="text-xs font-mono text-[#3FF2E6] uppercase tracking-wider">
                CURRENT EXPEDITION CONFIGURATION
              </div>
              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#071426] border border-white/10 flex justify-between items-center">
                  <span className="text-[#8FA7B3]">Pressurized Hull:</span>
                  <span className="text-[#3FF2E6] font-bold">{activeHull.name}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#071426] border border-white/10 flex justify-between items-center">
                  <span className="text-[#8FA7B3]">Propulsion Drive:</span>
                  <span className="text-[#5CC8FF] font-bold">Magnetohydrodynamic</span>
                </div>
                <div className="p-3 rounded-xl bg-[#071426] border border-white/10 flex justify-between items-center">
                  <span className="text-[#8FA7B3]">Sensor Array:</span>
                  <span className="text-[#9B7BFF] font-bold">Multibeam Sonar</span>
                </div>
                <div className="p-3 rounded-xl bg-[#071426] border border-white/10 flex justify-between items-center">
                  <span className="text-[#8FA7B3]">Wake Trail:</span>
                  <span className="text-[#7CFFB2] font-bold">Cyan Plankton Wake</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-white/10 gap-2 overflow-x-auto text-xs font-mono">
          {(['hull', 'propulsion', 'tool', 'trail', 'theme'] as SubmersiblePartCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); SoundEffects.playClick(); }}
              className={`px-4 py-2.5 font-bold capitalize border-b-2 transition-all ${
                activeCategory === cat
                  ? 'border-[#3FF2E6] text-[#3FF2E6]'
                  : 'border-transparent text-[#8FA7B3] hover:text-white'
              }`}
            >
              {cat}s
            </button>
          ))}
        </div>

        {/* Parts Marketplace / Inventory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredParts.map((part) => {
            const isUnlocked = progress.inventory.includes(part.id);
            const isEquipped = equippedPartId === part.id;
            const canAfford = profile.credits >= part.costCredits;

            return (
              <div
                key={part.id}
                className={`submersible-glass p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isEquipped
                    ? 'border-[#3FF2E6] shadow-[0_0_15px_rgba(63,242,230,0.3)]'
                    : isUnlocked
                    ? 'border-white/15 hover:border-white/30'
                    : 'border-white/10 opacity-70'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] uppercase text-[#8FA7B3]">
                      Level {part.levelRequired} Req
                    </span>
                    {isEquipped ? (
                      <span className="text-[#3FF2E6] font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Equipped
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[#7CFFB2]">Owned</span>
                    ) : (
                      <span className="text-[#FF6B9A] flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> {part.costCredits} CR
                      </span>
                    )}
                  </div>

                  <h4 className="font-heading font-bold text-sm text-[#E8F6FA]">
                    {part.name}
                  </h4>
                  <p className="text-xs text-[#8FA7B3] leading-relaxed">
                    {part.description}
                  </p>

                  {part.bonusStat && (
                    <div className="text-[11px] font-mono text-[#3FF2E6]">
                      {part.bonusStat}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-white/10">
                  {isEquipped ? (
                    <button
                      disabled
                      className="w-full py-2 rounded-xl bg-[#3FF2E6]/20 border border-[#3FF2E6]/50 text-xs font-mono text-[#3FF2E6] font-bold"
                    >
                      Currently Active
                    </button>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleEquip(part)}
                      className="w-full py-2 rounded-xl bg-[#0A2A33] hover:bg-[#3FF2E6]/20 border border-[#3FF2E6]/40 text-xs font-mono text-[#3FF2E6] font-bold transition-all"
                    >
                      Equip Module
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePurchase(part)}
                      disabled={!canAfford}
                      className="w-full py-2 rounded-xl bg-[#071426] hover:bg-[#FF6B9A]/20 border border-[#FF6B9A]/40 text-xs font-mono text-[#FF6B9A] font-bold disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Unlock ({part.costCredits} CR)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Explorer Achievements Wall */}
        <div className="submersible-glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4 mt-6">
          <h3 className="font-heading font-bold text-lg text-[#E8F6FA] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#FF6B9A]" />
            <span>Submersible Achievement Decals & Accreditations</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#071426] border border-[#3FF2E6]/40 text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#3FF2E6]/20 flex items-center justify-center text-[#3FF2E6]">
                <Compass className="w-5 h-5" />
              </div>
              <div className="font-bold text-xs text-[#E8F6FA]">First Dive</div>
              <div className="text-[10px] text-[#8FA7B3]">Passed first mission</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#071426] border border-[#7CFFB2]/40 text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#7CFFB2]/20 flex items-center justify-center text-[#7CFFB2]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="font-bold text-xs text-[#E8F6FA]">Perfect Synapse</div>
              <div className="text-[10px] text-[#8FA7B3]">100% on any quiz</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#071426] border border-[#9B7BFF]/40 text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#9B7BFF]/20 flex items-center justify-center text-[#9B7BFF]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="font-bold text-xs text-[#E8F6FA]">Abyssal Navigator</div>
              <div className="text-[10px] text-[#8FA7B3]">Reached 2,000M depth</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#071426] border border-[#FF6B9A]/40 text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#FF6B9A]/20 flex items-center justify-center text-[#FF6B9A]">
                <Zap className="w-5 h-5" />
              </div>
              <div className="font-bold text-xs text-[#E8F6FA]">Leviathan Whisperer</div>
              <div className="text-[10px] text-[#8FA7B3]">Conquered Boss Exam</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
