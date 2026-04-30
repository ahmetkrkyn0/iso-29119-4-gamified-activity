# Person A — Week 3 MCDC Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** MCDC act'ini engine tarafında end-to-end çalışır hale getirmek — expression evaluator, coverage validator, fault simulator, misconception detectors, verdict orchestrator ve Zustand game store.

**Architecture:** Expression evaluator tabanlı, data-driven mimari. `decision_expression` string'i case dosyasından okunur, küçük bir recursive descent parser tarafından evaluate edilir. Tüm engine fonksiyonları saf TypeScript — React import yasak. TDD sırası: her modül için önce test yaz, sonra implement et.

**Tech Stack:** TypeScript (strict), Zod, Zustand, Vitest

---

### Task 1: Paylaşılan tipler

**Files:**
- Create: `app/src/engine/types.ts`

- [ ] **Step 1: `app/src/engine/types.ts` dosyasını oluştur**

```typescript
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
```

- [ ] **Step 2: TypeScript kontrolü**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm exec tsc --noEmit
```

Beklenen: 0 hata.

- [ ] **Step 3: Commit**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity && git add app/src/engine/types.ts && git commit -m "feat: add shared engine types"
```

---

### Task 2: CaseLoader şema güncellemesi + case dosyaları

**Files:**
- Modify: `app/src/engine/caseLoader.ts`
- Modify: `app/src/content/cases/mcdc-altitude-disengage-01.json`
- Create: `app/src/content/cases/mcdc-tutorial-01.json`
- Create: `app/src/content/cases/mcdc-trap-isolation-01.json`
- Modify: `app/tests/caseLoader.test.ts`

`SeededFault`'a `trigger` alanı ekleniyor. Bu breaking change — mevcut JSON güncellenmeli.

- [ ] **Step 1: Mevcut testi kırmızıya çevir — `trigger` alanını test et**

`app/tests/caseLoader.test.ts` dosyasına 4. test ekle (diğerleri aynı kalır):

```typescript
import { describe, test, expect } from 'vitest'
import { CaseFileSchema, loadCase } from '../src/engine/caseLoader'
import validCaseJson from '../src/content/cases/mcdc-altitude-disengage-01.json'

const validCase = validCaseJson as Record<string, unknown>

describe('CaseFile schema', () => {
  test('geçerli MCDC case dosyasını parse eder', () => {
    expect(() => loadCase(validCase)).not.toThrow()
  })

  test('eksik zorunlu alan reddedilir', () => {
    const { act: _act, ...withoutAct } = validCase
    const result = CaseFileSchema.safeParse(withoutAct)
    expect(result.success).toBe(false)
  })

  test('geçersiz act enum değeri reddedilir', () => {
    const result = CaseFileSchema.safeParse({ ...validCase, act: 'Unknown' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const actIssue = result.error.issues.find((i) => i.path.includes('act'))
      expect(actIssue).toBeDefined()
    }
  })

  test('seeded_fault trigger alanı zorunludur', () => {
    const faultWithoutTrigger = {
      ...validCase,
      seeded_faults: [{ id: 'F1', description: 'test' }],
    }
    const result = CaseFileSchema.safeParse(faultWithoutTrigger)
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 2: Testin kırmızı olduğunu doğrula**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm test -- --run
```

Beklenen: 4. test FAIL — trigger alanı schema'da henüz yok.

- [ ] **Step 3: `caseLoader.ts` şemasını güncelle**

`app/src/engine/caseLoader.ts` dosyasını şununla değiştir:

