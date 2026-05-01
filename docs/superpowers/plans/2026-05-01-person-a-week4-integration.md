# Person A — Week 4 Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Week 3 engine'ini Person B'nin MCDC ekranlarıyla uyumlu hale getirmek — adapter exportlar, gameStore extension ve build'in 0 TypeScript hatası vermesi.

**Architecture:** Extend + Adapter yaklaşımı. Week 3 engine fonksiyonları ve 32 test korunur. B'nin beklediği imzalar için TypeScript overload'lar eklenir. GameStore'a `mcdc` namespace ve B'nin aksiyonları eklenir. Mevcut `addPair` → `addToSubmission` olarak yeniden adlandırılır.

**Tech Stack:** TypeScript (strict), Zustand, Vitest

**Truth table referansı (A && (B || C)):**
```
Row 0: A=F,B=F,C=F → D=F    Row 4: A=T,B=F,C=F → D=F
Row 1: A=F,B=F,C=T → D=F    Row 5: A=T,B=F,C=T → D=T
Row 2: A=F,B=T,C=F → D=F    Row 6: A=T,B=T,C=F → D=T
Row 3: A=F,B=T,C=T → D=F    Row 7: A=T,B=T,C=T → D=T
```

---

### Task 1: TRUTH\_TABLE + isValidIndependencePair + validateMcdcCoverage B-overload

**Files:**
- Modify: `app/src/engine/coverage/mcdc.ts`
- Create: `app/tests/engine/mcdc-compat.test.ts`

- [ ] **Step 1: Failing testleri yaz**

`app/tests/engine/mcdc-compat.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import {
  TRUTH_TABLE,
  isValidIndependencePair,
  validateMcdcCoverage,
} from '../../src/engine/coverage/mcdc'

describe('TRUTH_TABLE', () => {
  test('8 satır içerir', () => {
    expect(TRUTH_TABLE).toHaveLength(8)
  })

  test('her satırda id, A, B, C, D alanları var', () => {
    for (const row of TRUTH_TABLE) {
      expect(typeof row.id).toBe('number')
      expect(typeof row.A).toBe('boolean')
      expect(typeof row.B).toBe('boolean')
      expect(typeof row.C).toBe('boolean')
      expect(typeof row.D).toBe('boolean')
    }
  })

  test('A && (B || C) için doğru D değerleri', () => {
    expect(TRUTH_TABLE[0]).toEqual({ id: 0, A: false, B: false, C: false, D: false })
    expect(TRUTH_TABLE[5]).toEqual({ id: 5, A: true,  B: false, C: true,  D: true  })
    expect(TRUTH_TABLE[7]).toEqual({ id: 7, A: true,  B: true,  C: true,  D: true  })
  })
})

describe('isValidIndependencePair', () => {
  test('geçerli C pair (4,5) → true', () => {
    // row4: A=T,B=F,C=F,D=F  row5: A=T,B=F,C=T,D=T — C changes, D flips
    expect(isValidIndependencePair(4, 5, 'C')).toBe(true)
  })

  test('geçerli A pair (1,5) → true', () => {
    // row1: A=F,B=F,C=T,D=F  row5: A=T,B=F,C=T,D=T — A changes, D flips
    expect(isValidIndependencePair(1, 5, 'A')).toBe(true)
  })

  test('geçerli B pair (4,6) → true', () => {
    // row4: A=T,B=F,C=F,D=F  row6: A=T,B=T,C=F,D=T — B changes, D flips
    expect(isValidIndependencePair(4, 6, 'B')).toBe(true)
  })

  test('iki koşul değişen pair → false', () => {
    // row0: A=F,B=F,C=F  row7: A=T,B=T,C=T — all change
    expect(isValidIndependencePair(0, 7, 'A')).toBe(false)
  })

  test('decision değişmeyen pair → false', () => {
    // row0: A=F,B=F,C=F,D=F  row1: A=F,B=F,C=T,D=F — C changes but D stays F
    expect(isValidIndependencePair(0, 1, 'C')).toBe(false)
  })
})

describe('validateMcdcCoverage (B signature)', () => {
  test('tam coverage → coverageAchieved: true', () => {
    const independencePairs = [
      { condition: 'A', row1: 1, row2: 5 },
      { condition: 'B', row1: 4, row2: 6 },
      { condition: 'C', row1: 4, row2: 5 },
    ]
    const result = validateMcdcCoverage({ selectedRows: [1, 4, 5, 6], independencePairs })
    expect(result.coverageAchieved).toBe(true)
    expect(result.coveredConditions).toContain('A')
    expect(result.coveredConditions).toContain('B')
    expect(result.coveredConditions).toContain('C')
  })

  test('eksik pair → coverageAchieved: false', () => {
    const independencePairs = [{ condition: 'A', row1: 1, row2: 5 }]
    const result = validateMcdcCoverage({ selectedRows: [1, 5], independencePairs })
    expect(result.coverageAchieved).toBe(false)
  })
})
```

