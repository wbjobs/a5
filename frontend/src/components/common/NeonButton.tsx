import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';

type MotionButtonProps = Omit<HTMLMotionProps<'button'>, 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'>;

interface NeonButtonProps extends MotionButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, {
  border: string;
  text: string;
  bg: string;
  hoverBg: string;
  glow: string;
  hoverGlow: string;
}> = {
  primary: {
    border: '#00f5ff',
    text: '#00f5ff',
    bg: 'rgba(0, 245, 255, 0.1)',
    hoverBg: 'rgba(0, 245, 255, 0.2)',
    glow: '0 0 10px rgba(0, 245, 255, 0.3)',
    hoverGlow: '0 0 20px rgba(0, 245, 255, 0.6), 0 0 40px rgba(0, 245, 255, 0.3)',
  },
  secondary: {
    border: '#9d00ff',
    text: '#9d00ff',
    bg: 'rgba(157, 0, 255, 0.1)',
    hoverBg: 'rgba(157, 0, 255, 0.2)',
    glow: '0 0 10px rgba(157, 0, 255, 0.3)',
    hoverGlow: '0 0 20px rgba(157, 0, 255, 0.6), 0 0 40px rgba(157, 0, 255, 0.3)',
  },
  danger: {
    border: '#ff0044',
    text: '#ff0044',
    bg: 'rgba(255, 0, 68, 0.1)',
    hoverBg: 'rgba(255, 0, 68, 0.2)',
    glow: '0 0 10px rgba(255, 0, 68, 0.3)',
    hoverGlow: '0 0 20px rgba(255, 0, 68, 0.6), 0 0 40px rgba(255, 0, 68, 0.3)',
  },
  success: {
    border: '#00ff88',
    text: '#00ff88',
    bg: 'rgba(0, 255, 136, 0.1)',
    hoverBg: 'rgba(0, 255, 136, 0.2)',
    glow: '0 0 10px rgba(0, 255, 136, 0.3)',
    hoverGlow: '0 0 20px rgba(0, 255, 136, 0.6), 0 0 40px rgba(0, 255, 136, 0.3)',
  },
};

export default function NeonButton({
  children,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  onClick,
  ...props
}: NeonButtonProps) {
  const styles = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.05 } : undefined}
      whileTap={!isDisabled ? { scale: 0.95 } : undefined}
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
      className={cn(
        'relative px-6 py-2.5 font-display font-semibold uppercase tracking-wider',
        'border rounded transition-all duration-300 overflow-hidden',
        'flex items-center justify-center gap-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        fullWidth && 'w-full',
        className
      )}
      style={{
        borderColor: styles.border,
        color: styles.text,
        backgroundColor: styles.bg,
        boxShadow: styles.glow,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.boxShadow = styles.hoverGlow;
          e.currentTarget.style.backgroundColor = styles.hoverBg;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = styles.glow;
        e.currentTarget.style.backgroundColor = styles.bg;
      }}
      {...props}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, ${styles.border}20, transparent)`,
        }}
        data-shimmer
      />
      
      <div
        className="absolute top-0 left-0 w-full h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${styles.border} 50%, transparent 100%)`,
        }}
      />
      
      <div
        className="absolute bottom-0 left-0 w-full h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${styles.border} 50%, transparent 100%)`,
        }}
      />

      <div className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        {!loading && leftIcon}
        <span className="text-sm">{children}</span>
        {!loading && rightIcon}
      </div>
    </motion.button>
  );
}