```typescript
import { z } from 'zod'

const ConditionSchema = z.object({
  id: z.string(),
  label: z.string(),
})

const FaultTriggerSchema = z.object({
  condition: z.string(),
  requiredDecisionFlip: z.boolean(),
})

const SeededFaultSchema = z.object({
  id: z.string(),
  description: z.string(),
  trigger: FaultTriggerSchema,
})

const MisconceptionSchema = z.object({
  id: z.string(),
  explanation_md: z.string(),
})

export const CaseFileSchema = z.object({
  id: z.string(),
  act: z.enum(['MCDC', 'BCC', 'Combinatorial', 'DataFlow']),
  difficulty: z.number().int().min(1).max(3),
  iso_clauses: z.array(z.string()),
  scenario: z.object({
    title: z.string(),
    narrative: z.string(),
    code: z.string(),
    conditions: z.array(ConditionSchema),
    decision_expression: z.string(),
  }),
  seeded_faults: z.array(SeededFaultSchema),
  misconceptions: z.array(MisconceptionSchema),
})

export type CaseFile = z.infer<typeof CaseFileSchema>

export function loadCase(json: unknown): CaseFile {
  return CaseFileSchema.parse(json)
}
```

- [ ] **Step 4: `mcdc-altitude-disengage-01.json` dosyasını güncelle — trigger ekle**

`app/src/content/cases/mcdc-altitude-disengage-01.json` dosyasını şununla değiştir:

```json
{
  "id": "mcdc-altitude-disengage-01",
  "act": "MCDC",
  "difficulty": 2,
  "iso_clauses": ["§5.3.6", "§3.36", "Annex C.2.3.6"],
  "scenario": {
    "title": "Altitude Hold Disengage",
    "narrative": "A flight control law disengages altitude hold when vertical speed exceeds the limit and either the autopilot is engaged or the pilot has override active.",
    "code": "if (verticalSpeed > LIMIT && (autopilotEngaged || pilotOverride)) disengage();",
    "conditions": [
      { "id": "A", "label": "verticalSpeed > LIMIT" },
      { "id": "B", "label": "autopilotEngaged" },
      { "id": "C", "label": "pilotOverride" }
    ],
    "decision_expression": "A && (B || C)"
  },
  "seeded_faults": [
    {
      "id": "F1",
      "description": "Short-circuit evaluation skips C when B is true",
      "trigger": { "condition": "C", "requiredDecisionFlip": true }
    }
  ],
  "misconceptions": [
    {
      "id": "MCDC-INDEP-AS-ISOLATION",
      "explanation_md": "You tested each condition in isolation, but ISO §5.3.6.2 requires *paired* test cases in which one condition changes while all others remain fixed and the decision outcome flips."
    }
  ]
}
```

- [ ] **Step 5: 4 testin yeşil olduğunu doğrula**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm test -- --run
```

Beklenen: `Tests 4 passed (4)`

- [ ] **Step 6: Tutorial case dosyasını oluştur**

`app/src/content/cases/mcdc-tutorial-01.json`:

```json
{
  "id": "mcdc-tutorial-01",
  "act": "MCDC",
  "difficulty": 1,
  "iso_clauses": ["§5.3.6", "§3.36"],
  "scenario": {
    "title": "Simple Safety Gate",
    "narrative": "A safety system activates when sensor A is triggered AND button B is pressed.",
    "code": "if (sensorTriggered && buttonPressed) activate();",
    "conditions": [
      { "id": "A", "label": "sensorTriggered" },
      { "id": "B", "label": "buttonPressed" }
    ],
    "decision_expression": "A && B"
  },
  "seeded_faults": [
    {
      "id": "F1",
      "description": "Button B check is bypassed when sensor A is triggered",
      "trigger": { "condition": "B", "requiredDecisionFlip": true }
    }
  ],
  "misconceptions": [
    {
      "id": "MCDC-INDEP-AS-ISOLATION",
      "explanation_md": "You tested each condition in isolation. MCDC requires *paired* test cases where one condition changes while all others remain fixed and the decision outcome flips."
    }
  ]
}
```

- [ ] **Step 7: Trap case dosyasını oluştur**

`app/src/content/cases/mcdc-trap-isolation-01.json`:

```json
{
  "id": "mcdc-trap-isolation-01",
  "act": "MCDC",
  "difficulty": 3,
  "iso_clauses": ["§5.3.6", "§5.3.6.2", "Annex C.2.3.6"],
  "scenario": {
    "title": "Emergency Override",
    "narrative": "An emergency system triggers when alarm A fires, or when both backup sensor B and manual override C are active.",
    "code": "if (alarmA || (backupSensor && manualOverride)) trigger();",
    "conditions": [
      { "id": "A", "label": "alarmA" },
      { "id": "B", "label": "backupSensor" },
      { "id": "C", "label": "manualOverride" }
    ],
    "decision_expression": "A || (B && C)"
  },
  "seeded_faults": [
    {
      "id": "F1",
      "description": "Manual override C is ignored when backup sensor B is inactive",
      "trigger": { "condition": "C", "requiredDecisionFlip": true }
    }
  ],
  "misconceptions": [
    {
      "id": "MCDC-INDEP-AS-ISOLATION",
      "explanation_md": "For `A || (B && C)`, testing each condition alone in isolation (e.g. only A changes while others are false) may not produce a valid independence pair because the decision may not flip. You need pairs where exactly one condition changes AND the decision flips."
    }
  ]
}
```

- [ ] **Step 8: Tüm testler hâlâ geçiyor mu**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm test -- --run
```

