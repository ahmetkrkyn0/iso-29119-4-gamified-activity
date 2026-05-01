# Person A — Week 3 MCDC Engine Design

**Tarih:** 2026-05-01
**Kapsam:** Week 3 — Person A görevleri (engine tarafı)
**Proje:** Test Courthouse

---

## 1. Hedef

MCDC act'ini engine tarafında end-to-end çalışır hale getirmek. Person B UI'ı parallel yazarken bu engine'i tüketecek. Day 4 entegrasyon checkpoint'inde buluşulacak.

Kapsam dışı: Tüm UI bileşenleri (TruthTable görsel, verdict ekranı animasyonları, briefing ekranı).

---

## 2. Yaklaşım

Expression evaluator tabanlı, data-driven mimari. `decision_expression` case dosyasından okunur, küçük bir boolean parser tarafından değerlendirilir. Yeni case eklemek için kod değişikliği gerekmez.

---

## 3. Veri Tipleri (A↔B Arayüzü)

`src/engine/types.ts` dosyasında tanımlanır. Person B bu tipleri import eder.

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
  coverageAchieved: number       // 0.0–1.0
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

---

## 4. Case File Şeması — Güncelleme

`SeededFault`'a `trigger` alanı eklenir. `caseLoader.ts` Zod şeması güncellenir:

```typescript
const FaultTriggerSchema = z.object({
  condition: z.string(),           // hangi koşulun test edilmesi fault'u yakalar
  requiredDecisionFlip: z.boolean(), // pair decision'ı değiştirmeli mi
})

const SeededFaultSchema = z.object({
  id: z.string(),
  description: z.string(),
  trigger: FaultTriggerSchema,
})
```

Mevcut `mcdc-altitude-disengage-01.json` güncellenir:
```json
"seeded_faults": [
  {
    "id": "F1",
    "description": "Short-circuit evaluation skips C when B is true",
    "trigger": { "condition": "C", "requiredDecisionFlip": true }
  }
]
```

---

## 5. Engine Modülleri

### 5.1 `engine/coverage/mcdc.ts`

**`generateTruthTable(conditions, decisionExpression)`**
- `N` koşul için `2^N` satır üretir
- Her satır: `{ index, values: Record<string, boolean>, decision: boolean }`
- Expression evaluator: `&&`, `||`, `!`, `()`, identifier (tek harf/kelime) destekler
- `decision_expression` string'ini parse edip her satır için değerlendirir

**`validateMcdcCoverage(submission, truthTable, conditions)`**
- Her `IndependencePair` için geçerlilik kontrolü:
  - row1 ve row2 arasında tam olarak 1 koşul değişiyor mu?
  - decision iki satır arasında farklı mı?
- Her koşulun en az 1 geçerli çifti var mı?
- Döner: `{ coveredConditions, uncoveredConditions, coverageRatio }`

### 5.2 `engine/faults/simulator.ts`

**`simulateFaults(submission, truthTable, caseFile)`**
- Her fault için: `trigger.condition`'ını test eden geçerli bir pair var mı?
- Geçerli pair = tek koşul değişiyor + decision farklı + doğru koşul test ediliyor
- Döner: `{ detected: string[], missed: string[] }`

### 5.3 `engine/misconceptions/detector.ts`

**`detectMisconceptions(submission, truthTable)`**

İki detector:

1. **`MCDC-INDEP-AS-ISOLATION`**: Submission'da birden fazla koşulun değiştiği pair var mı veya decision'ın değişmediği pair var mı?

2. **`MCDC-DUPLICATE-PAIR`**: `(row1, row2)` çifti birden fazla kez var mı? (`(2,5)` ile `(5,2)` aynı sayılır.)

Döner: tetiklenen misconception ID'leri dizisi.

### 5.4 `engine/verdict/index.ts`

**`computeVerdict(submission, truthTable, caseFile)`**
- `validateMcdcCoverage` + `simulateFaults` + `detectMisconceptions` çağırır
- `VerdictResult` döner
- `passed = coverageAchieved === 1.0 && faultsMissed.length === 0`

---

## 6. Zustand Game Store

`src/stores/gameStore.ts` — Person A yazar, Person B okur.

```typescript
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
```

`loadCase` çağrıldığında `generateTruthTable` da çağrılır, `truthTable` store'a yazılır.
`submitForVerdict` çağrıldığında `computeVerdict` çalışır, `verdict` store'a yazılır, `phase` → `'trial'`'a geçer.

---

## 7. Case Dosyaları

### `mcdc-tutorial-01.json`
- 2 koşul: `A && B`
- difficulty: 1
- 4 satır truth table
- Seeded fault: A koşulunu test eden pair eksik olunca yakalanmaz
- Misconception trap: yok (tutorial)

### `mcdc-altitude-disengage-01.json` (güncelleme)
- Mevcut — sadece `trigger` alanı eklenir
- difficulty: 2

### `mcdc-trap-isolation-01.json`
- 3 koşul: `A || (B && C)`
- difficulty: 3
- Tuzak: her koşulu izole test etmek cazip görünür ama independence sağlanmaz
- Seeded fault: yalnızca gerçek independence pair'ı olan test suite yakalar
- Misconception: `MCDC-INDEP-AS-ISOLATION` tetiklenir

---

## 8. Test Kapsamı

- `generateTruthTable`: 2 ve 3 koşul için doğru satır sayısı ve decision değerleri
- `validateMcdcCoverage`: geçerli submission → tam coverage, eksik pair → eksik coverage
- `simulateFaults`: doğru pair fault'u yakalar, yanlış pair yakalamaz
- `detectMisconceptions`: isolation pattern → `MCDC-INDEP-AS-ISOLATION`, duplicate → `MCDC-DUPLICATE-PAIR`
- `computeVerdict`: end-to-end, geçerli submission → `passed: true`
- `gameStore`: `loadCase` truthTable'ı populate eder, `submitForVerdict` verdict'i yazar

---

## 9. Başarı Kriterleri (Week 3 sonu)

- [ ] `pnpm test -- --run` — tüm testler geçer
- [ ] `pnpm build` — 0 hata
- [ ] `engine/` dizininde React import yok
- [ ] Person B store'dan `truthTable`, `submission`, `verdict` okuyabiliyor
- [ ] 3 case dosyası Zod validasyonundan geçiyor
- [ ] `mcdc-altitude-disengage-01` end-to-end: doğru submission → `passed: true`
