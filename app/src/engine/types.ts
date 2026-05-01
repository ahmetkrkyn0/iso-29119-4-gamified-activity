export type TruthTableRow = {
  index: number
  values: Record<string, boolean>
  decision: boolean
}

export type IndependencePair = {
  row1: number
  row2: number
}

export type McdcSubmission = IndependencePair[]

export type VerdictResult = {
  coverageAchieved: number
  coveredConditions: string[]
  uncoveredConditions: string[]
  faultsDetected: string[]
  faultsMissed: string[]
  misconceptions: string[]
  passed: boolean
}

export type GamePhase =
  | 'briefing'
  | 'investigation'
  | 'evidence'
  | 'trial'
  | 'debrief'