Beklenen: `Tests 4 passed (4)`

- [ ] **Step 9: Commit**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity && git add app/src/engine/caseLoader.ts app/tests/caseLoader.test.ts app/src/content/cases/ && git commit -m "feat: add trigger to SeededFault schema + 3 MCDC case files"
```

---

### Task 3: Expression evaluator + truth table generator

**Files:**
- Modify: `app/src/engine/coverage/mcdc.ts`
- Create: `app/tests/engine/coverage.test.ts`

- [ ] **Step 1: Test dizinini oluştur**

```bash
mkdir -p /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app/tests/engine
mkdir -p /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app/tests/stores
```

- [ ] **Step 2: Failing testleri yaz**

`app/tests/engine/coverage.test.ts`:

```typescript
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
    // Row 0: A=F, B=F → F
    expect(rows[0]).toEqual({ index: 0, values: { A: false, B: false }, decision: false })
    // Row 1: A=F, B=T → F
    expect(rows[1]).toEqual({ index: 1, values: { A: false, B: true }, decision: false })
    // Row 2: A=T, B=F → F
    expect(rows[2]).toEqual({ index: 2, values: { A: true, B: false }, decision: false })
    // Row 3: A=T, B=T → T
    expect(rows[3]).toEqual({ index: 3, values: { A: true, B: true }, decision: true })
  })

  test('A && (B || C) için doğru decision değerleri', () => {
    const rows = generateTruthTable(threeConditions, 'A && (B || C)')
    // Row 7: A=T, B=T, C=T → T
    expect(rows[7]?.decision).toBe(true)
    // Row 0: A=F, B=F, C=F → F
    expect(rows[0]?.decision).toBe(false)
    // Row 4: A=T, B=F, C=F → F
    expect(rows[4]?.decision).toBe(false)
    // Row 5: A=T, B=F, C=T → T
    expect(rows[5]?.decision).toBe(true)
  })

  test('! operatörü çalışır', () => {
    const rows = generateTruthTable(twoConditions, '!A && B')
    // Row 1: A=F, B=T → !F && T = T
    expect(rows[1]?.decision).toBe(true)
    // Row 3: A=T, B=T → !T && T = F
    expect(rows[3]?.decision).toBe(false)
  })
})

