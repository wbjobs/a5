import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ExecutionStackFrame, BTNodeType, NodeStatus } from '@/types'
import { ChevronRight, Clock, Layers } from 'lucide-react'
import { useState } from 'react'

interface ExecutionStackViewProps {
  executionStack: ExecutionStackFrame[]
  onNodeClick?: (nodeId: string) => void
  className?: string
}

const nodeIcons: Record<BTNodeType, string> = {
  selector: '?',
  sequence: '→',
  condition: '◈',
  action: '⚡'
}

const nodeColors: Record<BTNodeType, string> = {
  selector: '#9d4edd',
  sequence: '#00f5d4',
  condition: '#00bbf9',
  action: '#ff006e'
}

const statusColors: Record<NodeStatus, { bg: string; text: string; glow: string }> = {
  idle: {
    bg: 'bg-gray-600/30',
    text: 'text-gray-400',
    glow: ''
  },
  running: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    glow: 'shadow-[0_0_12px_rgba(250,204,21,0.5)]'
  },
  success: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    glow: 'shadow-[0_0_12px_rgba(74,222,128,0.5)]'
  },
  failure: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    glow: 'shadow-[0_0_12px_rgba(239,68,68,0.5)]'
  }
}

const nodeTypeLabels: Record<BTNodeType, string> = {
  selector: '选择器',
  sequence: '顺序器',
  condition: '条件',
  action: '动作'
}

interface StackItemProps {
  frame: ExecutionStackFrame
  isLast: boolean
  onNodeClick?: (nodeId: string) => void
  expandedNodes: Set<string>
  toggleExpand: (nodeId: string) => void
}

