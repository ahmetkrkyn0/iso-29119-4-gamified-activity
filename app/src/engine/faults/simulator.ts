import type { McdcSubmission, TruthTableRow } from '../types'
import type { CaseFile } from '../caseLoader'

type FaultSimulationResult = {
  detected: string[]
  missed: string[]
}

export function simulateFaults(
  submission: McdcSubmission,
  truthTable: TruthTableRow[],
  caseFile: CaseFile,
): FaultSimulationResult {
  const detected: string[] = []
  const missed: string[] = []
  const conditionIds = caseFile.scenario.conditions.map((c) => c.id)

  for (const fault of caseFile.seeded_faults) {
    const { condition, requiredDecisionFlip } = fault.trigger

    const faultCaught = submission.some((pair) => {
      const row1 = truthTable[pair.row1]
      const row2 = truthTable[pair.row2]
      if (!row1 || !row2) return false

      const changedConditions = conditionIds.filter((id) => row1.values[id] !== row2.values[id])
      const testsTargetCondition =
        changedConditions.length === 1 && changedConditions[0] === condition
      const decisionFlipped = row1.decision !== row2.decision

      return testsTargetCondition && (!requiredDecisionFlip || decisionFlipped)
    })

    if (faultCaught) {
      detected.push(fault.id)
    } else {
      missed.push(fault.id)
    }
  }

  return { detected, missed }
}