describe('validateMcdcCoverage', () => {
  const rows = generateTruthTable(twoConditions, 'A && B')
  // Rows: 0=(F,F,F), 1=(F,T,F), 2=(T,F,F), 3=(T,T,T)
  // Valid pairs: (1,3) covers A [A changes F→T, B fixed T, decision F→T]
  //             (2,3) covers B [B changes F→T, A fixed T, decision F→T]

  test('geçerli submission tam coverage sağlar', () => {
    const submission = [{ row1: 1, row2: 3 }, { row1: 2, row2: 3 }]
    const result = validateMcdcCoverage(submission, rows, twoConditions)
    expect(result.coverageRatio).toBe(1.0)
    expect(result.coveredConditions).toContain('A')
    expect(result.coveredConditions).toContain('B')
    expect(result.uncoveredConditions).toHaveLength(0)
  })

  test('eksik pair eksik coverage döner', () => {
    const submission = [{ row1: 1, row2: 3 }] // sadece A covered
    const result = validateMcdcCoverage(submission, rows, twoConditions)
    expect(result.coverageRatio).toBe(0.5)
    expect(result.coveredConditions).toContain('A')
    expect(result.uncoveredConditions).toContain('B')
  })

  test('birden fazla koşul değişen pair geçersiz sayılır', () => {
    // Row 0 (A=F,B=F) → Row 3 (A=T,B=T): both A and B change
    const submission = [{ row1: 0, row2: 3 }]
    const result = validateMcdcCoverage(submission, rows, twoConditions)
    expect(result.coverageRatio).toBe(0)
    expect(result.invalidPairs).toHaveLength(1)
  })

  test('decision değişmeyen pair geçersiz sayılır', () => {
    // Row 0 (A=F,B=F,decision=F) → Row 1 (A=F,B=T,decision=F): B changes but decision stays F
    const submission = [{ row1: 0, row2: 1 }]
    const result = validateMcdcCoverage(submission, rows, twoConditions)
    expect(result.coverageRatio).toBe(0)
    expect(result.invalidPairs).toHaveLength(1)
  })
})
```

- [ ] **Step 3: Testlerin kırmızı olduğunu doğrula**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm test -- --run
```

Beklenen: coverage testleri FAIL — fonksiyonlar henüz implement edilmedi.

- [ ] **Step 4: `engine/coverage/mcdc.ts` dosyasını implement et**

`app/src/engine/coverage/mcdc.ts` dosyasını tamamen şununla değiştir:

```typescript
import type { TruthTableRow, IndependencePair, McdcSubmission } from '../types'

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
      pos++ // skip ')'
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

export function validateMcdcCoverage(
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
```

- [ ] **Step 5: Testlerin yeşil olduğunu doğrula**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm test -- --run
```

Beklenen: `Tests 13 passed (13)` (4 eski + 9 yeni).

- [ ] **Step 6: TypeScript kontrolü**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm exec tsc --noEmit
```

Beklenen: 0 hata.

- [ ] **Step 7: Commit**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity && git add app/src/engine/coverage/mcdc.ts app/tests/engine/coverage.test.ts && git commit -m "feat: implement expression evaluator and truth table generator (TDD green)"
```

---

### Task 4: Fault simulator

**Files:**
- Modify: `app/src/engine/faults/simulator.ts`
- Create: `app/tests/engine/faults.test.ts`

- [ ] **Step 1: Failing testleri yaz**

`app/tests/engine/faults.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { simulateFaults } from '../../src/engine/faults/simulator'
import { generateTruthTable } from '../../src/engine/coverage/mcdc'
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

// Truth table for A && B:
// Row 0: A=F,B=F → F
// Row 1: A=F,B=T → F
// Row 2: A=T,B=F → F
// Row 3: A=T,B=T → T
const truthTable = generateTruthTable(tutorialCase.scenario.conditions, tutorialCase.scenario.decision_expression)

