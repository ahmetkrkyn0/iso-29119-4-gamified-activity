import type { McdcSubmission } from '../coverage/mcdc'
import { isValidIndependencePair, TRUTH_TABLE } from '../coverage/mcdc'

export interface FaultResult {
  id: string
  detected: boolean
}

/**
 * F1: Short-circuit evaluation skips C when B is true.
 * Detected when the test suite contains a valid independence pair for condition C
 * in a context where B=false (so C cannot be short-circuited by B).
 * The only such pair from our 5-row table is (3, 4): A=T, B=F, C flips, D flips.
 */
function detectF1(submission: McdcSubmission): boolean {
  return submission.independencePairs.some(p => {
    if (!isValidIndependencePair(p.row1, p.row2, 'C')) return false
    const r1 = TRUTH_TABLE.find(r => r.id === p.row1)
    const r2 = TRUTH_TABLE.find(r => r.id === p.row2)
    // Both rows must have B=false so the short-circuit fault would be exercised
    return r1 && r2 && !r1.B && !r2.B
  })
}

export function simulateFaults(submission: McdcSubmission): FaultResult[] {
  return [{ id: 'F1', detected: detectF1(submission) }]
}
