import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { IndependencePair, McdcResult } from '../engine/coverage/mcdc'
import type { FaultResult } from '../engine/faults/simulator'
import type { MisconceptionResult } from '../engine/misconceptions/detector'

export type Screen =
  | 'menu'
  | 'campaign'
  | 'multiplayer'
  | 'achievements'
  | 'design-system'
  | 'how-to-play'
  | 'briefing'
  | 'investigation'
  | 'evidence'
  | 'trial'
  | 'debrief'

export interface McdcSessionState {
  selectedRows: number[]
  independencePairs: IndependencePair[]
  verdictResult: McdcResult | null
  faultResults: FaultResult[]
  misconceptions: MisconceptionResult[]
}

interface GameState {
  screen: Screen
  history: Screen[]
  completedCases: string[]
  triggeredMisconceptions: string[]

  // Current MCDC session
  mcdc: McdcSessionState

  // Navigation
  navigate: (target: Screen) => void
  goBack: () => void

  // MCDC actions
  toggleRow: (id: number) => void
  addPair: (pair: IndependencePair) => void
  clearPairs: () => void
  setVerdict: (result: McdcResult, faults: FaultResult[], misconceptions: MisconceptionResult[]) => void
  resetMcdc: () => void
}

const defaultMcdc: McdcSessionState = {
  selectedRows: [],
  independencePairs: [],
  verdictResult: null,
  faultResults: [],
  misconceptions: [],
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: 'menu',
      history: [],
      completedCases: [],
      triggeredMisconceptions: [],
      mcdc: defaultMcdc,

      navigate(target) {
        set(s => ({ screen: target, history: [...s.history, s.screen] }))
      },

      goBack() {
        const { history } = get()
        const prev: Screen = history.length > 0 ? history[history.length - 1]! : 'menu'
        set(s => ({ screen: prev, history: s.history.slice(0, -1) }))
      },

      toggleRow(id) {
        set(s => ({
          mcdc: {
            ...s.mcdc,
            selectedRows: s.mcdc.selectedRows.includes(id)
              ? s.mcdc.selectedRows.filter(r => r !== id)
              : [...s.mcdc.selectedRows, id],
          },
        }))
      },

      addPair(pair) {
        set(s => ({ mcdc: { ...s.mcdc, independencePairs: [...s.mcdc.independencePairs, pair] } }))
      },

      clearPairs() {
        set(s => ({ mcdc: { ...s.mcdc, independencePairs: [] } }))
      },

      setVerdict(result, faults, misconceptions) {
        const triggered = misconceptions.filter(m => m.triggered).map(m => m.id)
        set(s => ({
          mcdc: { ...s.mcdc, verdictResult: result, faultResults: faults, misconceptions },
          triggeredMisconceptions: [...new Set([...s.triggeredMisconceptions, ...triggered])],
          completedCases: result.coverageAchieved
            ? [...new Set([...s.completedCases, 'mcdc-altitude-disengage-01'])]
            : s.completedCases,
        }))
      },

      resetMcdc() {
        set({ mcdc: defaultMcdc })
      },
    }),
    { name: 'test-courthouse-save' },
  ),
)