describe('simulateFaults', () => {
  test('B yi test eden geçerli pair F1 fault unu yakalar', () => {
    // pair(2,3): B changes F→T, A fixed T, decision flips F→T → tests B
    const submission = [{ row1: 2, row2: 3 }]
    const result = simulateFaults(submission, truthTable, tutorialCase)
    expect(result.detected).toContain('F1')
    expect(result.missed).toHaveLength(0)
  })

  test('B yi test etmeyen pair F1 fault unu kaçırır', () => {
    // pair(1,3): A changes F→T, B fixed T, decision flips F→T → tests A, not B
    const submission = [{ row1: 1, row2: 3 }]
    const result = simulateFaults(submission, truthTable, tutorialCase)
    expect(result.missed).toContain('F1')
    expect(result.detected).toHaveLength(0)
  })

  test('boş submission tüm faultları kaçırır', () => {
    const result = simulateFaults([], truthTable, tutorialCase)
    expect(result.missed).toContain('F1')
    expect(result.detected).toHaveLength(0)
  })

  test('geçersiz pair (decision değişmiyor) fault yakalamaz', () => {
    // pair(0,1): B changes but decision stays F → not valid independence pair
    const submission = [{ row1: 0, row2: 1 }]
    const result = simulateFaults(submission, truthTable, tutorialCase)
    expect(result.missed).toContain('F1')
  })
})
```

- [ ] **Step 2: Testlerin kırmızı olduğunu doğrula**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm test -- --run
```

Beklenen: faults testleri FAIL.

- [ ] **Step 3: `engine/faults/simulator.ts` dosyasını implement et**

`app/src/engine/faults/simulator.ts` dosyasını tamamen şununla değiştir:

```typescript
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
```

- [ ] **Step 4: Testlerin yeşil olduğunu doğrula**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm test -- --run
```

Beklenen: tüm testler geçer.

- [ ] **Step 5: Commit**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity && git add app/src/engine/faults/simulator.ts app/tests/engine/faults.test.ts && git commit -m "feat: implement fault simulator (TDD green)"
```

---

### Task 5: Misconception detectors

**Files:**
- Modify: `app/src/engine/misconceptions/detector.ts`
- Create: `app/tests/engine/misconceptions.test.ts`

- [ ] **Step 1: Failing testleri yaz**

`app/tests/engine/misconceptions.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { detectMisconceptions } from '../../src/engine/misconceptions/detector'
import { generateTruthTable } from '../../src/engine/coverage/mcdc'

const conditions = [{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }]
// Truth table for A && B:
// Row 0: A=F,B=F → F
// Row 1: A=F,B=T → F
// Row 2: A=T,B=F → F
// Row 3: A=T,B=T → T
const truthTable = generateTruthTable(conditions, 'A && B')

describe('detectMisconceptions', () => {
  test('geçerli submission için misconception yok', () => {
    // pair(1,3): A changes, B fixed, decision flips → valid
    // pair(2,3): B changes, A fixed, decision flips → valid
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
```

- [ ] **Step 2: Testlerin kırmızı olduğunu doğrula**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm test -- --run
```

Beklenen: misconceptions testleri FAIL.

- [ ] **Step 3: `engine/misconceptions/detector.ts` dosyasını implement et**

`app/src/engine/misconceptions/detector.ts` dosyasını tamamen şununla değiştir:

```typescript
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
```

- [ ] **Step 4: Testlerin yeşil olduğunu doğrula**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm test -- --run
```

Beklenen: tüm testler geçer.

- [ ] **Step 5: Commit**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity && git add app/src/engine/misconceptions/detector.ts app/tests/engine/misconceptions.test.ts && git commit -m "feat: implement misconception detectors (TDD green)"
```

---

### Task 6: Verdict orchestrator

**Files:**
- Create: `app/src/engine/verdict/index.ts`
- Create: `app/tests/engine/verdict.test.ts`

- [ ] **Step 1: Dizini oluştur**

```bash
mkdir -p /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app/src/engine/verdict
```

- [ ] **Step 2: Failing testleri yaz**

`app/tests/engine/verdict.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { computeVerdict } from '../../src/engine/verdict/index'
import { generateTruthTable } from '../../src/engine/coverage/mcdc'
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

// Truth table for A && B:
// Row 1: A=F,B=T → F   Row 2: A=T,B=F → F   Row 3: A=T,B=T → T
// pair(1,3): covers A   pair(2,3): covers B + detects F1
const truthTable = generateTruthTable(
  tutorialCase.scenario.conditions,
  tutorialCase.scenario.decision_expression,
)