function StackItem({ frame, isLast, onNodeClick, expandedNodes, toggleExpand }: StackItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const statusStyle = statusColors[frame.status]
  const nodeColor = nodeColors[frame.nodeType]
  const isRunning = frame.status === 'running'
  const hasChildren = !isLast && expandedNodes.has(frame.nodeId)

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const timeStr = date.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    const ms = Math.floor(date.getMilliseconds() / 10).toString().padStart(2, '0')
    return `${timeStr}.${ms}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      style={{ paddingLeft: `${frame.depth * 16}px` }}
      className="relative"
    >
      {frame.depth > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 w-px"
          style={{
            background: `linear-gradient(180deg, ${nodeColor}40 0%, ${nodeColor}10 100%)`,
            marginLeft: `${(frame.depth - 1) * 16 + 8}px`
          }}
        />
      )}

      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onNodeClick?.(frame.nodeId)}
        className={cn(
          'relative flex items-center gap-2 p-2 rounded cursor-pointer',
          'transition-all duration-200 border',
          statusStyle.bg,
          isRunning && 'animate-pulse-glow',
          statusStyle.glow,
          isHovered && 'bg-white/5'
        )}
        style={{
          borderColor: isRunning ? nodeColor : `${nodeColor}30`,
          marginLeft: frame.depth > 0 ? '8px' : '0'
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {frame.depth > 0 && (
          <ChevronRight
            size={12}
            className="absolute -left-2 text-gray-500"
            style={{ marginLeft: `${(frame.depth - 1) * 16}px` }}
          />
        )}

        <motion.div
          className={cn(
            'flex-shrink-0 w-7 h-7 rounded flex items-center justify-center text-sm font-bold',
            statusStyle.text
          )}
          style={{
            backgroundColor: `${nodeColor}20`,
            color: nodeColor,
            boxShadow: `0 0 8px ${nodeColor}40`
          }}
          animate={isRunning ? {
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8]
          } : {}}
          transition={isRunning ? {
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut'
          } : {}}
        >
          {nodeIcons[frame.nodeType]}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-mono tracking-wider"
              style={{ color: nodeColor }}
            >
              {nodeTypeLabels[frame.nodeType].toUpperCase()}
            </span>
            <span className={cn('text-xs font-mono', statusStyle.text)}>
              {frame.status.toUpperCase()}
            </span>
          </div>
          <div className={cn('text-sm font-medium truncate', statusStyle.text)}>
            {frame.nodeId}
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <Layers size={10} />
            <span className="font-mono">D{frame.depth}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-600">
            <Clock size={10} />
            <span className="font-mono">{formatTime(frame.timestamp)}</span>
          </div>
        </div>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50"
            >
              <div
                className="px-3 py-2 rounded text-xs whitespace-nowrap"
                style={{
                  backgroundColor: 'rgba(10, 10, 15, 0.95)',
                  border: `1px solid ${nodeColor}60`,
                  boxShadow: `0 0 20px ${nodeColor}30`
                }}
              >
                <div className="font-mono text-gray-400">节点ID: <span style={{ color: nodeColor }}>{frame.nodeId}</span></div>
                <div className="font-mono text-gray-400">类型: <span style={{ color: nodeColor }}>{nodeTypeLabels[frame.nodeType]}</span></div>
                <div className="font-mono text-gray-400">状态: <span className={statusStyle.text}>{frame.status}</span></div>
                <div className="font-mono text-gray-400">深度: <span className="text-white">{frame.depth}</span></div>
                <div className="font-mono text-gray-400">时间: <span className="text-white">{formatTime(frame.timestamp)}</span></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className="absolute top-0 left-0 right-0 h-px opacity-50"
          style={{ background: `linear-gradient(90deg, transparent 0%, ${nodeColor} 50%, transparent 100%)` }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px opacity-50"
          style={{ background: `linear-gradient(90deg, transparent 0%, ${nodeColor} 50%, transparent 100%)` }}
        />
      </motion.div>
    </motion.div>
  )
}

export default function ExecutionStackView({ executionStack, onNodeClick, className }: ExecutionStackViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  const toggleAll = () => {
    if (isExpanded) {
      setExpandedNodes(new Set())
    } else {
      setExpandedNodes(new Set(executionStack.map(f => f.nodeId)))
    }
    setIsExpanded(!isExpanded)
  }

  const currentNodeId = executionStack.length > 0 ? executionStack[executionStack.length - 1].nodeId : null

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="cyber-panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-[var(--cyber-neon-purple)]" />
          <span className="text-[var(--cyber-neon-purple)]">EXECUTION STACK</span>
          <span className="px-2 py-0.5 text-[10px] font-mono bg-[var(--cyber-neon-purple)]/20 text-[var(--cyber-neon-purple)] rounded">
            {executionStack.length} FRAMES
          </span>
        </div>
        <button
          onClick={toggleAll}
          className="text-[10px] font-mono text-[var(--cyber-text-muted)] hover:text-[var(--cyber-neon-cyan)] transition-colors"
        >
          {isExpanded ? 'COLLAPSE ALL' : 'EXPAND ALL'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {executionStack.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--cyber-text-muted)]">
            <Layers size={32} className="mb-2 opacity-30" />
            <div className="font-mono text-sm">NO EXECUTION DATA</div>
            <div className="text-xs mt-1">等待战斗开始...</div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {executionStack.map((frame, index) => (
              <StackItem
                key={`${frame.nodeId}-${frame.timestamp}-${index}`}
                frame={frame}
                isLast={index === executionStack.length - 1}
                onNodeClick={onNodeClick}
                expandedNodes={expandedNodes}
                toggleExpand={toggleExpand}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {currentNodeId && (
        <div className="px-3 py-2 bg-[var(--cyber-bg-tertiary)] border-t border-[var(--cyber-border)]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--cyber-text-muted)]">当前执行节点</span>
            <span className="font-mono text-[var(--cyber-neon-yellow)] animate-pulse">
              {currentNodeId}
            </span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 5px currentColor, 0 0 10px currentColor;
          }
          50% {
            box-shadow: 0 0 15px currentColor, 0 0 25px currentColor;
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