- [ ] **Step 2: Testlerin kırmızı olduğunu doğrula**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm test -- --run
```

Beklenen: mcdc-compat testleri FAIL — `TRUTH_TABLE` ve `isValidIndependencePair` henüz yok.

- [ ] **Step 3: `app/src/engine/coverage/mcdc.ts` dosyasına eklemeler yap**

Mevcut `import` satırından sonra, dosyanın BAŞINA (mevcut `evaluateExpression` fonksiyonundan önce) şunları ekle:

```typescript
// ── B-compatible exports ──────────────────────────────────────────────────

const ALTITUDE_CONDITIONS = [
  { id: 'A', label: 'verticalSpeed > LIMIT' },
  { id: 'B', label: 'autopilotEngaged' },
  { id: 'C', label: 'pilotOverride' },
]

export type McRow = { id: number; A: boolean; B: boolean; C: boolean; D: boolean }

export const TRUTH_TABLE: McRow[] = (() => {
  // evaluated after generateTruthTable is defined — hoisted via IIFE at module load
  const rows = generateTruthTableImpl(ALTITUDE_CONDITIONS, 'A && (B || C)')
  return rows.map((row) => ({
    id: row.index,
    A: row.values['A'] ?? false,
    B: row.values['B'] ?? false,
    C: row.values['C'] ?? false,
    D: row.decision,
  }))
})()
```

**Not:** `TRUTH_TABLE` bir IIFE içinde oluşturulamaz çünkü `generateTruthTable` henüz tanımlanmamış. Bunun yerine dosyayı şu şekilde düzenliyoruz:

1. `evaluateExpression` fonksiyonunu olduğu gibi bırak
2. `generateTruthTable`'ı `generateTruthTableImpl` olarak rename et (sadece internal)
3. B-uyumlu export wrapper'ları ekle
4. `generateTruthTable`'ı public export olarak tut

Tam `app/src/engine/coverage/mcdc.ts` dosyasını şununla **değiştir**:

```typescript
import type { TruthTableRow, IndependencePair, McdcSubmission } from '../types'

// ── Expression evaluator ──────────────────────────────────────────────────

function evaluateExpression(expr: string, values: Record<string, boolean>): boolean {
  let pos = 0

  const skipSpaces = () => {
    while (pos < expr.length && expr[pos] === ' ') pos++
  }

  const parseExpr = (): boolean => parseOr()

  const parseOr = (): boolean => {
    let left = parseAnd()
    skipSpaces()
    while (pos + 1 < expr.length && expr[pos] === '|' && expr[pos + 1] === '|') {
      pos += 2
      left = left || parseAnd()
      skipSpaces()
    }
    return left
  }

  const parseAnd = (): boolean => {
    let left = parseNot()
    skipSpaces()
    while (pos + 1 < expr.length && expr[pos] === '&' && expr[pos + 1] === '&') {
      pos += 2
      left = left && parseNot()
      skipSpaces()
    }
    return left
  }

  const parseNot = (): boolean => {
    skipSpaces()
    if (expr[pos] === '!') {
      pos++
      return !parsePrimary()
    }
    return parsePrimary()
  }

  const parsePrimary = (): boolean => {
    skipSpaces()
    if (expr[pos] === '(') {
      pos++
      const val = parseExpr()
      skipSpaces()
      pos++
      return val
    }
    let id = ''
    while (pos < expr.length && /\w/.test(expr[pos] ?? '')) {
      id += expr[pos] ?? ''
      pos++
    }
    if (!(id in values)) throw new Error(`Unknown identifier: ${id}`)
    return values[id] ?? false
  }

  return parseExpr()
}