describe('computeVerdict', () => {
  test('geçerli ve tam submission passed:true döner', () => {
    const submission = [{ row1: 1, row2: 3 }, { row1: 2, row2: 3 }]
    const verdict = computeVerdict(submission, truthTable, tutorialCase)
    expect(verdict.passed).toBe(true)
    expect(verdict.coverageAchieved).toBe(1.0)
    expect(verdict.faultsDetected).toContain('F1')
    expect(verdict.faultsMissed).toHaveLength(0)
    expect(verdict.misconceptions).toHaveLength(0)
  })

  test('eksik coverage ile passed:false döner', () => {
    // sadece A covered, B covered değil, F1 yakalanmadı
    const submission = [{ row1: 1, row2: 3 }]
    const verdict = computeVerdict(submission, truthTable, tutorialCase)
    expect(verdict.passed).toBe(false)
    expect(verdict.coverageAchieved).toBe(0.5)
    expect(verdict.uncoveredConditions).toContain('B')
    expect(verdict.faultsMissed).toContain('F1')
  })

  test('misconception varsa verdict içinde raporlanır', () => {
    // pair(0,3): both A and B change → isolation misconception
    const submission = [{ row1: 0, row2: 3 }]
    const verdict = computeVerdict(submission, truthTable, tutorialCase)
    expect(verdict.misconceptions).toContain('MCDC-INDEP-AS-ISOLATION')
  })

  test('boş submission sıfır coverage döner', () => {
    const verdict = computeVerdict([], truthTable, tutorialCase)
    expect(verdict.passed).toBe(false)
    expect(verdict.coverageAchieved).toBe(0)
    expect(verdict.coveredConditions).toHaveLength(0)
  })
})
```

- [ ] **Step 3: Testlerin kırmızı olduğunu doğrula**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm test -- --run
```

Beklenen: verdict testleri FAIL.

- [ ] **Step 4: `engine/verdict/index.ts` dosyasını implement et**

`app/src/engine/verdict/index.ts`:

```typescript
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
```

- [ ] **Step 5: Testlerin yeşil olduğunu doğrula**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm test -- --run
```

Beklenen: tüm testler geçer.

- [ ] **Step 6: Commit**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity && git add app/src/engine/verdict/ app/tests/engine/verdict.test.ts && git commit -m "feat: implement verdict orchestrator (TDD green)"
```

---

### Task 7: Zustand game store

**Files:**
- Create: `app/src/stores/gameStore.ts`
- Create: `app/tests/stores/gameStore.test.ts`

- [ ] **Step 1: Stores dizinini oluştur**

```bash
mkdir -p /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app/src/stores
```

- [ ] **Step 2: Failing testleri yaz**

`app/tests/stores/gameStore.test.ts`:

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
    expect(truthTable).toHaveLength(4) // 2^2
    expect(phase).toBe('briefing')
    expect(caseFile?.id).toBe('mcdc-tutorial-01')
  })

  test('addPair submission a ekler', () => {
    useGameStore.getState().loadCase(tutorialCase)
    useGameStore.getState().addPair({ row1: 1, row2: 3 })
    const { submission } = useGameStore.getState()
    expect(submission).toHaveLength(1)
    expect(submission[0]).toEqual({ row1: 1, row2: 3 })
  })

  test('removePair submission dan çıkarır (sıra fark etmez)', () => {
    useGameStore.getState().loadCase(tutorialCase)
    useGameStore.getState().addPair({ row1: 1, row2: 3 })
    useGameStore.getState().addPair({ row1: 2, row2: 3 })
    useGameStore.getState().removePair(3, 1) // reversed order
    const { submission } = useGameStore.getState()
    expect(submission).toHaveLength(1)
    expect(submission[0]).toEqual({ row1: 2, row2: 3 })
  })

  test('submitForVerdict verdict yazar ve phase trial a geçer', () => {
    useGameStore.getState().loadCase(tutorialCase)
    // Valid submission: pair(1,3) covers A, pair(2,3) covers B + detects F1
    useGameStore.getState().addPair({ row1: 1, row2: 3 })
    useGameStore.getState().addPair({ row1: 2, row2: 3 })
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
    useGameStore.getState().addPair({ row1: 1, row2: 3 })
    useGameStore.getState().resetGame()
    const state = useGameStore.getState()
    expect(state.caseFile).toBeNull()
    expect(state.submission).toHaveLength(0)
    expect(state.verdict).toBeNull()
    expect(state.phase).toBe('briefing')
  })
})
```

- [ ] **Step 3: Testlerin kırmızı olduğunu doğrula**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm test -- --run
```

