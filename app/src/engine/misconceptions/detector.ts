import type { McdcSubmission, TruthTableRow } from '../types'

export function detectMisconceptions(
  submission: McdcSubmission,
  truthTable: TruthTableRow[],
): string[] {
  const triggered: string[] = []

  const hasIsolationPattern = submission.some((pair) => {
    const row1 = truthTable[pair.row1]
    const row2 = truthTable[pair.row2]
    if (!row1 || !row2) return false

    const changedCount = Object.keys(row1.values).filter(
      (id) => row1.values[id] !== row2.values[id],
    ).length
    const decisionFlipped = row1.decision !== row2.decision

    return changedCount !== 1 || !decisionFlipped
  })

  if (hasIsolationPattern) triggered.push('MCDC-INDEP-AS-ISOLATION')

  const pairKeys = submission.map((p) =>
    [Math.min(p.row1, p.row2), Math.max(p.row1, p.row2)].join('-'),
  )
  const hasDuplicate = pairKeys.length !== new Set(pairKeys).size

  if (hasDuplicate) triggered.push('MCDC-DUPLICATE-PAIR')

  return triggered
}
