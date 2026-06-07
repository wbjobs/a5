import { useCallback, useMemo, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
  type NodeTypes,
  type BackgroundVariant
} from 'reactflow'
import 'reactflow/dist/style.css'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  SelectorNode,
  SequenceNode,
  ConditionNode,
  ActionNode
} from '@/components/nodes'
import type { BehaviorTree, NodeStatus, BTNode, BTEdge } from '@/types'

interface BehaviorTreeViewProps {
  ai1Tree: BehaviorTree | null
  ai2Tree: BehaviorTree | null
  ai1CurrentNodeId?: string
  ai2CurrentNodeId?: string
  executionPath?: string[]
  nodeStatuses?: Record<string, NodeStatus>
  className?: string
}

const nodeTypes: NodeTypes = {
  selector: SelectorNode as unknown as NodeTypes[string],
  sequence: SequenceNode as unknown as NodeTypes[string],
  condition: ConditionNode as unknown as NodeTypes[string],
  action: ActionNode as unknown as NodeTypes[string]
}

interface TreePanelProps {
  tree: BehaviorTree | null
  side: 'left' | 'right'
  currentNodeId?: string
  executionPath?: string[]
  nodeStatuses?: Record<string, NodeStatus>
}

function TreePanel({
  tree,
  side,
  currentNodeId,
  executionPath = [],
  nodeStatuses = {}
}: TreePanelProps) {
  const nodes = useMemo(() => {
    if (!tree) return []
    
    return Object.values(tree.nodes).map((node: BTNode): Node => {
      const isInPath = executionPath.includes(node.id)
      const isCurrent = node.id === currentNodeId
      const status = nodeStatuses[node.id] || 'idle'
      
      return {
        id: node.id,
        type: node.data.nodeType,
        position: node.position,
        data: {
          ...node.data,
          status,
          isInPath,
          isCurrent
        },
        draggable: false,
        selectable: true
      }
    })
  }, [tree, executionPath, currentNodeId, nodeStatuses])
  
  const edges = useMemo(() => {
    if (!tree) return []
    
    return tree.edges.map((edge: BTEdge): Edge => {
      const isInPath = executionPath.includes(edge.source) && executionPath.includes(edge.target)
      
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        animated: isInPath,
        style: isInPath
          ? {
              stroke: '#00f5ff',
              strokeWidth: 3,
              filter: 'drop-shadow(0 0 6px #00f5ff)'
            }
          : {
              stroke: 'rgba(0, 245, 255, 0.2)',
              strokeWidth: 2
            },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isInPath ? '#00f5ff' : 'rgba(0, 245, 255, 0.3)'
        }
      }
    })
  }, [tree, executionPath])
  
  const [rfNodes, setNodes, onNodesChange] = useNodesState(nodes)
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState(edges)
  
  useEffect(() => {
    setNodes(nodes)
  }, [nodes, setNodes])
  
  useEffect(() => {
    setEdges(edges)
  }, [edges, setEdges])
  
  const onInit = useCallback(() => {}, [])
  
  const accentColor = side === 'left' ? '#00f5ff' : '#ff00ff'
  const bgGradient = side === 'left'
    ? 'radial-gradient(circle at 20% 50%, rgba(0, 245, 255, 0.03) 0%, transparent 50%)'
    : 'radial-gradient(circle at 80% 50%, rgba(255, 0, 255, 0.03) 0%, transparent 50%)'
  
  if (!tree) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--cyber-bg-secondary)] border border-[var(--cyber-border)]">
        <div className="text-center text-[var(--cyber-text-muted)]">
          <div className="font-mono text-sm">NO BEHAVIOR TREE</div>
          <div className="text-xs mt-1">Waiting for battle data...</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex-1 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: bgGradient }}
      />
      
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
      >
        <Background
          variant={'dots' as BackgroundVariant}
          gap={20}
          size={1}
          color="rgba(0, 245, 255, 0.1)"
        />
        <Controls
          className="!bg-[var(--cyber-bg-secondary)] !border !border-[var(--cyber-border)]"
          position="bottom-left"
        />
        <MiniMap
          nodeColor={accentColor}
          nodeStrokeColor={accentColor}
          maskColor="rgba(10, 10, 15, 0.7)"
          className="!bg-[var(--cyber-bg-secondary)] !border !border-[var(--cyber-border)]"
          position="bottom-right"
        />
      </ReactFlow>
      
      {currentNodeId && (
        <motion.div
          className="absolute top-3 left-3 z-20 px-3 py-1.5 font-mono text-xs"
          style={{
            backgroundColor: `${accentColor}20`,
            border: `1px solid ${accentColor}60`,
            color: accentColor
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          CURRENT: {currentNodeId}
        </motion.div>
      )}
    </div>
  )
}

export default function BehaviorTreeView({
  ai1Tree,
  ai2Tree,
  ai1CurrentNodeId,
  ai2CurrentNodeId,
  executionPath = [],
  nodeStatuses = {},
  className
}: BehaviorTreeViewProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="cyber-panel-header flex items-center justify-between">
        <span className="text-[var(--cyber-neon-cyan)]">AI-1 BEHAVIOR TREE</span>
        <div className="w-px h-4 bg-[var(--cyber-border)]" />
        <span className="text-[var(--cyber-neon-pink)]">AI-2 BEHAVIOR TREE</span>
      </div>
      
      <div className="flex-1 flex min-h-0">
        <TreePanel
          tree={ai1Tree}
          side="left"
          currentNodeId={ai1CurrentNodeId}
          executionPath={executionPath}
          nodeStatuses={nodeStatuses}
        />
        
        <div className="w-px bg-[var(--cyber-border)]" />
        
        <TreePanel
          tree={ai2Tree}
          side="right"
          currentNodeId={ai2CurrentNodeId}
          executionPath={executionPath}
          nodeStatuses={nodeStatuses}
        />
      </div>
      
      <div className="flex items-center justify-center gap-6 py-2 px-4 bg-[var(--cyber-bg-tertiary)] border-t border-[var(--cyber-border)]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
          <span className="text-xs font-mono text-[var(--cyber-text-secondary)]">RUNNING</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
          <span className="text-xs font-mono text-[var(--cyber-text-secondary)]">SUCCESS</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          <span className="text-xs font-mono text-[var(--cyber-text-secondary)]">FAILED</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500" />
          <span className="text-xs font-mono text-[var(--cyber-text-secondary)]">IDLE</span>
        </div>
      </div>
    </div>
  )
}
