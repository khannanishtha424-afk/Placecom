import React from 'react';
import { Chapter } from '../../types/course';
import { Radio } from 'lucide-react';

interface SonarMinimapProps {
  chapters: Chapter[];
  selectedChapterId: string | null;
  onSelectChapter: (chapter: Chapter) => void;
  currentDepth: number;
}

export const SonarMinimap: React.FC<SonarMinimapProps> = ({
  chapters,
  selectedChapterId,
  onSelectChapter,
  currentDepth
}) => {
  return (
    <div className="submersible-glass p-3 rounded-2xl border border-[#3FF2E6]/25 w-44">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#3FF2E6]">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>SONAR RADAR</span>
        </div>
        <div className="text-[9px] font-mono text-[#8FA7B3]">
          ACTIVE 360°
        </div>
      </div>

      {/* Radar Scope */}
      <div className="relative w-full aspect-square rounded-full border border-[#3FF2E6]/30 bg-[#03060B]/80 overflow-hidden flex items-center justify-center">
        {/* Radar Rings */}
        <div className="absolute inset-2 rounded-full border border-[#3FF2E6]/15" />
        <div className="absolute inset-6 rounded-full border border-[#3FF2E6]/20" />
        <div className="absolute inset-10 rounded-full border border-[#3FF2E6]/25" />

        {/* Crosshairs */}
        <div className="absolute w-full h-[1px] bg-[#3FF2E6]/15" />
        <div className="absolute h-full w-[1px] bg-[#3FF2E6]/15" />

        {/* Center Submersible Blip */}
        <div className="w-2.5 h-2.5 rounded-full bg-[#3FF2E6] shadow-[0_0_8px_#3FF2E6] animate-pulse z-10" />

        {/* Reef Blips */}
        {chapters.map((chap, idx) => {
          const angles = [Math.PI * 0.25, Math.PI * 0.85, Math.PI * 1.35, Math.PI * 1.8];
          const radius = 24 + idx * 8;
          const angle = angles[idx] || 0;
          const x = 50 + Math.cos(angle) * (radius / 1.6);
          const y = 50 + Math.sin(angle) * (radius / 1.6);
          const isSelected = selectedChapterId === chap.id;

          return (
            <button
              key={chap.id}
              onClick={() => onSelectChapter(chap)}
              style={{ left: `${x}%`, top: `${y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-150 z-20 ${isSelected ? 'scale-125' : ''}`}
              title={`Ch ${chap.number}: ${chap.reefName}`}
            >
              <div
                className="w-2 h-2 rounded-full ring-2 ring-[#03060B]"
                style={{
                  backgroundColor: chap.accentColor,
                  boxShadow: `0 0 6px ${chap.accentColor}`
                }}
              />
            </button>
          );
        })}
      </div>
      <div className="text-[9px] text-center font-mono text-[#8FA7B3] mt-1.5">
        Click blip to navigate reef
      </div>
    </div>
  );
};
