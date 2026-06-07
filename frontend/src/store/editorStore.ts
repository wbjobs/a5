import { create } from 'zustand'
import { BTNode, BTEdge, BehaviorTree, BTNodeData, Position } from '../types'

interface HistorySnapshot {
  nodes: [string, BTNode][]
  edges: BTEdge[]
  rootNodeId: string
  treeName: string
}

interface EditorState {
  nodes: Map<string, BTNode>
  edges: BTEdge[]
  selectedNodeId: string | null
  rootNodeId: string
  treeName: string
  isDirty: boolean
  history: HistorySnapshot[]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean
  addNode: (node: BTNode) => void
  updateNode: (id: string, updates: Partial<BTNode>) => void
  updateNodePosition: (id: string, position: Position) => void
  updateNodeData: (id: string, data: Partial<BTNodeData>) => void
  deleteNode: (id: string) => void
  addEdge: (edge: BTEdge) => void
  deleteEdge: (id: string) => void
  setSelectedNode: (id: string | null) => void
  setRootNode: (id: string) => void
  setTreeName: (name: string) => void
  clearAll: () => void
  importFromJSON: (tree: BehaviorTree) => void
  exportToJSON: () => BehaviorTree
  loadTemplate: (template: BehaviorTree) => void
  saveHistory: () => void
  undo: () => void
  redo: () => void
  clearHistory: () => void
}

const MAX_HISTORY = 50

export const useEditorStore = create<EditorState>((set, get) => ({
  nodes: new Map(),
  edges: [],
  selectedNodeId: null,
  rootNodeId: '',
  treeName: 'New Behavior Tree',
  isDirty: false,
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,

  saveHistory: () => {
    const state = get()
    const snapshot: HistorySnapshot = {
      nodes: Array.from(state.nodes.entries()),
      edges: [...state.edges],
      rootNodeId: state.rootNodeId,
      treeName: state.treeName,
    }

    const newHistory = state.history.slice(0, state.historyIndex + 1)
    newHistory.push(snapshot)

    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift()
    }

    const newIndex = newHistory.length - 1
    set({
      history: newHistory,
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: false,
    })
  },

  undo: () => {
    const state = get()
    if (state.historyIndex <= 0) return

    const newIndex = state.historyIndex - 1
    const snapshot = state.history[newIndex]

    set({
      nodes: new Map(snapshot.nodes),
      edges: [...snapshot.edges],
      rootNodeId: snapshot.rootNodeId,
      treeName: snapshot.treeName,
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: true,
      isDirty: true,
    })
  },

  redo: () => {
    const state = get()
    if (state.historyIndex >= state.history.length - 1) return

    const newIndex = state.historyIndex + 1
    const snapshot = state.history[newIndex]

    set({
      nodes: new Map(snapshot.nodes),
      edges: [...snapshot.edges],
      rootNodeId: snapshot.rootNodeId,
      treeName: snapshot.treeName,
      historyIndex: newIndex,
      canUndo: true,
      canRedo: newIndex < state.history.length - 1,
      isDirty: true,
    })
  },

  clearHistory: () => {
    set({
      history: [],
      historyIndex: -1,
      canUndo: false,
      canRedo: false,
    })
  },

  addNode: (node) => {
    get().saveHistory()
    set((state) => {
      const newNodes = new Map(state.nodes)
      newNodes.set(node.id, node)
      return { nodes: newNodes, isDirty: true }
    })
  },

  updateNode: (id, updates) => {
    get().saveHistory()
    set((state) => {
      const node = state.nodes.get(id)
      if (!node) return state
      const newNodes = new Map(state.nodes)
      newNodes.set(id, { ...node, ...updates })
      return { nodes: newNodes, isDirty: true }
    })
  },

  updateNodePosition: (id, position) => {
    get().saveHistory()
    set((state) => {
      const node = state.nodes.get(id)
      if (!node) return state
      const newNodes = new Map(state.nodes)
      newNodes.set(id, { ...node, position })
      return { nodes: newNodes, isDirty: true }
    })
  },

  updateNodeData: (id, data) => {
    get().saveHistory()
    set((state) => {
      const node = state.nodes.get(id)
      if (!node) return state
      const newNodes = new Map(state.nodes)
      newNodes.set(id, { ...node, data: { ...node.data, ...data } })
      return { nodes: newNodes, isDirty: true }
    })
  },

  deleteNode: (id) => {
    get().saveHistory()
    set((state) => {
      const newNodes = new Map(state.nodes)
      newNodes.delete(id)
      const newEdges = state.edges.filter((e) => e.source !== id && e.target !== id)
      const newRootNodeId = state.rootNodeId === id ? '' : state.rootNodeId
      const newSelectedNodeId = state.selectedNodeId === id ? null : state.selectedNodeId
      return {
        nodes: newNodes,
        edges: newEdges,
        rootNodeId: newRootNodeId,
        selectedNodeId: newSelectedNodeId,
        isDirty: true,
      }
    })
  },

  addEdge: (edge) => {
    get().saveHistory()
    set((state) => ({
      edges: [...state.edges, edge],
      isDirty: true,
    }))
  },

  deleteEdge: (id) => {
    get().saveHistory()
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
      isDirty: true,
    }))
  },

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  setRootNode: (id) => {
    get().saveHistory()
    set({ rootNodeId: id, isDirty: true })
  },

  setTreeName: (name) => {
    get().saveHistory()
    set({ treeName: name, isDirty: true })
  },

  clearAll: () => {
    get().saveHistory()
    set({
      nodes: new Map(),
      edges: [],
      selectedNodeId: null,
      rootNodeId: '',
      treeName: 'New Behavior Tree',
      isDirty: false,
    })
  },

  importFromJSON: (tree) => {
    get().clearHistory()
    const nodesMap = new Map(Object.entries(tree.nodes))
    set({
      nodes: nodesMap,
      edges: tree.edges,
      rootNodeId: tree.rootNodeId,
      treeName: tree.name,
      isDirty: false,
    })
  },

  exportToJSON: () => {
    const state = get()
    const nodes: Record<string, BTNode> = {}
    state.nodes.forEach((node, id) => {
      nodes[id] = node
    })
    return {
      id: crypto.randomUUID(),
      name: state.treeName,
      rootNodeId: state.rootNodeId,
      nodes,
      edges: state.edges,
    }
  },

  loadTemplate: (template) => {
    get().clearHistory()
    const nodesMap = new Map(Object.entries(template.nodes))
    set({
      nodes: nodesMap,
      edges: template.edges,
      rootNodeId: template.rootNodeId,
      treeName: template.name,
      selectedNodeId: null,
      isDirty: false,
    })
  },
}))
