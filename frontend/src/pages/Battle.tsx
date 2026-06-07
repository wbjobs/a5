import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBattleStore } from '@/store/battleStore'
import StatusPanel from '@/components/battle/StatusPanel'
import BehaviorTreeView from '@/components/battle/BehaviorTreeView'
import BattleLog from '@/components/battle/BattleLog'
import { Play, Pause, Square, RefreshCw, Trophy, Skull, Minus, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { NodeStatus, BattleEvent, FighterSide } from '@/types'

export default function Battle() {
  const navigate = useNavigate()
  const wsRef = useRef<WebSocket | null>(null)
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>({})
  const [executionPath, setExecutionPath] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  
  const {
    battleState,
    isConnected,
    isPaused,
    logs,
    ai1Tree,
    ai2Tree,
    startBattle,
    stopBattle,
    togglePause,
    updateState,
    addLog,
    connect,
    disconnect,
    setTrees
  } = useBattleStore()
  
  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data)
      
      if (data.type === 'state_update') {
        updateState(data.payload)
        
        if (data.payload.isFinished) {
          setShowResult(true)
        }
      } else if (data.type === 'battle_event') {
        const battleEvent = data.payload as BattleEvent
        addLog(battleEvent)
        
        if (battleEvent.type === 'node_result' && battleEvent.nodeId) {
          setNodeStatuses(prev => ({
            ...prev,
            [battleEvent.nodeId!]: battleEvent.nodeStatus || 'idle'
          }))
          
          if (battleEvent.nodeStatus === 'running') {
            setExecutionPath(prev => [...prev, battleEvent.nodeId!])
          }
        }
      } else if (data.type === 'trees') {
        setTrees(data.payload.ai1Tree, data.payload.ai2Tree)
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }, [updateState, addLog, setTrees])
  
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/battle`
    
    try {
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        connect()
      }
      
      wsRef.current.onmessage = handleWebSocketMessage
      
      wsRef.current.onclose = () => {
        disconnect()
      }
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        disconnect()
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect, disconnect, handleWebSocketMessage])
  
  const handleStartBattle = async () => {
    if (!ai1Tree || !ai2Tree) {
      alert('请先选择两个行为树进行对战')
      return
    }
    
    setNodeStatuses({})
    setExecutionPath([])
    setShowResult(false)
    
    await startBattle({
      ai1Tree,
      ai2Tree,
      maxRounds: 100
    })
  }
  
  const handleStopBattle = () => {
    stopBattle()
    setNodeStatuses({})
    setExecutionPath([])
    setShowResult(false)
  }
  
  const handleNewBattle = () => {
    setShowResult(false)
    setNodeStatuses({})
    setExecutionPath([])
    stopBattle()
    navigate('/editor')
  }
  
  const getResultIcon = (winner: FighterSide | null) => {
    if (winner === 'draw') return <Minus size={48} className="text-[var(--cyber-neon-yellow)]" />
    if (winner === 'ai1') return <Trophy size={48} className="text-[var(--cyber-neon-cyan)]" />
    if (winner === 'ai2') return <Trophy size={48} className="text-[var(--cyber-neon-pink)]" />
    return <Skull size={48} className="text-[var(--cyber-neon-red)]" />
  }
  
  const getResultText = (winner: FighterSide | null) => {
    if (winner === 'draw') return '平局'
    if (winner === 'ai1') return `${battleState?.ai1.name || 'AI-1'} 获胜！`
    if (winner === 'ai2') return `${battleState?.ai2.name || 'AI-2'} 获胜！`
    return '战斗结束'
  }
  
  const getResultColor = (winner: FighterSide | null) => {
    if (winner === 'draw') return 'var(--cyber-neon-yellow)'
    if (winner === 'ai1') return 'var(--cyber-neon-cyan)'
    if (winner === 'ai2') return 'var(--cyber-neon-pink)'
    return 'var(--cyber-neon-red)'
  }
  
  return (
    <div className="h-screen flex flex-col bg-[var(--cyber-bg-primary)] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 bg-[var(--cyber-bg-secondary)] border-b border-[var(--cyber-border)]">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-xl font-bold text-[var(--cyber-neon-cyan)] cyber-text-glow">
            ARENA // BATTLE
          </h1>
          
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-[var(--cyber-neon-green)] animate-pulse' : 'bg-[var(--cyber-neon-red)]'
            )} />
            <span className="font-mono text-xs text-[var(--cyber-text-secondary)]">
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
          
          {battleState && (
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-[var(--cyber-text-muted)]">ROUND</span>
              <span className="text-[var(--cyber-neon-yellow)] font-bold">{battleState.round}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!battleState?.isRunning ? (
            <button
              onClick={handleStartBattle}
              disabled={!isConnected || !ai1Tree || !ai2Tree}
              className="cyber-btn flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={16} />
              START BATTLE
            </button>
          ) : (
            <>
              <button
                onClick={togglePause}
                className="cyber-btn flex items-center gap-2"
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                {isPaused ? 'RESUME' : 'PAUSE'}
              </button>
              <button
                onClick={handleStopBattle}
                className="cyber-btn flex items-center gap-2 !border-[var(--cyber-neon-red)] !text-[var(--cyber-neon-red)]"
              >
                <Square size={16} />
                STOP
              </button>
            </>
          )}
        </div>
      </div>
      
      {battleState && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-[var(--cyber-bg-secondary)]/50 border-b border-[var(--cyber-border)]">
          <StatusPanel
            fighter={battleState.ai1}
            side="left"
            isActive={battleState.isRunning && !battleState.isPaused}
          />
          <StatusPanel
            fighter={battleState.ai2}
            side="right"
            isActive={battleState.isRunning && !battleState.isPaused}
          />
        </div>
      )}
      
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-[var(--cyber-border)]">
          <BehaviorTreeView
            ai1Tree={ai1Tree}
            ai2Tree={ai2Tree}
            ai1CurrentNodeId={battleState?.ai1CurrentNodeId}
            ai2CurrentNodeId={battleState?.ai2CurrentNodeId}
            executionPath={executionPath}
            nodeStatuses={nodeStatuses}
          />
        </div>
        <div className="w-96 flex flex-col min-h-0">
          <BattleLog events={logs} />
        </div>
      </div>
      
      <AnimatePresence>
        {showResult && battleState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative cyber-panel p-8 max-w-md w-full mx-4 text-center"
              style={{
                borderColor: getResultColor(battleState.winner),
                boxShadow: `0 0 50px ${getResultColor(battleState.winner)}40`
              }}
            >
              <button
                onClick={() => setShowResult(false)}
                className="absolute top-4 right-4 text-[var(--cyber-text-muted)] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                className="flex justify-center mb-4"
              >
                {getResultIcon(battleState.winner)}
              </motion.div>
              
              <h2
                className="font-display text-3xl font-bold mb-2"
                style={{ color: getResultColor(battleState.winner) }}
              >
                {getResultText(battleState.winner)}
              </h2>
              
              <p className="font-mono text-[var(--cyber-text-secondary)] mb-6">
                战斗结束于第 {battleState.round} 回合
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-[var(--cyber-bg-tertiary)] border border-[var(--cyber-border)]">
                  <div className="text-xs font-mono text-[var(--cyber-text-muted)] mb-1">AI-1 HP</div>
                  <div className="font-mono text-xl font-bold text-[var(--cyber-neon-cyan)]">
                    {battleState.ai1.hp} / {battleState.ai1.maxHp}
                  </div>
                </div>
                <div className="p-4 bg-[var(--cyber-bg-tertiary)] border border-[var(--cyber-border)]">
                  <div className="text-xs font-mono text-[var(--cyber-text-muted)] mb-1">AI-2 HP</div>
                  <div className="font-mono text-xl font-bold text-[var(--cyber-neon-pink)]">
                    {battleState.ai2.hp} / {battleState.ai2.maxHp}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleStopBattle}
                  className="flex-1 cyber-btn flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  再来一局
                </button>
                <button
                  onClick={handleNewBattle}
                  className="flex-1 cyber-btn flex items-center justify-center gap-2 !border-[var(--cyber-neon-purple)] !text-[var(--cyber-neon-purple)]"
                >
                  编辑行为树
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
