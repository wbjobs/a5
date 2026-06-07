import { create } from 'zustand'
import { BattleState, BattleEvent, BehaviorTree, BattleRequest, ExecutionStackFrame, AimPrediction } from '../types'

interface BattleStateStore {
  battleId: string | null
  battleState: BattleState | null
  isConnected: boolean
  isPaused: boolean
  logs: BattleEvent[]
  ai1Tree: BehaviorTree | null
  ai2Tree: BehaviorTree | null
  stepMode: boolean
  executionSpeed: number
  executionStack: ExecutionStackFrame[]
  aimPredictions: Record<string, AimPrediction>
  startBattle: (request: BattleRequest) => Promise<void>
  stopBattle: () => void
  togglePause: () => void
  updateState: (state: Partial<BattleState>) => void
  addLog: (event: BattleEvent) => void
  connect: () => void
  disconnect: () => void
  setTrees: (ai1Tree: BehaviorTree | null, ai2Tree: BehaviorTree | null) => void
  setStepMode: (enabled: boolean) => void
  setSpeed: (speed: number) => void
  updateExecutionStack: (stack: ExecutionStackFrame[]) => void
  updateAimPrediction: (side: string, prediction: AimPrediction) => void
}

export const useBattleStore = create<BattleStateStore>((set) => ({
  battleId: null,
  battleState: null,
  isConnected: false,
  isPaused: false,
  logs: [],
  ai1Tree: null,
  ai2Tree: null,
  stepMode: false,
  executionSpeed: 1,
  executionStack: [],
  aimPredictions: {},

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
          logs: [],
          stepMode: false,
          executionSpeed: 1,
          executionStack: [],
          aimPredictions: {}
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
    logs: [],
    stepMode: false,
    executionSpeed: 1,
    executionStack: [],
    aimPredictions: {}
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
    isPaused: false,
    stepMode: false,
    executionSpeed: 1,
    executionStack: [],
    aimPredictions: {}
  }),

  setTrees: (ai1Tree, ai2Tree) => set({ ai1Tree, ai2Tree }),

  setStepMode: (enabled) => set({ stepMode: enabled }),

  setSpeed: (speed) => set({ executionSpeed: speed }),

  updateExecutionStack: (stack) => set({ executionStack: stack }),

  updateAimPrediction: (side, prediction) => set((state) => ({
    aimPredictions: {
      ...state.aimPredictions,
      [side]: prediction
    }
  }))
}))
