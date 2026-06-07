import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HealthBarProps {
  currentHp: number
  maxHp: number
  side?: 'left' | 'right'
  showText?: boolean
  className?: string
}

export default function HealthBar({
  currentHp,
  maxHp,
  side = 'left',
  showText = true,
  className
}: HealthBarProps) {
  const [displayHp, setDisplayHp] = useState(currentHp)
  const [trailingHp, setTrailingHp] = useState(currentHp)
  
  const percentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100))
  const displayPercentage = Math.max(0, Math.min(100, (displayHp / maxHp) * 100))
  const trailingPercentage = Math.max(0, Math.min(100, (trailingHp / maxHp) * 100))
  
  const getGradientColors = (pct: number) => {
    if (pct > 60) return ['#00ff88', '#00cc6a']
    if (pct > 30) return ['#ffff00', '#ffcc00']
    return ['#ff0044', '#cc0033']
  }
  
  const [colorStart, colorEnd] = getGradientColors(percentage)
  
  useEffect(() => {
    const startValue = displayHp
    const endValue = currentHp
    const duration = 300
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(1, elapsed / duration)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValue + (endValue - startValue) * easeProgress)
      setDisplayHp(current)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [currentHp])
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setTrailingHp(currentHp)
    }, 200)
    return () => clearTimeout(timer)
  }, [currentHp])
  
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }
  
  return (
    <div className={cn('relative w-full', className)}>
      <div className={cn(
        'flex items-center gap-2 mb-1',
        side === 'right' && 'flex-row-reverse'
      )}>
        {showText && (
          <motion.div
            key={displayHp}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'font-mono text-sm font-bold',
              percentage <= 30 ? 'text-[var(--hp-red)]' : 'text-white',
              percentage <= 30 && 'animate-pulse'
            )}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={displayHp}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
              >
                {formatNumber(displayHp)}
              </motion.span>
            </AnimatePresence>
            <span className="text-[var(--cyber-text-muted)]"> / {formatNumber(maxHp)}</span>
          </motion.div>
        )}
        <div className="flex-1" />
        {showText && (
          <motion.span
            key={Math.round(percentage)}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-display text-xs font-bold text-[var(--cyber-neon-cyan)]"
          >
            {Math.round(percentage)}%
          </motion.span>
        )}
      </div>
      
      <div className="relative h-4 overflow-hidden bg-[var(--cyber-bg-tertiary)] border border-[var(--cyber-border)]">
        <motion.div
          className="absolute inset-y-0 bg-gradient-to-r from-[var(--hp-red)]/30 to-[var(--hp-yellow)]/20"
          initial={false}
          animate={{
            [side === 'left' ? 'right' : 'left']: `${100 - trailingPercentage}%`
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            [side === 'left' ? 'left' : 'right']: 0
          }}
        />
        
        <motion.div
          className="absolute inset-y-0"
          initial={false}
          animate={{
            [side === 'left' ? 'right' : 'left']: `${100 - displayPercentage}%`
          }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{
            [side === 'left' ? 'left' : 'right']: 0,
            background: `linear-gradient(${side === 'left' ? 'to right' : 'to left'}, ${colorStart}, ${colorEnd})`,
            boxShadow: `0 0 10px ${colorStart}50, inset 0 0 5px ${colorStart}30`
          }}
        />
        
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `repeating-linear-gradient(
              ${side === 'left' ? '90deg' : '-90deg'},
              transparent,
              transparent 8px,
              rgba(255,255,255,0.1) 8px,
              rgba(255,255,255,0.1) 16px
            )`
          }}
        />
        
        <motion.div
          className="absolute top-0 bottom-0 w-1 bg-white/80"
          initial={false}
          animate={{
            [side === 'left' ? 'left' : 'right']: `calc(${displayPercentage}% - 4px)`
          }}
          transition={{ duration: 0.15 }}
          style={{
            boxShadow: '0 0 10px rgba(255,255,255,0.8)'
          }}
        />
      </div>
      
      {currentHp < maxHp * 0.3 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            boxShadow: [
              'inset 0 0 0 0 rgba(255, 0, 68, 0)',
              'inset 0 0 20px 5px rgba(255, 0, 68, 0.3)',
              'inset 0 0 0 0 rgba(255, 0, 68, 0)'
            ]
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </div>
  )
}
