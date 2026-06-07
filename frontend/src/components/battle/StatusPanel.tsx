import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import HealthBar from './HealthBar'
import EnergyBar from './EnergyBar'
import SkillIcon from './SkillIcon'
import { Shield, ArrowUp, ArrowDown, Flame, Snowflake, Zap, Heart } from 'lucide-react'
import type { FighterState, Buff } from '@/types'

interface StatusPanelProps {
  fighter: FighterState
  side: 'left' | 'right'
  isActive?: boolean
  className?: string
}

const getBuffIcon = (buffName: string) => {
  const name = buffName.toLowerCase()
  if (name.includes('attack') || name.includes('力') || name.includes('攻')) return Flame
  if (name.includes('defend') || name.includes('盾') || name.includes('防')) return Shield
  if (name.includes('speed') || name.includes('速') || name.includes('敏')) return Zap
  if (name.includes('heal') || name.includes('回') || name.includes('治')) return Heart
  if (name.includes('slow') || name.includes('减') || name.includes('冻')) return Snowflake
  if (name.includes('buff') || name.includes('增益')) return ArrowUp
  if (name.includes('debuff') || name.includes('减益')) return ArrowDown
  return ArrowUp
}

const getBuffColor = (buff: Buff) => {
  const isPositive = buff.value > 0
  if (buff.effect.includes('attack') || buff.effect.includes('damage')) {
    return isPositive ? '#ff6600' : '#666666'
  }
  if (buff.effect.includes('defend') || buff.effect.includes('defense')) {
    return isPositive ? '#0088ff' : '#666666'
  }
  if (buff.effect.includes('heal') || buff.effect.includes('regen')) {
    return isPositive ? '#00ff88' : '#666666'
  }
  if (buff.effect.includes('speed')) {
    return isPositive ? '#ffff00' : '#666666'
  }
  return isPositive ? '#00f5ff' : '#ff0044'
}

function BuffDisplay({ buff, side }: { buff: Buff; side: 'left' | 'right' }) {
  const Icon = getBuffIcon(buff.name)
  const color = getBuffColor(buff)
  
  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="relative group"
      title={`${buff.name}: ${buff.effect} ${buff.value > 0 ? '+' : ''}${buff.value}`}
    >
      <div
        className="w-6 h-6 rounded flex items-center justify-center border"
        style={{
          backgroundColor: `${color}20`,
          borderColor: `${color}60`
        }}
      >
        <Icon size={12} style={{ color }} />
      </div>
      <span
        className="absolute -bottom-1 -right-1 text-[8px] font-mono font-bold px-0.5 rounded"
        style={{ backgroundColor: color, color: '#000' }}
      >
        {buff.duration}
      </span>
    </motion.div>
  )
}

export default function StatusPanel({
  fighter,
  side,
  isActive = false,
  className
}: StatusPanelProps) {
  const isDefeated = fighter.hp <= 0
  
  return (
    <motion.div
      className={cn(
        'cyber-panel relative overflow-hidden',
        side === 'left' ? 'rounded-l-lg' : 'rounded-r-lg',
        isActive && 'ring-2 ring-[var(--cyber-neon-cyan)] ring-opacity-50',
        isDefeated && 'opacity-60 grayscale',
        className
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {isActive && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            boxShadow: [
              'inset 0 0 20px rgba(0, 245, 255, 0.1)',
              'inset 0 0 40px rgba(0, 245, 255, 0.2)',
              'inset 0 0 20px rgba(0, 245, 255, 0.1)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      <div className="cyber-panel-header flex items-center justify-between">
        <div className={cn(
          'flex items-center gap-3',
          side === 'right' && 'flex-row-reverse'
        )}>
          <motion.div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-lg',
              side === 'left' 
                ? 'bg-gradient-to-br from-[var(--cyber-neon-cyan)]/20 to-[var(--cyber-neon-blue)]/20 border border-[var(--cyber-neon-cyan)]'
                : 'bg-gradient-to-br from-[var(--cyber-neon-pink)]/20 to-[var(--cyber-neon-purple)]/20 border border-[var(--cyber-neon-pink)]'
            )}
            animate={isActive ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <span className={side === 'left' ? 'text-[var(--cyber-neon-cyan)]' : 'text-[var(--cyber-neon-pink)]'}>
              {side === 'left' ? 'P1' : 'P2'}
            </span>
          </motion.div>
          
          <div className={cn(side === 'right' && 'text-right')}>
            <h3 className="font-display font-bold text-white text-lg">
              {fighter.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-[var(--cyber-text-secondary)]">
              <span>ATK: {fighter.attack}</span>
              <span>DEF: {fighter.defense}</span>
              {fighter.isDefending && (
                <motion.span
                  className="flex items-center gap-1 text-[var(--cyber-neon-blue)]"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Shield size={12} />
                  防御中
                </motion.span>
              )}
            </div>
          </div>
        </div>
        
        {isDefeated && (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="font-display font-bold text-[var(--cyber-neon-red)] text-xl px-3 py-1 border border-[var(--cyber-neon-red)] bg-[var(--cyber-neon-red)]/10"
          >
            DEFEATED
          </motion.div>
        )}
      </div>
      
      <div className="p-4 space-y-3">
        <HealthBar
          currentHp={fighter.hp}
          maxHp={fighter.maxHp}
          side={side}
        />
        
        <EnergyBar
          currentEnergy={fighter.energy}
          maxEnergy={fighter.maxEnergy}
          side={side}
        />
        
        {fighter.buffs.length > 0 && (
          <div className="pt-2 border-t border-[var(--cyber-border)]">
            <div className={cn(
              'text-xs text-[var(--cyber-text-muted)] mb-2 font-mono',
              side === 'right' && 'text-right'
            )}>
              BUFF / DEBUFF
            </div>
            <div className={cn(
              'flex flex-wrap gap-1.5',
              side === 'right' && 'justify-end'
            )}>
              <AnimatePresence>
                {fighter.buffs.map((buff) => (
                  <BuffDisplay key={buff.id} buff={buff} side={side} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
        
        <div className="pt-2 border-t border-[var(--cyber-border)]">
          <div className={cn(
            'text-xs text-[var(--cyber-text-muted)] mb-2 font-mono',
            side === 'right' && 'text-right'
          )}>
            SKILLS
          </div>
          <div className={cn(
            'flex flex-wrap gap-6 justify-center',
            side === 'right' && 'flex-row-reverse'
          )}>
            {fighter.skills.map((skill) => (
              <SkillIcon
                key={skill.id}
                skill={skill}
                currentEnergy={fighter.energy}
                size="md"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