Beklenen: gameStore testleri FAIL.

- [ ] **Step 4: `stores/gameStore.ts` dosyasını implement et**

`app/src/stores/gameStore.ts`:

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

interface GameState {
  phase: GamePhase
  caseFile: CaseFile | null
  truthTable: TruthTableRow[]
  submission: McdcSubmission
  verdict: VerdictResult | null
  loadCase: (caseData: CaseFile) => void
  addPair: (pair: IndependencePair) => void
  removePair: (row1: number, row2: number) => void
  submitForVerdict: () => void
  advancePhase: () => void
  resetGame: () => void
}

const PHASES: GamePhase[] = ['briefing', 'investigation', 'evidence', 'trial', 'debrief']

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'briefing',
  caseFile: null,
  truthTable: [],
  submission: [],
  verdict: null,

  loadCase: (caseData) => {
    const truthTable = generateTruthTable(
      caseData.scenario.conditions,
      caseData.scenario.decision_expression,
    )
    set({ caseFile: caseData, truthTable, phase: 'briefing', submission: [], verdict: null })
  },

  addPair: (pair) => {
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
    set({ phase: 'briefing', caseFile: null, truthTable: [], submission: [], verdict: null })
  },
}))
```

- [ ] **Step 5: Testlerin yeşil olduğunu doğrula**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm test -- --run
```

Beklenen: tüm testler geçer.

- [ ] **Step 6: TypeScript + lint kontrolü**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm exec tsc --noEmit && pnpm lint
```

Beklenen: 0 hata, 0 uyarı.

- [ ] **Step 7: Engine React-free kontrolü**

```bash
grep -r "from 'react'" /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app/src/engine/ && echo "FAIL" || echo "PASS"
```

Beklenen: `PASS`

- [ ] **Step 8: Commit**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity && git add app/src/stores/ app/tests/stores/ && git commit -m "feat: implement Zustand game store (TDD green)"
```

---

### Task 8: Final doğrulama

**Files:** yok (sadece kontroller)

- [ ] **Step 1: Tüm testleri çalıştır**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm test -- --run
```

Beklenen: tüm testler geçer (4 caseLoader + 9 coverage + 4 faults + 5 misconceptions + 4 verdict + 6 gameStore = 32 test).

- [ ] **Step 2: Build kontrolü**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm build
```

Beklenen: `dist/` oluştu, 0 hata.

- [ ] **Step 3: Lint kontrolü**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app && pnpm lint
```

Beklenen: 0 problem.

- [ ] **Step 4: Engine React-free son kontrol**

```bash
grep -r "from 'react'" /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app/src/engine/ && echo "FAIL" || echo "PASS"
```

Beklenen: `PASS`

- [ ] **Step 5: Final commit**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity && git add app/ && git commit -m "feat: Week 3 Person A engine complete — all checks pass" --allow-empty
```

---

## Başarı Kriterleri Özeti

| Kriter | Komut | Beklenen |
|--------|-------|----------|
| Tüm testler geçer | `pnpm test -- --run` | 32 passed |
| TypeScript hatasız | `pnpm build` | 0 hata |
| ESLint temiz | `pnpm lint` | 0 problem |
| Engine React-free | `grep -r "from 'react'" src/engine/` | PASS |
| Person B store okuyor | `useGameStore` export | ✓ |
| 3 case dosyası geçerli | Zod parse | ✓ |
| End-to-end verdict | tutorial case + valid submission | `passed: true` |
