import { create } from 'zustand'
import { BattleStats } from '../types'

interface StatsState {
  stats: BattleStats | null
  isLoading: boolean
  error: string | null
  fetchStats: () => Promise<void>
  clearStats: () => void
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: null,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      set({ stats: data, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      })
    }
  },

  clearStats: () => set({ stats: null, error: null })
}))
