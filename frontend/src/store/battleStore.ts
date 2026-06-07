import { create } from 'zustand'
import { BattleState, BattleEvent, BehaviorTree, BattleRequest } from '../types'

interface BattleStateStore {
  battleId: string | null
  battleState: BattleState | null
  isConnected: boolean
  isPaused: boolean
  logs: BattleEvent[]
  ai1Tree: BehaviorTree | null
  ai2Tree: BehaviorTree | null
  startBattle: (request: BattleRequest) => Promise<void>
  stopBattle: () => void
  togglePause: () => void
  updateState: (state: Partial<BattleState>) => void
  addLog: (event: BattleEvent) => void
  connect: () => void
  disconnect: () => void
  setTrees: (ai1Tree: BehaviorTree | null, ai2Tree: BehaviorTree | null) => void
}

export const useBattleStore = create<BattleStateStore>((set) => ({
  battleId: null,
  battleState: null,
  isConnected: false,
  isPaused: false,
  logs: [],
  ai1Tree: null,
  ai2Tree: null,

  startBattle: async (request) => {
    try {
      const response = await fetch('/api/battle/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })
      const data = await response.json()
      if (data.success) {
        set({
          battleId: data.battleId,
          isPaused: false,
          logs: []
        })
      }
    } catch (error) {
      console.error('Failed to start battle:', error)
    }
  },

  stopBattle: () => set({
    battleId: null,
    battleState: null,
    isPaused: false,
    logs: []
  }),

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  updateState: (newState) => set((state) => ({
    battleState: state.battleState
      ? { ...state.battleState, ...newState }
      : newState as BattleState
  })),

  addLog: (event) => set((state) => ({
    logs: [...state.logs, event]
  })),

  connect: () => set({ isConnected: true }),

  disconnect: () => set({
    isConnected: false,
    battleId: null,
    battleState: null,
    isPaused: false
  }),

  setTrees: (ai1Tree, ai2Tree) => set({ ai1Tree, ai2Tree })
}))
