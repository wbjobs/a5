import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Sword,
  Shield,
  Heart,
  Zap,
  Flame,
  Skull,
  GitBranch,
  Play,
  Pause,
  Filter,
  X,
  ChevronDown
} from 'lucide-react'
import type { BattleEvent, EventType } from '@/types'

interface BattleLogProps {
  events: BattleEvent[]
  className?: string
}

const eventConfig: Record<EventType, { icon: typeof Sword; color: string; label: string }> = {
  attack: { icon: Sword, color: '#ff6600', label: 'ATTACK' },
  skill: { icon: Zap, color: '#ff00ff', label: 'SKILL' },
  defend: { icon: Shield, color: '#0088ff', label: 'DEFEND' },
  heal: { icon: Heart, color: '#00ff88', label: 'HEAL' },
  buff: { icon: Flame, color: '#ffff00', label: 'BUFF' },
  damage: { icon: Flame, color: '#ff0044', label: 'DAMAGE' },
  death: { icon: Skull, color: '#ff0044', label: 'DEATH' },
  node_result: { icon: GitBranch, color: '#00f5ff', label: 'NODE' }
}

interface LogEntryProps {
  event: BattleEvent
  index: number
}

function LogEntry({ event, index }: LogEntryProps) {
  const config = eventConfig[event.type]
  const Icon = config.icon
  
  const sideColor = event.side === 'ai1' ? '#00f5ff' : event.side === 'ai2' ? '#ff00ff' : '#606060'
  const sideLabel = event.side === 'ai1' ? 'AI-1' : event.side === 'ai2' ? 'AI-2' : 'SYS'
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className="relative pl-8 pb-3 group"
    >
      <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--cyber-border)]" />
      
      <div
        className="absolute left-0 top-1 w-2 h-2 -translate-x-1/2 rounded-full"
        style={{ backgroundColor: config.color, boxShadow: `0 0 8px ${config.color}` }}
      />
      
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="font-mono text-[10px] text-[var(--cyber-text-muted)] w-12">
            FRAME {event.timestamp}
          </span>
          <span
            className="font-mono text-[10px] px-1.5 py-0.5 rounded font-bold"
            style={{ backgroundColor: `${sideColor}30`, color: sideColor }}
          >
            {sideLabel}
          </span>
          <span
            className="font-mono text-[10px] px-1.5 py-0.5 rounded font-bold"
            style={{ backgroundColor: `${config.color}30`, color: config.color }}
          >
            {config.label}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Icon size={12} style={{ color: config.color }} />
            <span className="font-mono text-sm text-[var(--cyber-text-primary)]">
              {event.message}
            </span>
          </div>
          
          {event.data && Object.keys(event.data).length > 0 && (
            <div className="mt-1 ml-4 font-mono text-[10px] text-[var(--cyber-text-muted)]">
              {Object.entries(event.data).map(([key, value]) => (
                <span key={key} className="mr-3">
                  <span className="text-[var(--cyber-text-secondary)]">{key}:</span>{' '}
                  {JSON.stringify(value)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function BattleLog({ events, className }: BattleLogProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Set<EventType>>(new Set())
  
  const filteredEvents = useCallback(() => {
    if (activeFilters.size === 0) return events
    return events.filter(e => activeFilters.has(e.type))
  }, [events, activeFilters])
  
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [events, autoScroll])
  
  const toggleFilter = (type: EventType) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }
  
  const clearAllFilters = () => {
    setActiveFilters(new Set())
  }
  
  const displayedEvents = filteredEvents()
  
  return (
    <div className={cn('flex flex-col h-full cyber-panel', className)}>
      <div className="cyber-panel-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>BATTLE LOG</span>
          <span className="text-[10px] font-mono text-[var(--cyber-text-muted)]">
            {displayedEvents.length} / {events.length} entries
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAutoScroll(!autoScroll)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 text-xs font-mono border transition-colors',
              autoScroll
                ? 'border-[var(--cyber-neon-green)] text-[var(--cyber-neon-green)] bg-[var(--cyber-neon-green)]/10'
                : 'border-[var(--cyber-border)] text-[var(--cyber-text-secondary)]'
            )}
          >
            {autoScroll ? <Play size={12} /> : <Pause size={12} />}
            {autoScroll ? 'AUTO' : 'PAUSED'}
          </motion.button>
          
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 text-xs font-mono border transition-colors',
                activeFilters.size > 0
                  ? 'border-[var(--cyber-neon-purple)] text-[var(--cyber-neon-purple)] bg-[var(--cyber-neon-purple)]/10'
                  : 'border-[var(--cyber-border)] text-[var(--cyber-text-secondary)]'
              )}
            >
              <Filter size={12} />
              FILTER
              {activeFilters.size > 0 && (
                <span className="w-4 h-4 flex items-center justify-center rounded-full bg-[var(--cyber-neon-purple)] text-[var(--cyber-bg-primary)] text-[10px] font-bold">
                  {activeFilters.size}
                </span>
              )}
              <ChevronDown
                size={12}
                className={cn('transition-transform', showFilters && 'rotate-180')}
              />
            </motion.button>
            
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="absolute right-0 top-full mt-1 z-20 min-w-[180px] bg-[var(--cyber-bg-secondary)] border border-[var(--cyber-border)] shadow-lg"
                >
                  <div className="p-2 space-y-1">
                    {(Object.keys(eventConfig) as EventType[]).map((type) => {
                      const config = eventConfig[type]
                      const isActive = activeFilters.has(type)
                      const Icon = config.icon
                      
                      return (
                        <button
                          key={type}
                          onClick={() => toggleFilter(type)}
                          className={cn(
                            'w-full flex items-center gap-2 px-2 py-1.5 text-xs font-mono transition-colors',
                            isActive
                              ? 'bg-[var(--cyber-bg-tertiary)]'
                              : 'hover:bg-[var(--cyber-bg-tertiary)]/50'
                          )}
                        >
                          <div
                            className={cn(
                              'w-3 h-3 rounded border flex items-center justify-center',
                              isActive
                                ? 'border-[var(--cyber-neon-cyan)] bg-[var(--cyber-neon-cyan)]/20'
                                : 'border-[var(--cyber-border)]'
                            )}
                          >
                            {isActive && (
                              <div className="w-1.5 h-1.5 rounded bg-[var(--cyber-neon-cyan)]" />
                            )}
                          </div>
                          <Icon size={12} style={{ color: config.color }} />
                          <span style={{ color: isActive ? config.color : 'var(--cyber-text-secondary)' }}>
                            {config.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  
                  {activeFilters.size > 0 && (
                    <div className="p-2 border-t border-[var(--cyber-border)]">
                      <button
                        onClick={clearAllFilters}
                        className="w-full flex items-center justify-center gap-1 px-2 py-1 text-xs font-mono text-[var(--cyber-text-muted)] hover:text-[var(--cyber-neon-red)] transition-colors"
                      >
                        <X size={12} />
                        CLEAR ALL
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4"
        onWheel={() => {
          if (containerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
            if (!isAtBottom && autoScroll) {
              setAutoScroll(false)
            }
          }
        }}
      >
        {displayedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--cyber-text-muted)]">
            <div className="font-mono text-sm">NO EVENTS</div>
            <div className="text-xs mt-1">Waiting for battle to start...</div>
          </div>
        ) : (
          <div className="space-y-1">
            {displayedEvents.map((event, index) => (
              <LogEntry key={event.id} event={event} index={index} />
            ))}
          </div>
        )}
      </div>
      
      {!autoScroll && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            setAutoScroll(true)
            if (containerRef.current) {
              containerRef.current.scrollTop = containerRef.current.scrollHeight
            }
          }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 font-mono text-xs bg-[var(--cyber-bg-tertiary)] border border-[var(--cyber-neon-cyan)] text-[var(--cyber-neon-cyan)] hover:bg-[var(--cyber-neon-cyan)]/10 transition-colors"
        >
          <Play size={12} />
          RESUME AUTO-SCROLL
        </motion.button>
      )}
    </div>
  )
}
