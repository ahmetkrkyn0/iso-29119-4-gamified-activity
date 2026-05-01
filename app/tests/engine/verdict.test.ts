import { describe, test, expect } from 'vitest'
import { computeVerdict } from '../../src/engine/verdict/index'
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

// A && B: Row 1=(F,T,F)  Row 2=(T,F,F)  Row 3=(T,T,T)
// pair(1,3): covers A    pair(2,3): covers B + detects F1
const truthTable = generateTruthTable(
  tutorialCase.scenario.conditions,
  tutorialCase.scenario.decision_expression,
)

describe('computeVerdict', () => {
  test('geçerli ve tam submission passed:true döner', () => {
    const submission = [{ row1: 1, row2: 3 }, { row1: 2, row2: 3 }]
    const verdict = computeVerdict(submission, truthTable, tutorialCase)
    expect(verdict.passed).toBe(true)
    expect(verdict.coverageAchieved).toBe(1.0)
    expect(verdict.faultsDetected).toContain('F1')
    expect(verdict.faultsMissed).toHaveLength(0)
    expect(verdict.misconceptions).toHaveLength(0)
  })

  test('eksik coverage ile passed:false döner', () => {
    const submission = [{ row1: 1, row2: 3 }]
    const verdict = computeVerdict(submission, truthTable, tutorialCase)
    expect(verdict.passed).toBe(false)
    expect(verdict.coverageAchieved).toBe(0.5)
    expect(verdict.uncoveredConditions).toContain('B')
    expect(verdict.faultsMissed).toContain('F1')
  })

  test('misconception varsa verdict içinde raporlanır', () => {
    const submission = [{ row1: 0, row2: 3 }]
    const verdict = computeVerdict(submission, truthTable, tutorialCase)
    expect(verdict.misconceptions).toContain('MCDC-INDEP-AS-ISOLATION')
  })

  test('boş submission sıfır coverage döner', () => {
    const verdict = computeVerdict([], truthTable, tutorialCase)
    expect(verdict.passed).toBe(false)
    expect(verdict.coverageAchieved).toBe(0)
    expect(verdict.coveredConditions).toHaveLength(0)
  })
})
