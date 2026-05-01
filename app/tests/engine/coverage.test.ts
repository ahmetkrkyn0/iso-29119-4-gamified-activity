import { describe, test, expect } from 'vitest'
import { generateTruthTable, validateMcdcCoverage } from '../../src/engine/coverage/mcdc'

const twoConditions = [{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }]
const threeConditions = [
  { id: 'A', label: 'A' },
  { id: 'B', label: 'B' },
  { id: 'C', label: 'C' },
]

describe('generateTruthTable', () => {
  test('2 koşul için 4 satır üretir', () => {
    const rows = generateTruthTable(twoConditions, 'A && B')
    expect(rows).toHaveLength(4)
  })

  test('3 koşul için 8 satır üretir', () => {
    const rows = generateTruthTable(threeConditions, 'A && (B || C)')
    expect(rows).toHaveLength(8)
  })

  test('A && B için doğru decision değerleri', () => {
    const rows = generateTruthTable(twoConditions, 'A && B')
    expect(rows[0]).toEqual({ index: 0, values: { A: false, B: false }, decision: false })
    expect(rows[1]).toEqual({ index: 1, values: { A: false, B: true }, decision: false })
    expect(rows[2]).toEqual({ index: 2, values: { A: true, B: false }, decision: false })
    expect(rows[3]).toEqual({ index: 3, values: { A: true, B: true }, decision: true })
  })

  test('A && (B || C) için doğru decision değerleri', () => {
    const rows = generateTruthTable(threeConditions, 'A && (B || C)')
    expect(rows[7]?.decision).toBe(true)
    expect(rows[0]?.decision).toBe(false)
    expect(rows[4]?.decision).toBe(false)
    expect(rows[5]?.decision).toBe(true)
  })

  test('! operatörü çalışır', () => {
    const rows = generateTruthTable(twoConditions, '!A && B')
    expect(rows[1]?.decision).toBe(true)
    expect(rows[3]?.decision).toBe(false)
  })
})

describe('validateMcdcCoverage', () => {
  const rows = generateTruthTable(twoConditions, 'A && B')
  // Row 0: A=F,B=F→F  Row 1: A=F,B=T→F  Row 2: A=T,B=F→F  Row 3: A=T,B=T→T
  // pair(1,3): A changes F→T, B fixed T, decision flips F→T → covers A
  // pair(2,3): B changes F→T, A fixed T, decision flips F→T → covers B

  test('geçerli submission tam coverage sağlar', () => {
    const submission = [{ row1: 1, row2: 3 }, { row1: 2, row2: 3 }]
    const result = validateMcdcCoverage(submission, rows, twoConditions)
    expect(result.coverageRatio).toBe(1.0)
    expect(result.coveredConditions).toContain('A')
    expect(result.coveredConditions).toContain('B')
    expect(result.uncoveredConditions).toHaveLength(0)
  })

  test('eksik pair eksik coverage döner', () => {
    const submission = [{ row1: 1, row2: 3 }]
    const result = validateMcdcCoverage(submission, rows, twoConditions)
    expect(result.coverageRatio).toBe(0.5)
    expect(result.coveredConditions).toContain('A')
    expect(result.uncoveredConditions).toContain('B')
  })

  test('birden fazla koşul değişen pair geçersiz sayılır', () => {
    const submission = [{ row1: 0, row2: 3 }]
    const result = validateMcdcCoverage(submission, rows, twoConditions)
    expect(result.coverageRatio).toBe(0)
    expect(result.invalidPairs).toHaveLength(1)
  })

  test('decision değişmeyen pair geçersiz sayılır', () => {
    const submission = [{ row1: 0, row2: 1 }]
    const result = validateMcdcCoverage(submission, rows, twoConditions)
    expect(result.coverageRatio).toBe(0)
    expect(result.invalidPairs).toHaveLength(1)
  })
})