// ── Core engine functions ─────────────────────────────────────────────────

export function generateTruthTable(
  conditions: Array<{ id: string; label: string }>,
  decisionExpression: string,
): TruthTableRow[] {
  const n = conditions.length
  const rowCount = Math.pow(2, n)
  const rows: TruthTableRow[] = []

  for (let i = 0; i < rowCount; i++) {
    const values: Record<string, boolean> = {}
    conditions.forEach((cond, idx) => {
      values[cond.id] = Boolean((i >> (n - 1 - idx)) & 1)
    })
    const decision = evaluateExpression(decisionExpression, values)
    rows.push({ index: i, values, decision })
  }

  return rows
}

type CoverageResult = {
  coveredConditions: string[]
  uncoveredConditions: string[]
  coverageRatio: number
  validPairs: IndependencePair[]
  invalidPairs: IndependencePair[]
}

function validateMcdcCoverageCore(
  submission: McdcSubmission,
  truthTable: TruthTableRow[],
  conditions: Array<{ id: string }>,
): CoverageResult {
  const conditionIds = conditions.map((c) => c.id)
  const coveredConditions = new Set<string>()
  const validPairs: IndependencePair[] = []
  const invalidPairs: IndependencePair[] = []

  for (const pair of submission) {
    const row1 = truthTable[pair.row1]
    const row2 = truthTable[pair.row2]

    if (!row1 || !row2) {
      invalidPairs.push(pair)
      continue
    }

    const changedConditions = conditionIds.filter((id) => row1.values[id] !== row2.values[id])
    const decisionFlipped = row1.decision !== row2.decision

    if (changedConditions.length === 1 && decisionFlipped) {
      validPairs.push(pair)
      coveredConditions.add(changedConditions[0]!)
    } else {
      invalidPairs.push(pair)
    }
  }

  const covered = [...coveredConditions]
  const uncovered = conditionIds.filter((id) => !coveredConditions.has(id))

  return {
    coveredConditions: covered,
    uncoveredConditions: uncovered,
    coverageRatio: conditionIds.length > 0 ? covered.length / conditionIds.length : 0,
    validPairs,
    invalidPairs,
  }
}

// ── Public overloaded validateMcdcCoverage ───────────────────────────────

type BInput = {
  selectedRows: number[]
  independencePairs: Array<{ condition: string; row1: number; row2: number }>
}

export function validateMcdcCoverage(
  submission: McdcSubmission,
  truthTable: TruthTableRow[],
  conditions: Array<{ id: string }>,
): CoverageResult
export function validateMcdcCoverage(input: BInput): {
  coverageAchieved: boolean
  coveredConditions: string[]
}
export function validateMcdcCoverage(
  submissionOrInput: McdcSubmission | BInput,
  truthTable?: TruthTableRow[],
  conditions?: Array<{ id: string }>,
): CoverageResult | { coverageAchieved: boolean; coveredConditions: string[] } {
  if (Array.isArray(submissionOrInput)) {
    return validateMcdcCoverageCore(submissionOrInput, truthTable!, conditions!)
  }
  const coveredConditions = [
    ...new Set(submissionOrInput.independencePairs.map((p) => p.condition)),
  ]
  const allConditions = ['A', 'B', 'C']
  return {
    coverageAchieved: allConditions.every((c) => coveredConditions.includes(c)),
    coveredConditions,
  }
}

// ── B-compatible static exports ───────────────────────────────────────────

export type McRow = { id: number; A: boolean; B: boolean; C: boolean; D: boolean }

const ALTITUDE_CONDITIONS = [
  { id: 'A', label: 'verticalSpeed > LIMIT' },
  { id: 'B', label: 'autopilotEngaged' },
  { id: 'C', label: 'pilotOverride' },
]

