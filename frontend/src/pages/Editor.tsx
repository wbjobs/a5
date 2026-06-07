import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react'
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
  Node,
  Connection,
  MarkerType,
  NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { motion } from 'framer-motion'
import { NodePalette } from '../components/editor/NodePalette'
import { PropertyPanel } from '../components/editor/PropertyPanel'
import { Toolbar } from '../components/editor/Toolbar'
import { BattleConfigModal } from '../components/editor/BattleConfigModal'
import { useEditorStore } from '../store/editorStore'
import { generateId } from '../utils/btUtils'
import { BTNodeType, BTNode, BTNodeData } from '../types'
import { useClipboard } from '../hooks/useClipboard'
import {
  SelectorNode,
  SequenceNode,
  ConditionNode,
  ActionNode,
} from '../components/nodes'

const nodeTypes = {
  selector: SelectorNode,
  sequence: SequenceNode,
  condition: ConditionNode,
  action: ActionNode,
} as unknown as NodeTypes

const proOptions = { hideAttribution: true }

const EditorContent: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<{ screenToFlowPosition: (pos: { x: number; y: number }) => { x: number; y: number } } | null>(null)
  const [showBattleModal, setShowBattleModal] = useState(false)
  const [isAltDrag, setIsAltDrag] = useState(false)
  const [dragStartNode, setDragStartNode] = useState<Node | null>(null)

  const {
    nodes: storeNodes,
    edges: storeEdges,
    selectedNodeId,
    addNode,
    updateNodePosition,
    addEdge: addStoreEdge,
    setSelectedNode,
    setRootNode,
    undo,
    redo,
    canUndo,
    canRedo,
    historyIndex,
    history,
  } = useEditorStore()

  const { copyNode, pasteNode, hasCopiedNode } = useClipboard()

  const initialNodes = useMemo(() => {
    const nodes: Node[] = []
    storeNodes.forEach((node, id) => {
      nodes.push({
        id,
        type: node.type,
        position: node.position,
        data: node.data,
        selected: id === selectedNodeId,
      })
    })
    return nodes
  }, [storeNodes, selectedNodeId])

  const initialEdges = useMemo(() => {
    return storeEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: true,
      style: {
        stroke: '#22d3ee',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#22d3ee',
      },
    }))
  }, [storeEdges])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    setNodes(initialNodes)
  }, [initialNodes, setNodes])

  useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

  const handleCopy = useCallback(() => {
    if (selectedNodeId) {
      const node = storeNodes.get(selectedNodeId)
      if (node) {
        copyNode(node)
      }
    }
  }, [selectedNodeId, storeNodes, copyNode])

  const handlePaste = useCallback(() => {
    if (reactFlowInstance && reactFlowWrapper.current) {
      const bounds = reactFlowWrapper.current.getBoundingClientRect()
      const centerX = bounds.width / 2
      const centerY = bounds.height / 2
      const position = reactFlowInstance.screenToFlowPosition({
        x: centerX,
        y: centerY,
      })
      const newNode = pasteNode(position)
      if (newNode) {
        addNode(newNode)
      }
    }
  }, [reactFlowInstance, pasteNode, addNode])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      if (isInput) return

      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'z':
            event.preventDefault()
            undo()
            break
          case 'y':
            event.preventDefault()
            redo()
            break
          case 'c':
            event.preventDefault()
            handleCopy()
            break
          case 'v':
            event.preventDefault()
            handlePaste()
            break
        }
      }

      if (event.key === 'Alt') {
        setIsAltDrag(true)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Alt') {
        setIsAltDrag(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [undo, redo, handleCopy, handlePaste])

  const onConnect = useCallback(
    (params: Connection) => {
      const edgeId = `edge_${params.source}_${params.target}_${Date.now()}`
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            id: edgeId,
            animated: true,
            style: {
              stroke: '#22d3ee',
              strokeWidth: 2,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#22d3ee',
            },
          },
          eds
        )
      )
      addStoreEdge({
        id: edgeId,
        source: params.source!,
        target: params.target!,
      })
    },
    [setEdges, addStoreEdge]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow/node-type') as BTNodeType

      if (!type || !reactFlowWrapper.current || !reactFlowInstance) {
        return
      }

      const bounds = reactFlowWrapper.current.getBoundingClientRect()
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      })

      const nodeId = generateId()

      const nodeData: BTNodeData = {
        nodeType: type,
        label: getDefaultLabel(type),
        ...getDefaultNodeData(type),
      }

      const newNode: BTNode = {
        id: nodeId,
        type: type,
        position,
        data: nodeData,
      }

      addNode(newNode)

      if (storeNodes.size === 0) {
        setRootNode(nodeId)
      }
    },
    [reactFlowInstance, addNode, setRootNode, storeNodes.size]
  )

  const getDefaultLabel = (type: BTNodeType): string => {
    switch (type) {
      case 'selector':
        return '选择器'
      case 'sequence':
        return '序列器'
      case 'condition':
        return '条件判断'
      case 'action':
        return '动作'
      default:
        return '节点'
    }
  }

  const getDefaultNodeData = (type: BTNodeType): Partial<BTNodeData> => {
    switch (type) {
      case 'condition':
        return {
          condition: {
            type: 'hp_above',
            value: 50,
          },
        }
      case 'action':
        return {
          action: {
            type: 'attack',
            target: 'enemy',
          },
        }
      default:
        return {}
    }
  }

  const onNodeDragStart = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setDragStartNode(node)
    },
    []
  )

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (isAltDrag && dragStartNode && dragStartNode.id === node.id) {
        const storeNode = storeNodes.get(node.id)
        if (storeNode) {
          const newNode: BTNode = {
            ...storeNode,
            id: generateId(),
            position: {
              x: node.position.x + 30,
              y: node.position.y + 30,
            },
            data: {
              ...storeNode.data,
              condition: storeNode.data.condition ? { ...storeNode.data.condition } : undefined,
              action: storeNode.data.action ? { ...storeNode.data.action } : undefined,
            },
          }
          addNode(newNode)
          updateNodePosition(dragStartNode.id, dragStartNode.position)
        }
      } else {
        updateNodePosition(node.id, node.position)
      }
      setDragStartNode(null)
      setIsAltDrag(false)
    },
    [isAltDrag, dragStartNode, storeNodes, addNode, updateNodePosition]
  )

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id)
    },
    [setSelectedNode]
  )

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [setSelectedNode])

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <Toolbar
        onStartBattle={() => setShowBattleModal(true)}
        onUndo={undo}
        onRedo={redo}
        onCopy={handleCopy}
        onPaste={handlePaste}
        canUndo={canUndo}
        canRedo={canRedo}
        hasCopiedNode={hasCopiedNode}
        historyIndex={historyIndex}
        historyCount={history.length}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <NodePalette />

        <div ref={reactFlowWrapper} className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeDragStart={onNodeDragStart}
            onNodeDragStop={onNodeDragStop}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            proOptions={proOptions}
            fitView
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: '#22d3ee', strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#22d3ee' },
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="rgba(0, 255, 255, 0.1)"
            />
            <Controls
              className="bg-gray-900/80 border border-cyan-500/30 rounded-lg overflow-hidden backdrop-blur-sm"
              position="bottom-left"
            />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'selector':
                    return '#06b6d4'
                  case 'sequence':
                    return '#a855f7'
                  case 'condition':
                    return '#eab308'
                  case 'action':
                    return '#ec4899'
                  default:
                    return '#6b7280'
                }
              }}
              className="bg-gray-900/80 border border-cyan-500/30 rounded-lg overflow-hidden backdrop-blur-sm"
              position="bottom-right"
            />
          </ReactFlow>

          <motion.div
            className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-900/80 border border-cyan-500/30 rounded-lg backdrop-blur-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-cyan-400 text-sm font-mono">
              ═══ BEHAVIOR TREE EDITOR ═══
            </span>
          </motion.div>

          {isAltDrag && (
            <motion.div
              className="absolute top-16 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-blue-900/80 border border-blue-500/50 rounded-lg backdrop-blur-sm z-50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-blue-300 text-xs font-mono">
                Alt拖拽模式：释放鼠标将复制节点
              </span>
            </motion.div>
          )}
        </div>

        <PropertyPanel />
      </div>

      <BattleConfigModal
        isOpen={showBattleModal}
        onClose={() => setShowBattleModal(false)}
      />
    </div>
  )
}

export const Editor: React.FC = () => {
  return (
    <ReactFlowProvider>
      <EditorContent />
    </ReactFlowProvider>
  )
}

export default Editor
