import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Sword, Shield, Heart, Zap, Clock, Sparkles } from 'lucide-react'
import type { SkillState } from '@/types'

interface SkillIconProps {
  skill: SkillState
  currentEnergy: number
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const getSkillIcon = (skillName: string) => {
  const name = skillName.toLowerCase()
  if (name.includes('attack') || name.includes('斩') || name.includes('击')) return Sword
  if (name.includes('defend') || name.includes('盾') || name.includes('防')) return Shield
  if (name.includes('heal') || name.includes('治') || name.includes('回')) return Heart
  if (name.includes('charge') || name.includes('蓄') || name.includes('电')) return Zap
  if (name.includes('skill') || name.includes('技') || name.includes('必杀')) return Sparkles
  return Sword
}

const getSkillColor = (skillName: string) => {
  const name = skillName.toLowerCase()
  if (name.includes('attack') || name.includes('斩') || name.includes('击')) 
    return { primary: '#ff6600', secondary: '#ff3300', glow: 'rgba(255, 102, 0, 0.6)' }
  if (name.includes('defend') || name.includes('盾') || name.includes('防')) 
    return { primary: '#0088ff', secondary: '#0055cc', glow: 'rgba(0, 136, 255, 0.6)' }
  if (name.includes('heal') || name.includes('治') || name.includes('回')) 
    return { primary: '#00ff88', secondary: '#00cc6a', glow: 'rgba(0, 255, 136, 0.6)' }
  if (name.includes('charge') || name.includes('蓄') || name.includes('电')) 
    return { primary: '#ffff00', secondary: '#ffcc00', glow: 'rgba(255, 255, 0, 0.6)' }
  if (name.includes('skill') || name.includes('技') || name.includes('必杀')) 
    return { primary: '#ff00ff', secondary: '#cc00cc', glow: 'rgba(255, 0, 255, 0.6)' }
  return { primary: '#ff6600', secondary: '#ff3300', glow: 'rgba(255, 102, 0, 0.6)' }
}

export default function SkillIcon({
  skill,
  currentEnergy,
  onClick,
  size = 'md',
  className
}: SkillIconProps) {
  const Icon = getSkillIcon(skill.name)
  const colors = getSkillColor(skill.name)
  
  const isOnCooldown = skill.cooldown > 0
  const hasEnergy = currentEnergy >= skill.energyCost
  const isReady = !isOnCooldown && hasEnergy
  const cooldownProgress = skill.maxCooldown > 0 
    ? (skill.cooldown / skill.maxCooldown) * 100 
    : 0
  
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-18 h-18'
  }
  
  const iconSizes = {
    sm: 16,
    md: 22,
    lg: 28
  }
  
  const svgSize = size === 'sm' ? 40 : size === 'md' ? 56 : 72
  const center = svgSize / 2
  const radius = center - 4
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = (cooldownProgress / 100) * circumference
  
  return (
    <motion.div
      className={cn(
        'relative cursor-pointer select-none',
        sizeClasses[size],
        className
      )}
      whileHover={isReady ? { scale: 1.1 } : {}}
      whileTap={isReady ? { scale: 0.95 } : {}}
      onClick={isReady ? onClick : undefined}
    >
      <svg
        width={svgSize}
        height={svgSize}
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id={`grad-${skill.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>
          <filter id={`glow-${skill.id}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="var(--cyber-bg-tertiary)"
          stroke="var(--cyber-border)"
          strokeWidth="2"
        />
        
        {isReady && (
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#grad-${skill.id})`}
            strokeWidth="2"
            filter={`url(#glow-${skill.id})`}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        {isOnCooldown && (
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--cyber-neon-yellow)"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            initial={false}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.3 }}
          />
        )}
      </svg>
      
      <div
        className={cn(
          'absolute inset-1 rounded-full flex items-center justify-center transition-all duration-300',
          isReady && 'cyber-glow'
        )}
        style={{
          background: isReady 
            ? `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}30)` 
            : 'var(--cyber-bg-tertiary)',
          border: `2px solid ${isReady ? colors.primary : 'var(--cyber-border)'}`
        }}
      >
        <Icon
          size={iconSizes[size]}
          style={{
            color: isReady ? colors.primary : 'var(--cyber-text-muted)',
            filter: isReady ? `drop-shadow(0 0 6px ${colors.glow})` : 'none'
          }}
        />
      </div>
      
      {!hasEnergy && !isOnCooldown && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gray-900/70 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Zap size={iconSizes[size] * 0.7} className="text-gray-500" />
        </motion.div>
      )}
      
      {isOnCooldown && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="flex items-center gap-0.5 bg-black/80 px-1.5 py-0.5 rounded">
            <Clock size={10} className="text-[var(--cyber-neon-yellow)]" />
            <span className="font-mono text-xs font-bold text-[var(--cyber-neon-yellow)]">
              {skill.cooldown}
            </span>
          </div>
        </motion.div>
      )}
      
      {isReady && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
          style={{ backgroundColor: colors.primary }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.5, 1],
            boxShadow: [
              `0 0 0 0 ${colors.glow}`,
              `0 0 0 4px transparent`,
              `0 0 0 0 transparent`
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="font-mono text-[10px] text-[var(--cyber-text-secondary)]">
          {skill.energyCost}
        </span>
        <Zap size={10} className="inline text-[var(--cyber-neon-blue)] ml-0.5" />
      </div>
    </motion.div>
  )
}