export const TRUTH_TABLE: McRow[] = generateTruthTable(
  ALTITUDE_CONDITIONS,
  'A && (B || C)',
).map((row) => ({
  id: row.index,
  A: row.values['A'] ?? false,
  B: row.values['B'] ?? false,
  C: row.values['C'] ?? false,
  D: row.decision,
}))

export function isValidIndependencePair(
  row1Id: number,
  row2Id: number,
  condition: string,
): boolean {
  const row1 = TRUTH_TABLE[row1Id]
  const row2 = TRUTH_TABLE[row2Id]
  if (!row1 || !row2) return false

  const allConditions = ['A', 'B', 'C'] as const
  for (const c of allConditions) {
    if (c === condition) {
      if (row1[c] === row2[c]) return false
    } else {
      if (row1[c] !== row2[c]) return false
    }
  }
  return row1.D !== row2.D
}
```

- [ ] **Step 4: Testlerin yeşil olduğunu doğrula**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm test -- --run
```

Beklenen: tüm testler geçer (32 eski + yeni mcdc-compat testleri).

- [ ] **Step 5: Commit**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity && git add app/src/engine/coverage/mcdc.ts app/tests/engine/mcdc-compat.test.ts && git commit -m "feat: add B-compatible exports to mcdc engine (TRUTH_TABLE, isValidIndependencePair, overload)"
```

---

### Task 2: simulateFaults + detectMisconceptions B-overload'ları

**Files:**
- Modify: `app/src/engine/faults/simulator.ts`
- Modify: `app/src/engine/misconceptions/detector.ts`
- Modify: `app/tests/engine/mcdc-compat.test.ts`

- [ ] **Step 1: `mcdc-compat.test.ts` dosyasına 2 yeni describe bloğu ekle**

Mevcut dosyanın sonuna ekle:

```typescript
import { simulateFaults } from '../../src/engine/faults/simulator'
import { detectMisconceptions } from '../../src/engine/misconceptions/detector'

describe('simulateFaults (B signature)', () => {
  test('C yi kapsayan pair F1 i yakalar', () => {
    const independencePairs = [{ condition: 'C', row1: 4, row2: 5 }]
    const result = simulateFaults({ selectedRows: [4, 5], independencePairs })
    expect(result).toContainEqual({ id: 'F1', detected: true })
  })

  test('C yi kapsamayan pair F1 i kaçırır', () => {
    const independencePairs = [{ condition: 'A', row1: 1, row2: 5 }]
    const result = simulateFaults({ selectedRows: [1, 5], independencePairs })
    expect(result).toContainEqual({ id: 'F1', detected: false })
  })

  test('boş submission F1 i kaçırır', () => {
    const result = simulateFaults({ selectedRows: [], independencePairs: [] })
    expect(result).toContainEqual({ id: 'F1', detected: false })
  })
})

describe('detectMisconceptions (B signature)', () => {
  test('geçerli pre-validated pairler için boş liste döner', () => {
    const independencePairs = [{ condition: 'A', row1: 1, row2: 5 }]
    const result = detectMisconceptions({ selectedRows: [1, 5], independencePairs })
    expect(result).toEqual([])
  })

  test('boş submission için boş liste döner', () => {
    const result = detectMisconceptions({ selectedRows: [], independencePairs: [] })
    expect(result).toEqual([])
  })
})
```

**Not:** Import satırlarını test dosyasının başına taşı (mevcut importların yanına).

Düzeltilmiş `app/tests/engine/mcdc-compat.test.ts` başlangıcı:

```typescript
import { describe, test, expect } from 'vitest'
import {
  TRUTH_TABLE,
  isValidIndependencePair,
  validateMcdcCoverage,
} from '../../src/engine/coverage/mcdc'
import { simulateFaults } from '../../src/engine/faults/simulator'
import { detectMisconceptions } from '../../src/engine/misconceptions/detector'
```

- [ ] **Step 2: Testlerin kırmızı olduğunu doğrula**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm test -- --run
```

