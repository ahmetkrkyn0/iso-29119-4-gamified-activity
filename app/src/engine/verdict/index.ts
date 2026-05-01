import type { McdcSubmission, TruthTableRow, VerdictResult } from '../types'
import type { CaseFile } from '../caseLoader'
import { validateMcdcCoverage } from '../coverage/mcdc'
import { simulateFaults } from '../faults/simulator'
import { detectMisconceptions } from '../misconceptions/detector'

export function computeVerdict(
  submission: McdcSubmission,
  truthTable: TruthTableRow[],
  caseFile: CaseFile,
): VerdictResult {
  const coverage = validateMcdcCoverage(
    submission,
    truthTable,
    caseFile.scenario.conditions,
  )

  const faults = simulateFaults(submission, truthTable, caseFile)
  const misconceptions = detectMisconceptions(submission, truthTable)

  return {
    coverageAchieved: coverage.coverageRatio,
    coveredConditions: coverage.coveredConditions,
    uncoveredConditions: coverage.uncoveredConditions,
    faultsDetected: faults.detected,
    faultsMissed: faults.missed,
    misconceptions,
    passed: coverage.coverageRatio === 1.0 && faults.missed.length === 0,
  }
}
