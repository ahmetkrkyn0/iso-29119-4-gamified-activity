import { describe, test, expect } from 'vitest'
import { detectMisconceptions } from '../../src/engine/misconceptions/detector'
import { generateTruthTable } from '../../src/engine/coverage/mcdc'

const conditions = [{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }]
// A && B truth table:
// Row 0: A=F,B=F→F  Row 1: A=F,B=T→F  Row 2: A=T,B=F→F  Row 3: A=T,B=T→T
const truthTable = generateTruthTable(conditions, 'A && B')

describe('detectMisconceptions', () => {
  test('geçerli submission için misconception yok', () => {
    const submission = [{ row1: 1, row2: 3 }, { row1: 2, row2: 3 }]
    const result = detectMisconceptions(submission, truthTable)
    expect(result).toHaveLength(0)
  })

  test('MCDC-INDEP-AS-ISOLATION: birden fazla koşul değişen pair tespit edilir', () => {
    // pair(0,3): both A and B change
    const submission = [{ row1: 0, row2: 3 }]
    const result = detectMisconceptions(submission, truthTable)
    expect(result).toContain('MCDC-INDEP-AS-ISOLATION')
  })

  test('MCDC-INDEP-AS-ISOLATION: decision değişmeyen pair tespit edilir', () => {
    // pair(0,1): B changes but decision stays F
    const submission = [{ row1: 0, row2: 1 }]
    const result = detectMisconceptions(submission, truthTable)
    expect(result).toContain('MCDC-INDEP-AS-ISOLATION')
  })

  test('MCDC-DUPLICATE-PAIR: aynı satır çifti iki kez seçilirse tespit edilir', () => {
    const submission = [{ row1: 1, row2: 3 }, { row1: 3, row2: 1 }]
    const result = detectMisconceptions(submission, truthTable)
    expect(result).toContain('MCDC-DUPLICATE-PAIR')
  })

  test('boş submission için misconception yok', () => {
    const result = detectMisconceptions([], truthTable)
    expect(result).toHaveLength(0)
  })
})