Beklenen: yeni B-signature testleri FAIL.

- [ ] **Step 3: `app/src/engine/faults/simulator.ts` dosyasını güncelle**

Dosyayı tamamen şununla değiştir:

```typescript
import type { McdcSubmission, TruthTableRow } from '../types'
import type { CaseFile } from '../caseLoader'

type FaultSimulationResult = {
  detected: string[]
  missed: string[]
}

type BInput = {
  selectedRows: number[]
  independencePairs: Array<{ condition: string; row1: number; row2: number }>
}

function simulateFaultsCore(
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

export function simulateFaults(
  submission: McdcSubmission,
  truthTable: TruthTableRow[],
  caseFile: CaseFile,
): FaultSimulationResult
export function simulateFaults(input: BInput): Array<{ id: string; detected: boolean }>
export function simulateFaults(
  submissionOrInput: McdcSubmission | BInput,
  truthTable?: TruthTableRow[],
  caseFile?: CaseFile,
): FaultSimulationResult | Array<{ id: string; detected: boolean }> {
  if (Array.isArray(submissionOrInput)) {
    return simulateFaultsCore(submissionOrInput, truthTable!, caseFile!)
  }
  // B's path — altitude case seeded fault F1 is triggered by condition C
  const hasCPair = submissionOrInput.independencePairs.some((p) => p.condition === 'C')
  return [{ id: 'F1', detected: hasCPair }]
}
```

- [ ] **Step 4: `app/src/engine/misconceptions/detector.ts` dosyasını güncelle**

Dosyayı tamamen şununla değiştir:

```typescript
import type { McdcSubmission, TruthTableRow } from '../types'

type BInput = {
  selectedRows: number[]
  independencePairs: Array<{ condition: string; row1: number; row2: number }>
}

function detectMisconceptionsCore(
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

export function detectMisconceptions(
  submission: McdcSubmission,
  truthTable: TruthTableRow[],
): string[]
export function detectMisconceptions(input: BInput): string[]
export function detectMisconceptions(
  submissionOrInput: McdcSubmission | BInput,
  truthTable?: TruthTableRow[],
): string[] {
  if (Array.isArray(submissionOrInput)) {
    return detectMisconceptionsCore(submissionOrInput, truthTable!)
  }
  // B's path — pairs are pre-validated and de-duplicated by EvidenceScreen
  return []
}
```

- [ ] **Step 5: Tüm testlerin yeşil olduğunu doğrula**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm test -- --run
```

Beklenen: tüm testler geçer.

- [ ] **Step 6: Commit**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity && git add app/src/engine/faults/simulator.ts app/src/engine/misconceptions/detector.ts app/tests/engine/mcdc-compat.test.ts && git commit -m "feat: add B-compatible overloads to simulateFaults and detectMisconceptions"
```

---

### Task 3: GameStore extension

**Files:**
- Modify: `app/src/stores/gameStore.ts`
- Modify: `app/tests/stores/gameStore.test.ts`
- Create: `app/tests/stores/mcdc-store.test.ts`

- [ ] **Step 1: `tests/stores/gameStore.test.ts` dosyasını güncelle — `addPair` → `addToSubmission`**

`app/tests/stores/gameStore.test.ts` dosyasındaki tüm `addPair` çağrılarını `addToSubmission` ile değiştir. Test adlarını da güncelle:

