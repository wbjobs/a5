import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import ExecutionStackView from './ExecutionStackView'
import type { ExecutionStackFrame, BattleState } from '@/types'
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Clock,
  Film,
  User,
  Bug,
  Zap
} from 'lucide-react'

interface DebuggerPanelProps {
  isOpen: boolean
  onToggle: () => void
  isPaused: boolean
  stepMode: boolean
  executionSpeed: number
  executionStack: ExecutionStackFrame[]
  battleState: BattleState | null
  onPause: () => void
  onResume: () => void
  onStep: () => void
  onReset: () => void
  onSpeedChange: (speed: number) => void
  onStepModeChange: (enabled: boolean) => void
  onNodeClick?: (nodeId: string) => void
  className?: string
}

const speedOptions = [0.25, 0.5, 1, 2, 4]

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const millis = Math.floor((ms % 1000) / 10)
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`
}

export default function DebuggerPanel({
  isOpen,
  onToggle,
  isPaused,
  stepMode,
  executionSpeed,
  executionStack,
  battleState,
  onPause,
  onResume,
  onStep,
  onReset,
  onSpeedChange,
  onStepModeChange,
  onNodeClick,
  className
}: DebuggerPanelProps) {
  const [activeTab, setActiveTab] = useState<'stack' | 'info'>('stack')

  const elapsedTime = useMemo(() => {
    if (!battleState) return 0
    return battleState.frame * 16.67
  }, [battleState])

  return (
    <>
      <motion.button
        onClick={onToggle}
        className={cn(
          'absolute top-1/2 -translate-y-1/2 z-30',
          'w-8 h-20 flex items-center justify-center',
          'bg-[var(--cyber-bg-secondary)] border border-[var(--cyber-border)]',
          'transition-all duration-300 hover:bg-[var(--cyber-bg-tertiary)]',
          'group'
        )}
        style={{
          right: isOpen ? '400px' : '0',
          borderRight: 'none',
          borderRadius: '8px 0 0 8px'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex flex-col items-center gap-1">
          <Bug
            size={16}
            className="text-[var(--cyber-neon-purple)] group-hover:animate-pulse"
          />
          {isOpen ? (
            <ChevronRight size={14} className="text-[var(--cyber-text-muted)]" />
          ) : (
            <ChevronLeft size={14} className="text-[var(--cyber-text-muted)]" />
          )}
        </div>

        {!isOpen && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              background: 'linear-gradient(270deg, rgba(157, 0, 255, 0.1) 0%, transparent 100%)',
              boxShadow: '0 0 20px rgba(157, 0, 255, 0.3)'
            }}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'absolute right-0 top-0 bottom-0 w-[400px] z-20',
              'bg-[var(--cyber-bg-primary)] border-l border-[var(--cyber-border)]',
              'flex flex-col overflow-hidden',
              className
            )}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-50"
              style={{
                background: 'radial-gradient(ellipse at top right, rgba(157, 0, 255, 0.05) 0%, transparent 50%)'
              }}
            />

            <div className="relative z-10 px-4 py-3 bg-[var(--cyber-bg-secondary)] border-b border-[var(--cyber-border)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bug size={18} className="text-[var(--cyber-neon-purple)]" />
                  <span className="font-display font-bold text-[var(--cyber-neon-purple)] tracking-wider">
                    DEBUGGER
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    'px-2 py-0.5 text-[10px] font-mono rounded',
                    stepMode
                      ? 'bg-[var(--cyber-neon-yellow)]/20 text-[var(--cyber-neon-yellow)]'
                      : 'bg-[var(--cyber-text-muted)]/20 text-[var(--cyber-text-muted)]'
                  )}>
                    {stepMode ? 'STEP MODE' : 'LIVE'}
                  </span>
                </div>
              </div>

              {battleState && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-[var(--cyber-bg-tertiary)] rounded border border-[var(--cyber-border)]">
                    <div className="flex items-center gap-1 text-[10px] text-[var(--cyber-text-muted)] mb-1">
                      <Film size={10} />
                      <span>FRAME</span>
                    </div>
                    <div className="font-mono text-lg font-bold text-[var(--cyber-neon-cyan)]">
                      {battleState.frame}
                    </div>
                  </div>
                  <div className="p-2 bg-[var(--cyber-bg-tertiary)] rounded border border-[var(--cyber-border)]">
                    <div className="flex items-center gap-1 text-[10px] text-[var(--cyber-text-muted)] mb-1">
                      <Clock size={10} />
                      <span>TIME</span>
                    </div>
                    <div className="font-mono text-lg font-bold text-[var(--cyber-neon-green)]">
                      {formatTime(elapsedTime)}
                    </div>
                  </div>
                  <div className="p-2 bg-[var(--cyber-bg-tertiary)] rounded border border-[var(--cyber-border)]">
                    <div className="flex items-center gap-1 text-[10px] text-[var(--cyber-text-muted)] mb-1">
                      <User size={10} />
                      <span>STEP</span>
                    </div>
                    <div className="font-mono text-lg font-bold text-[var(--cyber-neon-pink)]">
                      {battleState.currentStep || 0}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative z-10 px-4 py-3 bg-[var(--cyber-bg-secondary)]/50 border-b border-[var(--cyber-border)]">
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={isPaused ? onResume : onPause}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2 rounded',
                    'font-display font-semibold text-sm tracking-wider',
                    'border transition-all duration-300',
                    isPaused
                      ? 'bg-[var(--cyber-neon-green)]/10 border-[var(--cyber-neon-green)] text-[var(--cyber-neon-green)] hover:bg-[var(--cyber-neon-green)]/20'
                      : 'bg-[var(--cyber-neon-yellow)]/10 border-[var(--cyber-neon-yellow)] text-[var(--cyber-neon-yellow)] hover:bg-[var(--cyber-neon-yellow)]/20'
                  )}
                  style={{
                    boxShadow: isPaused
                      ? '0 0 15px rgba(0, 255, 136, 0.3)'
                      : '0 0 15px rgba(255, 255, 0, 0.3)'
                  }}
                >
                  {isPaused ? <Play size={16} /> : <Pause size={16} />}
                  {isPaused ? 'RESUME' : 'PAUSE'}
                </button>

                <button
                  onClick={onStep}
                  disabled={!isPaused && !stepMode}
                  className={cn(
                    'flex items-center justify-center gap-2 px-4 py-2 rounded',
                    'font-display font-semibold text-sm tracking-wider',
                    'border transition-all duration-300',
                    isPaused || stepMode
                      ? 'bg-[var(--cyber-neon-cyan)]/10 border-[var(--cyber-neon-cyan)] text-[var(--cyber-neon-cyan)] hover:bg-[var(--cyber-neon-cyan)]/20'
                      : 'bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed'
                  )}
                  style={{
                    boxShadow: (isPaused || stepMode) ? '0 0 15px rgba(0, 245, 255, 0.3)' : 'none'
                  }}
                >
                  <StepForward size={16} />
                  STEP
                </button>

                <button
                  onClick={onReset}
                  className={cn(
                    'flex items-center justify-center gap-2 px-4 py-2 rounded',
                    'font-display font-semibold text-sm tracking-wider',
                    'border transition-all duration-300',
                    'bg-[var(--cyber-neon-red)]/10 border-[var(--cyber-neon-red)] text-[var(--cyber-neon-red)] hover:bg-[var(--cyber-neon-red)]/20'
                  )}
                  style={{ boxShadow: '0 0 15px rgba(255, 0, 68, 0.3)' }}
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge size={12} className="text-[var(--cyber-neon-purple)]" />
                  <span className="text-[10px] font-mono text-[var(--cyber-text-muted)]">SPEED</span>
                </div>
                <div className="flex items-center gap-1">
                  {speedOptions.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => onSpeedChange(speed)}
                      className={cn(
                        'px-2 py-1 text-[10px] font-mono rounded border transition-all duration-200',
                        executionSpeed === speed
                          ? 'bg-[var(--cyber-neon-purple)]/20 border-[var(--cyber-neon-purple)] text-[var(--cyber-neon-purple)]'
                          : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-400'
                      )}
                      style={{
                        boxShadow: executionSpeed === speed
                          ? '0 0 10px rgba(157, 0, 255, 0.3)'
                          : 'none'
                      }}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stepMode}
                    onChange={(e) => onStepModeChange(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      'w-8 h-4 rounded-full transition-all duration-300 relative',
                      stepMode
                        ? 'bg-[var(--cyber-neon-yellow)]/30 border border-[var(--cyber-neon-yellow)]'
                        : 'bg-gray-800 border border-gray-700'
                    )}
                    style={{
                      boxShadow: stepMode ? '0 0 10px rgba(255, 255, 0, 0.3)' : 'none'
                    }}
                  >
                    <motion.div
                      className={cn(
                        'absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full',
                        stepMode ? 'bg-[var(--cyber-neon-yellow)]' : 'bg-gray-600'
                      )}
                      animate={{ left: stepMode ? '18px' : '2px' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[var(--cyber-text-muted)]">
                    STEP MODE
                  </span>
                </label>
              </div>
            </div>

            <div className="relative z-10 flex border-b border-[var(--cyber-border)]">
              <button
                onClick={() => setActiveTab('stack')}
                className={cn(
                  'flex-1 px-4 py-2 text-[10px] font-mono font-bold tracking-wider transition-all duration-300',
                  activeTab === 'stack'
                    ? 'text-[var(--cyber-neon-purple)] bg-[var(--cyber-neon-purple)]/10'
                    : 'text-[var(--cyber-text-muted)] hover:text-[var(--cyber-text-secondary)]'
                )}
              >
                EXECUTION STACK
              </button>
              <button
                onClick={() => setActiveTab('info')}
                className={cn(
                  'flex-1 px-4 py-2 text-[10px] font-mono font-bold tracking-wider transition-all duration-300',
                  activeTab === 'info'
                    ? 'text-[var(--cyber-neon-purple)] bg-[var(--cyber-neon-purple)]/10'
                    : 'text-[var(--cyber-text-muted)] hover:text-[var(--cyber-text-secondary)]'
                )}
              >
                FIGHTER INFO
              </button>
            </div>

            <div className="relative z-10 flex-1 overflow-hidden min-h-0">
              <AnimatePresence mode="wait">
                {activeTab === 'stack' ? (
                  <motion.div
                    key="stack"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <ExecutionStackView
                      executionStack={executionStack}
                      onNodeClick={onNodeClick}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full overflow-y-auto p-3"
                  >
                    {battleState ? (
                      <div className="space-y-3">
                        <div
                          className="p-3 rounded border"
                          style={{
                            backgroundColor: 'rgba(0, 245, 255, 0.05)',
                            borderColor: 'rgba(0, 245, 255, 0.3)',
                            boxShadow: '0 0 10px rgba(0, 245, 255, 0.1)'
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Zap size={12} className="text-[var(--cyber-neon-cyan)]" />
                            <span className="text-[11px] font-mono font-bold text-[var(--cyber-neon-cyan)]">
                              {battleState.ai1.name}
                            </span>
                          </div>
                          <div className="space-y-1 text-[10px] font-mono">
                            <div className="flex justify-between">
                              <span className="text-gray-500">HP</span>
                              <span className="text-[var(--cyber-neon-green)]">
                                {battleState.ai1.hp} / {battleState.ai1.maxHp}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Energy</span>
                              <span className="text-[var(--cyber-neon-blue)]">
                                {battleState.ai1.energy} / {battleState.ai1.maxEnergy}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Position</span>
                              <span className="text-white">
                                ({battleState.ai1.x?.toFixed(1) || 0}, {battleState.ai1.y?.toFixed(1) || 0})
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Velocity</span>
                              <span className="text-white">
                                ({battleState.ai1.vx?.toFixed(2) || 0}, {battleState.ai1.vy?.toFixed(2) || 0})
                              </span>
                            </div>
                          </div>
                        </div>

                        <div
                          className="p-3 rounded border"
                          style={{
                            backgroundColor: 'rgba(255, 0, 255, 0.05)',
                            borderColor: 'rgba(255, 0, 255, 0.3)',
                            boxShadow: '0 0 10px rgba(255, 0, 255, 0.1)'
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Zap size={12} className="text-[var(--cyber-neon-pink)]" />
                            <span className="text-[11px] font-mono font-bold text-[var(--cyber-neon-pink)]">
                              {battleState.ai2.name}
                            </span>
                          </div>
                          <div className="space-y-1 text-[10px] font-mono">
                            <div className="flex justify-between">
                              <span className="text-gray-500">HP</span>
                              <span className="text-[var(--cyber-neon-green)]">
                                {battleState.ai2.hp} / {battleState.ai2.maxHp}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Energy</span>
                              <span className="text-[var(--cyber-neon-blue)]">
                                {battleState.ai2.energy} / {battleState.ai2.maxEnergy}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Position</span>
                              <span className="text-white">
                                ({battleState.ai2.x?.toFixed(1) || 0}, {battleState.ai2.y?.toFixed(1) || 0})
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Velocity</span>
                              <span className="text-white">
                                ({battleState.ai2.vx?.toFixed(2) || 0}, {battleState.ai2.vy?.toFixed(2) || 0})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-[var(--cyber-text-muted)]">
                        <Bug size={32} className="mb-2 opacity-30" />
                        <div className="font-mono text-sm">NO BATTLE DATA</div>
                        <div className="text-xs mt-1">等待战斗开始...</div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              className="absolute top-0 left-0 w-full h-px"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, var(--cyber-neon-purple) 50%, transparent 100%)',
                opacity: 0.5
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-full h-px"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, var(--cyber-neon-purple) 50%, transparent 100%)',
                opacity: 0.5
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
