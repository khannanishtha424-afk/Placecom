import React, { useEffect, useRef } from 'react';
import { Chapter } from '../../types/course';
import { SoundEffects } from '../../services/audio';

interface Ocean2DFallbackProps {
  chapters: Chapter[];
  selectedChapterId: string | null;
  onSelectChapter: (chapter: Chapter | null) => void;
  motionIntensity: 'off' | 'calm' | 'full';
  completedLessonIds: string[];
}

export const Ocean2DFallback: React.FC<Ocean2DFallbackProps> = ({
  chapters,
  selectedChapterId,
  onSelectChapter,
  motionIntensity,
  completedLessonIds
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += motionIntensity === 'off' ? 0.001 : motionIntensity === 'calm' ? 0.015 : 0.03;
      const w = canvas.width = canvas.parentElement?.clientWidth || 800;
      const h = canvas.height = canvas.parentElement?.clientHeight || 600;

      // Dark Oceanic Abyss Background
      ctx.fillStyle = '#03060B';
      ctx.fillRect(0, 0, w, h);

      // Sonar Grid Rings
      ctx.strokeStyle = 'rgba(63, 242, 230, 0.08)';
      ctx.lineWidth = 1;
      const centerX = w / 2;
      const centerY = h / 2;

      for (let r = 80; r < Math.max(w, h); r += 90) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Rotating Sonar Sweep Line
      if (motionIntensity !== 'off') {
        const sweepAngle = time * 0.8;
        ctx.strokeStyle = 'rgba(63, 242, 230, 0.18)';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(sweepAngle) * Math.max(w, h),
          centerY + Math.sin(sweepAngle) * Math.max(w, h)
        );
        ctx.stroke();
      }

      // Draw Depth Zone Bands
      const zones = [
        { name: 'TWILIGHT (0 - 200M)', y: h * 0.22, color: '#3FF2E6' },
        { name: 'MIDNIGHT (200 - 1000M)', y: h * 0.45, color: '#5CC8FF' },
        { name: 'ABYSSAL (1000 - 4000M)', y: h * 0.70, color: '#9B7BFF' },
        { name: 'HADAL TRENCH (4000 - 11000M)', y: h * 0.92, color: '#FF6B9A' }
      ];

      zones.forEach((z) => {
        ctx.fillStyle = z.color;
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.globalAlpha = 0.4;
        ctx.fillText(z.name, 24, z.y - 10);
        ctx.strokeStyle = z.color;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(20, z.y);
        ctx.lineTo(w - 20, z.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1.0;
      });

      // Chapter coordinates on 2D tactical map
      const positions = [
        { x: w * 0.28, y: h * 0.20 },
        { x: w * 0.72, y: h * 0.42 },
        { x: w * 0.35, y: h * 0.66 },
        { x: w * 0.68, y: h * 0.88 }
      ];

      // Draw Connecting Current Conduits
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(92, 200, 255, 0.3)';
      ctx.setLineDash([6, 8]);
      ctx.lineDashOffset = -time * 20;
      ctx.beginPath();
      positions.forEach((pos, idx) => {
        if (idx === 0) ctx.moveTo(pos.x, pos.y);
        else ctx.lineTo(pos.x, pos.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Reef Node Blips
      chapters.forEach((chap, idx) => {
        const pos = positions[idx] || { x: w * 0.5, y: h * 0.5 };
        const isSelected = selectedChapterId === chap.id;

        // Outer pulse
        const pulse = Math.sin(time * 3 + idx) * 4;
        ctx.fillStyle = chap.accentColor;
        ctx.globalAlpha = isSelected ? 0.4 : 0.2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 24 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Inner solid core
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = '#071426';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = chap.accentColor;
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#E8F6FA';
        ctx.font = 'bold 12px Sora, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`CH ${chap.number}: ${chap.reefName}`, pos.x, pos.y - 22);

        ctx.fillStyle = '#8FA7B3';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(`${chap.depthMeters}M · ${chap.difficulty}`, pos.x, pos.y + 30);
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [chapters, selectedChapterId, motionIntensity]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const w = canvas.width;
    const h = canvas.height;
    const positions = [
      { x: w * 0.28, y: h * 0.20 },
      { x: w * 0.72, y: h * 0.42 },
      { x: w * 0.35, y: h * 0.66 },
      { x: w * 0.68, y: h * 0.88 }
    ];

    chapters.forEach((chap, idx) => {
      const pos = positions[idx];
      const dist = Math.hypot(clickX - pos.x, clickY - pos.y);
      if (dist < 40) {
        SoundEffects.playSonarPing();
        onSelectChapter(chap);
      }
    });
  };

  return (
    <div className="relative w-full h-full cursor-pointer select-none">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full block"
      />
      <div className="absolute top-4 left-4 submersible-glass px-3 py-1.5 rounded text-xs font-mono text-[#3FF2E6]">
        [2D TACTICAL SONAR OVERVIEW ACTIVE]
      </div>
    </div>
  );
};