```typescript
import { describe, test, expect, beforeEach } from 'vitest'
import { useGameStore } from '../../src/stores/gameStore'
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

beforeEach(() => {
  useGameStore.getState().resetGame()
})

describe('gameStore', () => {
  test('loadCase truthTable ve phase ayarlar', () => {
    useGameStore.getState().loadCase(tutorialCase)
    const { truthTable, phase, caseFile } = useGameStore.getState()
    expect(truthTable).toHaveLength(4)
    expect(phase).toBe('briefing')
    expect(caseFile?.id).toBe('mcdc-tutorial-01')
  })

  test('addToSubmission submission a ekler', () => {
    useGameStore.getState().loadCase(tutorialCase)
    useGameStore.getState().addToSubmission({ row1: 1, row2: 3 })
    const { submission } = useGameStore.getState()
    expect(submission).toHaveLength(1)
    expect(submission[0]).toEqual({ row1: 1, row2: 3 })
  })

  test('removePair submission dan çıkarır (sıra fark etmez)', () => {
    useGameStore.getState().loadCase(tutorialCase)
    useGameStore.getState().addToSubmission({ row1: 1, row2: 3 })
    useGameStore.getState().addToSubmission({ row1: 2, row2: 3 })
    useGameStore.getState().removePair(3, 1)
    const { submission } = useGameStore.getState()
    expect(submission).toHaveLength(1)
    expect(submission[0]).toEqual({ row1: 2, row2: 3 })
  })

  test('submitForVerdict verdict yazar ve phase trial a geçer', () => {
    useGameStore.getState().loadCase(tutorialCase)
    useGameStore.getState().addToSubmission({ row1: 1, row2: 3 })
    useGameStore.getState().addToSubmission({ row1: 2, row2: 3 })
    useGameStore.getState().submitForVerdict()
    const { verdict, phase } = useGameStore.getState()
    expect(phase).toBe('trial')
    expect(verdict?.passed).toBe(true)
    expect(verdict?.coverageAchieved).toBe(1.0)
  })

  test('advancePhase sıradaki fazı ayarlar', () => {
    useGameStore.getState().advancePhase()
    expect(useGameStore.getState().phase).toBe('investigation')
    useGameStore.getState().advancePhase()
    expect(useGameStore.getState().phase).toBe('evidence')
  })

  test('resetGame state i temizler', () => {
    useGameStore.getState().loadCase(tutorialCase)
    useGameStore.getState().addToSubmission({ row1: 1, row2: 3 })
    useGameStore.getState().resetGame()
    const state = useGameStore.getState()
    expect(state.caseFile).toBeNull()
    expect(state.submission).toHaveLength(0)
    expect(state.verdict).toBeNull()
    expect(state.phase).toBe('briefing')
  })
})
```

- [ ] **Step 2: `mcdc-store.test.ts` dosyasını oluştur**

`app/tests/stores/mcdc-store.test.ts`:

```typescript
import { describe, test, expect, beforeEach } from 'vitest'
import { useGameStore } from '../../src/stores/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
})

describe('mcdc store — toggleRow', () => {
  test('ilk tıklama satırı seçer', () => {
    useGameStore.getState().toggleRow(3)
    expect(useGameStore.getState().mcdc.selectedRows).toContain(3)
  })

  test('ikinci tıklama seçimi kaldırır', () => {
    useGameStore.getState().toggleRow(3)
    useGameStore.getState().toggleRow(3)
    expect(useGameStore.getState().mcdc.selectedRows).not.toContain(3)
  })

  test('farklı satırlar birbirini etkilemez', () => {
    useGameStore.getState().toggleRow(1)
    useGameStore.getState().toggleRow(3)
    expect(useGameStore.getState().mcdc.selectedRows).toContain(1)
    expect(useGameStore.getState().mcdc.selectedRows).toContain(3)
  })
})

describe('mcdc store — addPair + clearPairs', () => {
  test('addPair independencePairs e ekler', () => {
    useGameStore.getState().addPair({ condition: 'A', row1: 1, row2: 5 })
    const pairs = useGameStore.getState().mcdc.independencePairs
    expect(pairs).toHaveLength(1)
    expect(pairs[0]).toEqual({ condition: 'A', row1: 1, row2: 5 })
  })

  test('birden fazla pair eklenebilir', () => {
    useGameStore.getState().addPair({ condition: 'A', row1: 1, row2: 5 })
    useGameStore.getState().addPair({ condition: 'B', row1: 4, row2: 6 })
    expect(useGameStore.getState().mcdc.independencePairs).toHaveLength(2)
  })

  test('clearPairs tüm pairleri siler', () => {
    useGameStore.getState().addPair({ condition: 'A', row1: 1, row2: 5 })
    useGameStore.getState().addPair({ condition: 'B', row1: 4, row2: 6 })
    useGameStore.getState().clearPairs()
    expect(useGameStore.getState().mcdc.independencePairs).toHaveLength(0)
  })
})

describe('mcdc store — setVerdict', () => {
  test('verdictResult, faultResults ve misconceptions yazar', () => {
    const result = { coverageAchieved: true, coveredConditions: ['A', 'B', 'C'] }
    const faults = [{ id: 'F1', detected: true }]
    const misconceptions = ['MCDC-INDEP-AS-ISOLATION']
    useGameStore.getState().setVerdict(result, faults, misconceptions)
    const { mcdc } = useGameStore.getState()
    expect(mcdc.verdictResult).toEqual(result)
    expect(mcdc.faultResults).toEqual(faults)
    expect(mcdc.misconceptions).toEqual(misconceptions)
  })
})

describe('resetGame — mcdc temizlenir', () => {
  test('mcdc state sıfırlanır', () => {
    useGameStore.getState().toggleRow(3)
    useGameStore.getState().addPair({ condition: 'A', row1: 1, row2: 5 })
    useGameStore.getState().resetGame()
    const { mcdc } = useGameStore.getState()
    expect(mcdc.selectedRows).toHaveLength(0)
    expect(mcdc.independencePairs).toHaveLength(0)
    expect(mcdc.verdictResult).toBeNull()
    expect(mcdc.faultResults).toHaveLength(0)
    expect(mcdc.misconceptions).toHaveLength(0)
  })
})
```

