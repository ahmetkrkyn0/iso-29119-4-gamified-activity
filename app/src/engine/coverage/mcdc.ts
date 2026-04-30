export interface TruthTableRow {
  id: number
  A: boolean
  B: boolean
  C: boolean
  D: boolean
}

export interface IndependencePair {
  condition: string
  row1: number
  row2: number
}

export interface McdcSubmission {
  selectedRows: number[]
  independencePairs: IndependencePair[]
}

export interface McdcResult {
  coverageAchieved: boolean
  coveragePercent: number
  conditionsCovered: string[]
  conditionsMissed: string[]
}

export const TRUTH_TABLE: TruthTableRow[] = [
  { id: 1, A: true,  B: true,  C: true,  D: true  },
  { id: 2, A: true,  B: true,  C: false, D: true  },
  { id: 3, A: true,  B: false, C: true,  D: true  },
  { id: 4, A: true,  B: false, C: false, D: false },
  { id: 5, A: false, B: true,  C: true,  D: false },
]

function rowById(id: number): TruthTableRow | undefined {
  return TRUTH_TABLE.find(r => r.id === id)
}

export function isValidIndependencePair(
  r1id: number,
  r2id: number,
  condition: 'A' | 'B' | 'C',
): boolean {
  const r1 = rowById(r1id)
  const r2 = rowById(r2id)
  if (!r1 || !r2) return false

  const vals = { A: [r1.A, r2.A], B: [r1.B, r2.B], C: [r1.C, r2.C] }
  const others = (['A', 'B', 'C'] as const).filter(c => c !== condition)

  // Target condition must flip
  if (vals[condition][0] === vals[condition][1]) return false
  // All other conditions must be the same
  if (others.some(c => vals[c][0] !== vals[c][1])) return false
  // Decision must flip
  if (r1.D === r2.D) return false

  return true
}

export function validateMcdcCoverage(submission: McdcSubmission): McdcResult {
  const conditions = ['A', 'B', 'C'] as const
  const conditionsCovered: string[] = []
  const conditionsMissed: string[] = []

  for (const cond of conditions) {
    const found = submission.independencePairs.some(
      p => p.condition === cond && isValidIndependencePair(p.row1, p.row2, cond),
    )
    if (found) conditionsCovered.push(cond)
    else conditionsMissed.push(cond)
  }

  const coveragePercent = Math.round((conditionsCovered.length / conditions.length) * 100)

  return {
    coverageAchieved: conditionsMissed.length === 0,
    coveragePercent,
    conditionsCovered,
    conditionsMissed,
  }
}
