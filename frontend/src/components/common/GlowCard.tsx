import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  color?: 'cyan' | 'pink' | 'purple' | 'green' | 'yellow' | 'red' | 'blue';
  hoverGlow?: boolean;
  pulse?: boolean;
}

const colorMap = {
  cyan: {
    border: 'rgba(0, 245, 255, 0.3)',
    glow: 'rgba(0, 245, 255, 0.5)',
    bg: 'rgba(0, 245, 255, 0.05)',
    hoverBg: 'rgba(0, 245, 255, 0.1)',
  },
  pink: {
    border: 'rgba(255, 0, 255, 0.3)',
    glow: 'rgba(255, 0, 255, 0.5)',
    bg: 'rgba(255, 0, 255, 0.05)',
    hoverBg: 'rgba(255, 0, 255, 0.1)',
  },
  purple: {
    border: 'rgba(157, 0, 255, 0.3)',
    glow: 'rgba(157, 0, 255, 0.5)',
    bg: 'rgba(157, 0, 255, 0.05)',
    hoverBg: 'rgba(157, 0, 255, 0.1)',
  },
  green: {
    border: 'rgba(0, 255, 136, 0.3)',
    glow: 'rgba(0, 255, 136, 0.5)',
    bg: 'rgba(0, 255, 136, 0.05)',
    hoverBg: 'rgba(0, 255, 136, 0.1)',
  },
  yellow: {
    border: 'rgba(255, 255, 0, 0.3)',
    glow: 'rgba(255, 255, 0, 0.5)',
    bg: 'rgba(255, 255, 0, 0.05)',
    hoverBg: 'rgba(255, 255, 0, 0.1)',
  },
  red: {
    border: 'rgba(255, 0, 68, 0.3)',
    glow: 'rgba(255, 0, 68, 0.5)',
    bg: 'rgba(255, 0, 68, 0.05)',
    hoverBg: 'rgba(255, 0, 68, 0.1)',
  },
  blue: {
    border: 'rgba(0, 136, 255, 0.3)',
    glow: 'rgba(0, 136, 255, 0.5)',
    bg: 'rgba(0, 136, 255, 0.05)',
    hoverBg: 'rgba(0, 136, 255, 0.1)',
  },
};

export default function GlowCard({
  children,
  className,
  color = 'cyan',
  hoverGlow = true,
  pulse = false,
}: GlowCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      whileHover={hoverGlow ? { scale: 1.02 } : undefined}
      className={cn(
        'relative rounded-lg border backdrop-blur-sm overflow-hidden',
        pulse && 'animate-pulse-neon',
        className
      )}
      style={{
        borderColor: colors.border,
        backgroundColor: colors.bg,
        boxShadow: pulse
          ? `0 0 20px ${colors.glow}, inset 0 0 20px ${colors.glow}30`
          : `0 0 10px ${colors.glow}30, inset 0 0 10px ${colors.glow}10`,
      }}
    >
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${colors.glow}10 0%, transparent 50%, ${colors.glow}10 100%)`,
        }}
        data-hover-glow
      />
      
      <div
        className="absolute top-0 left-0 w-full h-px opacity-50"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${colors.glow} 50%, transparent 100%)`,
        }}
      />
      
      <div
        className="absolute bottom-0 left-0 w-full h-px opacity-50"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${colors.glow} 50%, transparent 100%)`,
        }}
      />
      
      <div className="relative z-10">
        {children}
      </div>
      
      <style>{`
        [data-hover-glow]:hover {
          opacity: 1;
        }
      `}</style>
    </motion.div>
  );
}