- [ ] **Step 3: Testlerin kırmızı olduğunu doğrula**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm test -- --run
```

Beklenen: `addToSubmission` bulunamadı + mcdc store testleri FAIL.

- [ ] **Step 4: `app/src/stores/gameStore.ts` dosyasını güncelle**

Dosyayı tamamen şununla değiştir:

```typescript
import { create } from 'zustand'
import type { CaseFile } from '../engine/caseLoader'
import type {
  TruthTableRow,
  IndependencePair,
  McdcSubmission,
  VerdictResult,
  GamePhase,
} from '../engine/types'
import { generateTruthTable } from '../engine/coverage/mcdc'
import { computeVerdict } from '../engine/verdict/index'

export type Screen =
  | 'menu'
  | 'howToPlay'
  | 'campaign'
  | 'briefing'
  | 'investigation'
  | 'evidence'
  | 'trial'
  | 'debrief'
  | 'design'

type McdcPair = { condition: string; row1: number; row2: number }

type McdcVerdictResult = {
  coverageAchieved: boolean
  coveredConditions: string[]
}

type McdcFaultResult = {
  id: string
  detected: boolean
}

type McdcState = {
  selectedRows: number[]
  independencePairs: McdcPair[]
  verdictResult: McdcVerdictResult | null
  faultResults: McdcFaultResult[]
  misconceptions: string[]
}

const initialMcdc: McdcState = {
  selectedRows: [],
  independencePairs: [],
  verdictResult: null,
  faultResults: [],
  misconceptions: [],
}

interface GameState {
  // Week 3 state
  phase: GamePhase
  caseFile: CaseFile | null
  truthTable: TruthTableRow[]
  submission: McdcSubmission
  verdict: VerdictResult | null
  // B's MCDC state
  mcdc: McdcState
  // Week 3 actions
  loadCase: (caseData: CaseFile) => void
  addToSubmission: (pair: IndependencePair) => void
  removePair: (row1: number, row2: number) => void
  submitForVerdict: () => void
  advancePhase: () => void
  resetGame: () => void
  // B's MCDC actions
  toggleRow: (rowId: number) => void
  addPair: (pair: McdcPair) => void
  clearPairs: () => void
  setVerdict: (
    result: McdcVerdictResult,
    faults: McdcFaultResult[],
    misconceptions: string[],
  ) => void
}

