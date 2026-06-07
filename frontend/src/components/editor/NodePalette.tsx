import React from 'react'
import { motion } from 'framer-motion'
import { GitBranch, ArrowRightLeft, CircleAlert, Zap } from 'lucide-react'
import { BTNodeType } from '../../types'

interface NodeCardProps {
  type: BTNodeType
  label: string
  icon: React.ReactNode
  color: string
  borderColor: string
  glowColor: string
  description: string
}

const nodeTypes: NodeCardProps[] = [
  {
    type: 'selector',
    label: '选择器',
    icon: <GitBranch className="w-6 h-6" />,
    color: 'from-cyan-500/20 to-cyan-600/10',
    borderColor: 'border-cyan-400/50',
    glowColor: 'shadow-cyan-500/30',
    description: '顺序执行子节点，成功则返回',
  },
  {
    type: 'sequence',
    label: '序列器',
    icon: <ArrowRightLeft className="w-6 h-6" />,
    color: 'from-purple-500/20 to-purple-600/10',
    borderColor: 'border-purple-400/50',
    glowColor: 'shadow-purple-500/30',
    description: '顺序执行子节点，失败则返回',
  },
  {
    type: 'condition',
    label: '条件',
    icon: <CircleAlert className="w-6 h-6" />,
    color: 'from-yellow-500/20 to-yellow-600/10',
    borderColor: 'border-yellow-400/50',
    glowColor: 'shadow-yellow-500/30',
    description: '判断条件，分支执行',
  },
  {
    type: 'action',
    label: '动作',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-pink-500/20 to-pink-600/10',
    borderColor: 'border-pink-400/50',
    glowColor: 'shadow-pink-500/30',
    description: '执行具体战斗动作',
  },
]

export const NodePalette: React.FC = () => {
  const handleDragStart = (event: React.DragEvent, nodeType: BTNodeType) => {
    event.dataTransfer.setData('application/reactflow/node-type', nodeType)
    event.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className="w-64 bg-gray-900/95 border-r border-cyan-500/30 flex flex-col h-full">
      <div className="p-4 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-900/30 to-transparent">
        <h2 className="text-cyan-400 font-bold text-lg tracking-wider">
          ╔══ 节点面板 ══╗
        </h2>
        <p className="text-gray-500 text-xs mt-1">拖拽节点到画布</p>
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {nodeTypes.map((node, index) => (
          <motion.div
            key={node.type}
            draggable
            onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, node.type)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
            className={`
              relative cursor-grab active:cursor-grabbing
              bg-gradient-to-br ${node.color}
              border ${node.borderColor}
              rounded-lg p-4
              backdrop-blur-sm
              hover:shadow-lg ${node.glowColor}
              transition-all duration-300
              group
            `}
          >
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/5 to-transparent" />

            <div className="relative flex items-start gap-3">
              <div className={`p-2 rounded-md bg-gray-900/50 border ${node.borderColor}`}>
                <span className="text-white">{node.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm tracking-wide">
                  {node.label}
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  {node.description}
                </div>
              </div>
            </div>

            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse opacity-50" />
          </motion.div>
        ))}
      </div>

      <div className="p-3 border-t border-cyan-500/30 bg-gray-900/50">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>选择器: OR 逻辑</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>序列器: AND 逻辑</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <span>条件: IF-ELSE 逻辑</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-400" />
            <span>动作: 执行操作</span>
          </div>
        </div>
      </div>
    </div>
  )
}
