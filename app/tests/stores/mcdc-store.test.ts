import { describe, test, expect, beforeEach } from 'vitest'
import { useGameStore } from '../../src/stores/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
})

describe('mcdc store — toggleRow', () => {
  test('toggleRow satırı seçer', () => {
    useGameStore.getState().toggleRow(3)
    expect(useGameStore.getState().mcdc.selectedRows).toContain(3)
  })

  test('toggleRow ikinci çağrıda seçimi kaldırır', () => {
    useGameStore.getState().toggleRow(3)
    useGameStore.getState().toggleRow(3)
    expect(useGameStore.getState().mcdc.selectedRows).not.toContain(3)
  })

  test('birden fazla satır seçilebilir', () => {
    useGameStore.getState().toggleRow(1)
    useGameStore.getState().toggleRow(5)
    expect(useGameStore.getState().mcdc.selectedRows).toHaveLength(2)
  })
})

describe('mcdc store — addPair / clearPairs', () => {
  const pair = { condition: 'A', row1: 2, row2: 6 }

  test('addPair independencePairs e ekler', () => {
    useGameStore.getState().addPair(pair)
    const pairs = useGameStore.getState().mcdc.independencePairs
    expect(pairs).toHaveLength(1)
    expect(pairs[0]).toEqual(pair)
  })

  test('addPair birden fazla pair ekler', () => {
    useGameStore.getState().addPair({ condition: 'A', row1: 2, row2: 6 })
    useGameStore.getState().addPair({ condition: 'C', row1: 4, row2: 5 })
    expect(useGameStore.getState().mcdc.independencePairs).toHaveLength(2)
  })

  test('clearPairs tüm pairleri siler', () => {
    useGameStore.getState().addPair(pair)
    useGameStore.getState().addPair({ condition: 'B', row1: 4, row2: 6 })
    useGameStore.getState().clearPairs()
    expect(useGameStore.getState().mcdc.independencePairs).toHaveLength(0)
  })
})

describe('mcdc store — setVerdict', () => {
  const verdictResult = { coverageAchieved: true, coveragePercent: 100, conditionsCovered: ['A', 'B', 'C'] }
  const faults = [{ id: 'F1', detected: true }]
  const misconceptions = [{ id: 'MCDC-INDEP-AS-ISOLATION', triggered: false, explanation: 'test' }]

  test('setVerdict mcdc.verdictResult yazar', () => {
    useGameStore.getState().setVerdict(verdictResult, faults, misconceptions)
    expect(useGameStore.getState().mcdc.verdictResult).toEqual(verdictResult)
  })

  test('setVerdict mcdc.faultResults yazar', () => {
    useGameStore.getState().setVerdict(verdictResult, faults, misconceptions)
    expect(useGameStore.getState().mcdc.faultResults).toEqual(faults)
  })

  test('setVerdict mcdc.misconceptions yazar', () => {
    useGameStore.getState().setVerdict(verdictResult, faults, misconceptions)
    expect(useGameStore.getState().mcdc.misconceptions).toEqual(misconceptions)
  })

  test('resetGame mcdc state i temizler', () => {
    useGameStore.getState().setVerdict(verdictResult, faults, misconceptions)
    useGameStore.getState().toggleRow(5)
    useGameStore.getState().resetGame()
    const { mcdc } = useGameStore.getState()
    expect(mcdc.verdictResult).toBeNull()
    expect(mcdc.selectedRows).toHaveLength(0)
    expect(mcdc.independencePairs).toHaveLength(0)
  })
})
