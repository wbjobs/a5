import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Zap } from 'lucide-react'

interface EnergyBarProps {
  currentEnergy: number
  maxEnergy: number
  side?: 'left' | 'right'
  showText?: boolean
  className?: string
}

export default function EnergyBar({
  currentEnergy,
  maxEnergy,
  side = 'left',
  showText = true,
  className
}: EnergyBarProps) {
  const [displayEnergy, setDisplayEnergy] = useState(currentEnergy)
  const [isPulsing, setIsPulsing] = useState(false)
  
  const percentage = Math.max(0, Math.min(100, (currentEnergy / maxEnergy) * 100))
  const displayPercentage = Math.max(0, Math.min(100, (displayEnergy / maxEnergy) * 100))
  const isFull = currentEnergy >= maxEnergy
  const isNearFull = currentEnergy >= maxEnergy * 0.8
  
  useEffect(() => {
    if (currentEnergy > displayEnergy) {
      setIsPulsing(true)
      const timer = setTimeout(() => setIsPulsing(false), 600)
      return () => clearTimeout(timer)
    }
  }, [currentEnergy, displayEnergy])
  
  useEffect(() => {
    const startValue = displayEnergy
    const endValue = currentEnergy
    const duration = 200
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(1, elapsed / duration)
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2
      const current = Math.round(startValue + (endValue - startValue) * easeProgress)
      setDisplayEnergy(current)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [currentEnergy])
  
  return (
    <div className={cn('relative w-full', className)}>
      <div className={cn(
        'flex items-center gap-2 mb-1',
        side === 'right' && 'flex-row-reverse'
      )}>
        <motion.div
          animate={isPulsing ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Zap
            size={14}
            className={cn(
              isFull ? 'text-[var(--energy-light)]' : 'text-[var(--energy-blue)]',
              isFull && 'animate-pulse-glow'
            )}
            style={{ color: isFull ? 'var(--energy-light)' : 'var(--energy-blue)' }}
          />
        </motion.div>
        
        {showText && (
          <div className={cn(
            'font-mono text-sm font-bold',
            isFull ? 'text-[var(--energy-light)]' : 'text-white',
            side === 'right' && 'text-right'
          )}>
            <AnimatePresence mode="wait">
              <motion.span
                key={displayEnergy}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.1 }}
              >
                {displayEnergy}
              </motion.span>
            </AnimatePresence>
            <span className="text-[var(--cyber-text-muted)]"> / {maxEnergy}</span>
          </div>
        )}
        
        <div className="flex-1" />
        
        {showText && (
          <motion.span
            key={Math.round(percentage)}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              'font-display text-xs font-bold',
              isFull ? 'text-[var(--energy-light)]' : 'text-[var(--energy-blue)]'
            )}
          >
            {Math.round(percentage)}%
          </motion.span>
        )}
      </div>
      
      <div className="relative h-3 overflow-hidden bg-[var(--cyber-bg-tertiary)] border border-[var(--cyber-border)]">
        <motion.div
          className="absolute inset-y-0"
          initial={false}
          animate={{
            [side === 'left' ? 'right' : 'left']: `${100 - displayPercentage}%`
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            [side === 'left' ? 'left' : 'right']: 0,
            background: `linear-gradient(${side === 'left' ? 'to right' : 'to left'}, var(--energy-blue), var(--energy-light))`,
            boxShadow: isNearFull
              ? `0 0 15px var(--energy-light), 0 0 30px var(--energy-blue), inset 0 0 10px rgba(255,255,255,0.3)`
              : `0 0 8px var(--energy-blue), inset 0 0 5px rgba(255,255,255,0.2)`
          }}
        />
        
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `repeating-linear-gradient(
              ${side === 'left' ? '90deg' : '-90deg'},
              transparent,
              transparent 6px,
              rgba(0, 136, 255, 0.3) 6px,
              rgba(0, 136, 255, 0.3) 12px
            )`
          }}
        />
        
        {isFull && (
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'linear-gradient(90deg, transparent 0%, rgba(0, 245, 255, 0.4) 50%, transparent 100%)',
                'linear-gradient(90deg, transparent 30%, rgba(0, 245, 255, 0.6) 50%, transparent 70%)',
                'linear-gradient(90deg, transparent 100%, rgba(0, 245, 255, 0.4) 50%, transparent 0%)'
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        )}
        
        {isPulsing && (
          <motion.div
            className="absolute inset-0 bg-white/60"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </div>
      
      {isFull && (
        <motion.div
          className="absolute -top-1 -bottom-1 -left-1 -right-1 pointer-events-none"
          animate={{
            boxShadow: [
              'inset 0 0 0 0 rgba(0, 245, 255, 0)',
              'inset 0 0 10px 2px rgba(0, 245, 255, 0.5)',
              'inset 0 0 0 0 rgba(0, 245, 255, 0)'
            ]
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </div>
  )
}
