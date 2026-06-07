import { create } from 'zustand'
import { BTNode, BTEdge, BehaviorTree, BTNodeData, Position } from '../types'

interface EditorState {
  nodes: Map<string, BTNode>
  edges: BTEdge[]
  selectedNodeId: string | null
  rootNodeId: string
  treeName: string
  isDirty: boolean
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
}

export const useEditorStore = create<EditorState>((set, get) => ({
  nodes: new Map(),
  edges: [],
  selectedNodeId: null,
  rootNodeId: '',
  treeName: 'New Behavior Tree',
  isDirty: false,

  addNode: (node) => set((state) => {
    const newNodes = new Map(state.nodes)
    newNodes.set(node.id, node)
    return { nodes: newNodes, isDirty: true }
  }),

  updateNode: (id, updates) => set((state) => {
    const node = state.nodes.get(id)
    if (!node) return state
    const newNodes = new Map(state.nodes)
    newNodes.set(id, { ...node, ...updates })
    return { nodes: newNodes, isDirty: true }
  }),

  updateNodePosition: (id, position) => set((state) => {
    const node = state.nodes.get(id)
    if (!node) return state
    const newNodes = new Map(state.nodes)
    newNodes.set(id, { ...node, position })
    return { nodes: newNodes, isDirty: true }
  }),

  updateNodeData: (id, data) => set((state) => {
    const node = state.nodes.get(id)
    if (!node) return state
    const newNodes = new Map(state.nodes)
    newNodes.set(id, { ...node, data: { ...node.data, ...data } })
    return { nodes: newNodes, isDirty: true }
  }),

  deleteNode: (id) => set((state) => {
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
      isDirty: true
    }
  }),

  addEdge: (edge) => set((state) => ({
    edges: [...state.edges, edge],
    isDirty: true
  })),

  deleteEdge: (id) => set((state) => ({
    edges: state.edges.filter((e) => e.id !== id),
    isDirty: true
  })),

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  setRootNode: (id) => set({ rootNodeId: id, isDirty: true }),

  setTreeName: (name) => set({ treeName: name, isDirty: true }),

  clearAll: () => set({
    nodes: new Map(),
    edges: [],
    selectedNodeId: null,
    rootNodeId: '',
    treeName: 'New Behavior Tree',
    isDirty: false
  }),

  importFromJSON: (tree) => {
    const nodesMap = new Map(Object.entries(tree.nodes))
    set({
      nodes: nodesMap,
      edges: tree.edges,
      rootNodeId: tree.rootNodeId,
      treeName: tree.name,
      isDirty: false
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
      edges: state.edges
    }
  },

  loadTemplate: (template) => {
    const nodesMap = new Map(Object.entries(template.nodes))
    set({
      nodes: nodesMap,
      edges: template.edges,
      rootNodeId: template.rootNodeId,
      treeName: template.name,
      selectedNodeId: null,
      isDirty: false
    })
  }
}))
