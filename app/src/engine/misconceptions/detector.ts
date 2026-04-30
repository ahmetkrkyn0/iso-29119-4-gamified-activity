import type { McdcSubmission } from '../coverage/mcdc'
import { isValidIndependencePair } from '../coverage/mcdc'

export interface MisconceptionResult {
  id: string
  triggered: boolean
  explanation: string
}

/**
 * MCDC-INDEP-AS-ISOLATION
 * Triggered when the player submits pairs where more than one condition changes
 * between rows (i.e. not a true independence pair).
 */
function detectIndepAsIsolation(submission: McdcSubmission): boolean {
  return submission.independencePairs.some(p => {
    const cond = p.condition as 'A' | 'B' | 'C'
    return !isValidIndependencePair(p.row1, p.row2, cond)
  })
}

export function detectMisconceptions(submission: McdcSubmission): MisconceptionResult[] {
  return [
    {
      id: 'MCDC-INDEP-AS-ISOLATION',
      triggered: detectIndepAsIsolation(submission),
      explanation:
        'You tested each condition in isolation, but ISO §5.3.6.2 requires *paired* test cases ' +
        'where one condition changes while all others remain fixed and the decision outcome flips.',
    },
  ]
}
