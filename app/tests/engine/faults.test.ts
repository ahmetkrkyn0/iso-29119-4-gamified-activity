import { describe, test, expect } from 'vitest'
import { simulateFaults } from '../../src/engine/faults/simulator'
import { generateTruthTable } from '../../src/engine/coverage/mcdc'
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

// Truth table for A && B:
// Row 0: A=F,B=F→F  Row 1: A=F,B=T→F  Row 2: A=T,B=F→F  Row 3: A=T,B=T→T
const truthTable = generateTruthTable(
  tutorialCase.scenario.conditions,
  tutorialCase.scenario.decision_expression,
)

describe('simulateFaults', () => {
  test('B yi test eden geçerli pair F1 fault unu yakalar', () => {
    // pair(2,3): B changes F→T, A fixed T, decision flips F→T → tests B
    const submission = [{ row1: 2, row2: 3 }]
    const result = simulateFaults(submission, truthTable, tutorialCase)
    expect(result.detected).toContain('F1')
    expect(result.missed).toHaveLength(0)
  })

  test('B yi test etmeyen pair F1 fault unu kaçırır', () => {
    // pair(1,3): A changes, B fixed → tests A not B
    const submission = [{ row1: 1, row2: 3 }]
    const result = simulateFaults(submission, truthTable, tutorialCase)
    expect(result.missed).toContain('F1')
    expect(result.detected).toHaveLength(0)
  })

  test('boş submission tüm faultları kaçırır', () => {
    const result = simulateFaults([], truthTable, tutorialCase)
    expect(result.missed).toContain('F1')
    expect(result.detected).toHaveLength(0)
  })

  test('geçersiz pair (decision değişmiyor) fault yakalamaz', () => {
    // pair(0,1): B changes but decision stays F
    const submission = [{ row1: 0, row2: 1 }]
    const result = simulateFaults(submission, truthTable, tutorialCase)
    expect(result.missed).toContain('F1')
  })
})
