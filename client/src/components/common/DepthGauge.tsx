import React from 'react';
import { Compass } from 'lucide-react';
import { DepthZone } from '../../types/course';

interface DepthGaugeProps {
  currentMeters: number;
  maxMeters?: number;
  depthZone: DepthZone;
}

export const DepthGauge: React.FC<DepthGaugeProps> = ({
  currentMeters,
  maxMeters = 11000,
  depthZone
}) => {
  // Atmospheric pressure increases ~1 atm every 10 meters
  const atmPressure = Math.round(1 + currentMeters / 10);
  const percentage = Math.min(100, (currentMeters / maxMeters) * 100);

  const zoneColors: Record<DepthZone, string> = {
    twilight: '#3FF2E6',
    midnight: '#5CC8FF',
    abyssal: '#9B7BFF',
    hadal: '#FF6B9A'
  };

  const currentColor = zoneColors[depthZone] || '#3FF2E6';

  return (
    <div className="flex items-center gap-3 submersible-glass px-3.5 py-1.5 rounded-full border border-[#3FF2E6]/20">
      <div className="relative w-7 h-7 flex items-center justify-center">
        {/* Circular Depth Progress */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="14"
            cy="14"
            r="11"
            stroke="#071426"
            strokeWidth="2.5"
            fill="none"
          />
          <circle
            cx="14"
            cy="14"
            r="11"
            stroke={currentColor}
            strokeWidth="2.5"
            strokeDasharray={69.1}
            strokeDashoffset={69.1 - (69.1 * percentage) / 100}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <Compass className="w-3.5 h-3.5 absolute text-[#E8F6FA]" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-bold text-[#E8F6FA]">
            {currentMeters.toLocaleString()}M
          </span>
          <span
            className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded font-semibold"
            style={{ backgroundColor: `${currentColor}22`, color: currentColor }}
          >
            {depthZone}
          </span>
        </div>
        <div className="text-[9px] text-[#8FA7B3] font-mono">
          Pressure: {atmPressure} ATM
        </div>
      </div>
    </div>
  );
};