const PHASES: GamePhase[] = ['briefing', 'investigation', 'evidence', 'trial', 'debrief']

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'briefing',
  caseFile: null,
  truthTable: [],
  submission: [],
  verdict: null,
  mcdc: initialMcdc,

  loadCase: (caseData) => {
    const truthTable = generateTruthTable(
      caseData.scenario.conditions,
      caseData.scenario.decision_expression,
    )
    set({
      caseFile: caseData,
      truthTable,
      phase: 'briefing',
      submission: [],
      verdict: null,
      mcdc: initialMcdc,
    })
  },

  addToSubmission: (pair) => {
    set((state) => ({ submission: [...state.submission, pair] }))
  },

  removePair: (row1, row2) => {
    set((state) => ({
      submission: state.submission.filter(
        (p) =>
          !(
            (p.row1 === row1 && p.row2 === row2) ||
            (p.row1 === row2 && p.row2 === row1)
          ),
      ),
    }))
  },

  submitForVerdict: () => {
    const { submission, truthTable, caseFile } = get()
    if (!caseFile) return
    const verdict = computeVerdict(submission, truthTable, caseFile)
    set({ verdict, phase: 'trial' })
  },

  advancePhase: () => {
    set((state) => {
      const current = PHASES.indexOf(state.phase)
      const next = PHASES[current + 1] ?? state.phase
      return { phase: next }
    })
  },

  resetGame: () => {
    set({
      phase: 'briefing',
      caseFile: null,
      truthTable: [],
      submission: [],
      verdict: null,
      mcdc: initialMcdc,
    })
  },

  toggleRow: (rowId) => {
    set((state) => {
      const { selectedRows } = state.mcdc
      const next = selectedRows.includes(rowId)
        ? selectedRows.filter((r) => r !== rowId)
        : [...selectedRows, rowId]
      return { mcdc: { ...state.mcdc, selectedRows: next } }
    })
  },

  addPair: (pair) => {
    set((state) => ({
      mcdc: {
        ...state.mcdc,
        independencePairs: [...state.mcdc.independencePairs, pair],
      },
    }))
  },

  clearPairs: () => {
    set((state) => ({ mcdc: { ...state.mcdc, independencePairs: [] } }))
  },

  setVerdict: (result, faults, misconceptions) => {
    set((state) => ({
      mcdc: {
        ...state.mcdc,
        verdictResult: result,
        faultResults: faults,
        misconceptions,
      },
    }))
  },
}))
```

- [ ] **Step 5: Tüm testlerin yeşil olduğunu doğrula**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm test -- --run
```

Beklenen: tüm testler geçer (32 eski + mcdc-compat + mcdc-store).

- [ ] **Step 6: Commit**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity && git add app/src/stores/gameStore.ts app/tests/stores/gameStore.test.ts app/tests/stores/mcdc-store.test.ts && git commit -m "feat: extend gameStore with Screen type, mcdc namespace and B-compatible actions"
```

---

### Task 4: Final doğrulama — build sıfır hata

**Files:** yok (sadece kontroller)

- [ ] **Step 1: Tüm testleri çalıştır**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm test -- --run
```

Beklenen: tüm test dosyaları geçer.

- [ ] **Step 2: TypeScript build kontrolü**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm build
```

Beklenen: `dist/` oluştu, **0 TypeScript hatası**. Bu adım kritik — B'nin ekranları artık compile etmeli.

- [ ] **Step 3: Lint kontrolü**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm lint
```

Beklenen: 0 problem.

- [ ] **Step 4: Engine React-free kontrolü**

```bash
grep -r "from 'react'" /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app/src/engine/ && echo "FAIL" || echo "PASS"
```

Beklenen: `PASS`

- [ ] **Step 5: Final commit**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity && git commit --allow-empty -m "feat: Week 4 integration complete — engine ↔ B UI bridge, build clean"
```

---

## Başarı Kriterleri Özeti

| Kriter | Komut | Beklenen |
|--------|-------|----------|
| Tüm testler geçer | `pnpm test -- --run` | tümü passed |
| TypeScript 0 hata | `pnpm build` | dist/ oluşur |
| Lint temiz | `pnpm lint` | 0 problem |
| Engine React-free | `grep -r "from 'react'" src/engine/` | PASS |
| B'nin 3 ekranı compile eder | `pnpm build` | 0 hata (içinde) |
