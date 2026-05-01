import { describe, test, expect, beforeEach } from 'vitest'
import { useGameStore } from '../../src/stores/gameStore'
import type { CaseFile } from '../../src/engine/caseLoader'

const tutorialCase: CaseFile = {
  id: 'mcdc-tutorial-01',
  act: 'MCDC',
  difficulty: 1,
  iso_clauses: ['§5.3.6'],
  scenario: {
    title: 'Simple Safety Gate',
    narrative: 'test',
    code: 'test',
    conditions: [{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }],
    decision_expression: 'A && B',
  },
  seeded_faults: [
    {
      id: 'F1',
      description: 'Button B bypassed',
      trigger: { condition: 'B', requiredDecisionFlip: true },
    },
  ],
  misconceptions: [],
}

beforeEach(() => {
  useGameStore.getState().resetGame()
})

describe('gameStore', () => {
  test('loadCase truthTable ve phase ayarlar', () => {
    useGameStore.getState().loadCase(tutorialCase)
    const { truthTable, phase, caseFile } = useGameStore.getState()
    expect(truthTable).toHaveLength(4)
    expect(phase).toBe('briefing')
    expect(caseFile?.id).toBe('mcdc-tutorial-01')
  })

  test('addPair submission a ekler', () => {
    useGameStore.getState().loadCase(tutorialCase)
    useGameStore.getState().addPair({ row1: 1, row2: 3 })
    const { submission } = useGameStore.getState()
    expect(submission).toHaveLength(1)
    expect(submission[0]).toEqual({ row1: 1, row2: 3 })
  })

  test('removePair submission dan çıkarır (sıra fark etmez)', () => {
    useGameStore.getState().loadCase(tutorialCase)
    useGameStore.getState().addPair({ row1: 1, row2: 3 })
    useGameStore.getState().addPair({ row1: 2, row2: 3 })
    useGameStore.getState().removePair(3, 1)
    const { submission } = useGameStore.getState()
    expect(submission).toHaveLength(1)
    expect(submission[0]).toEqual({ row1: 2, row2: 3 })
  })

  test('submitForVerdict verdict yazar ve phase trial a geçer', () => {
    useGameStore.getState().loadCase(tutorialCase)
    useGameStore.getState().addPair({ row1: 1, row2: 3 })
    useGameStore.getState().addPair({ row1: 2, row2: 3 })
    useGameStore.getState().submitForVerdict()
    const { verdict, phase } = useGameStore.getState()
    expect(phase).toBe('trial')
    expect(verdict?.passed).toBe(true)
    expect(verdict?.coverageAchieved).toBe(1.0)
  })

  test('advancePhase sıradaki fazı ayarlar', () => {
    useGameStore.getState().advancePhase()
    expect(useGameStore.getState().phase).toBe('investigation')
    useGameStore.getState().advancePhase()
    expect(useGameStore.getState().phase).toBe('evidence')
  })

  test('resetGame state i temizler', () => {
    useGameStore.getState().loadCase(tutorialCase)
    useGameStore.getState().addPair({ row1: 1, row2: 3 })
    useGameStore.getState().resetGame()
    const state = useGameStore.getState()
    expect(state.caseFile).toBeNull()
    expect(state.submission).toHaveLength(0)
    expect(state.verdict).toBeNull()
    expect(state.phase).toBe('briefing')
  })
})
