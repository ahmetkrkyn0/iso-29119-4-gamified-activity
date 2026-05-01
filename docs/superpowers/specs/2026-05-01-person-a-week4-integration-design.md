# Person A — Week 4 Integration Design (Engine ↔ B UI)

**Tarih:** 2026-05-01
**Kapsam:** Week 4 — ilk adım: Week 3 engine'ini Person B'nin MCDC ekranlarıyla entegre et
**Proje:** Test Courthouse

---

## 1. Sorun

Person B'nin ekranları (`InvestigationScreen`, `EvidenceScreen`, `TrialScreen`) Week 3 engine'inden farklı bir interface bekliyor. Build şu an TypeScript hataları veriyor; MCDC end-to-end oynamıyor.

| B'nin beklentisi | Week 3'ün sunduğu |
|----------------|------------------|
| `TRUTH_TABLE` (static export) | `generateTruthTable(conditions, expr)` |
| `isValidIndependencePair(r1, r2, cond)` | yok |
| `validateMcdcCoverage({selectedRows, independencePairs})` | farklı signature |
| `simulateFaults({selectedRows, independencePairs})` | farklı signature |
| `detectMisconceptions({selectedRows, independencePairs})` | farklı signature |
| `mcdc.selectedRows`, `mcdc.independencePairs` store'da | yok |
| `toggleRow`, `addPair({condition,row1,row2})`, `clearPairs`, `setVerdict` | yok |
| `Screen` type export | yok |

---

## 2. Yaklaşım: Extend + Adapter

Week 3 engine fonksiyonları ve testleri korunur. B'nin beklediği signature'larla ince adapter fonksiyonlar/exportlar eklenir. GameStore `mcdc` namespace ile genişler. 32 mevcut test kırılmaz.

---

## 3. Engine Eklemeleri

### 3.1 `engine/coverage/mcdc.ts`

Mevcut `generateTruthTable` ve `validateMcdcCoverage` dokunulmaz.

**Yeni tip:**
```typescript
export type McRow = { id: number; A: boolean; B: boolean; C: boolean; D: boolean }
```

**`TRUTH_TABLE` sabiti:**
Altitude case (`A && (B || C)`, 3 koşul) için `generateTruthTable` ile üretilir, `McRow[]` formatına dönüştürülür. 8 satır.

```typescript
export const TRUTH_TABLE: McRow[] = generatedRows.map(row => ({
  id: row.index,
  A: row.values['A'] ?? false,
  B: row.values['B'] ?? false,
  C: row.values['C'] ?? false,
  D: row.decision,
}))
```

**`isValidIndependencePair(row1Id, row2Id, condition)`:**
`TRUTH_TABLE`'dan iki satır alır.
- `condition` değişmiş mi? (gerekli)
- Diğer koşullar sabit mi? (gerekli)
- D (decision) flip'lemiş mi? (gerekli)
Döner: `boolean`

**`validateMcdcCoverage` B-overload:**
```typescript
// B'nin çağırma şekli:
validateMcdcCoverage({ selectedRows, independencePairs })
// → { coverageAchieved: boolean, coveredConditions: string[] }
```
`independencePairs`'ı `McdcSubmission` formatına (`{row1, row2}[]`) çevirip mevcut coverage logic'ini çalıştırır.

### 3.2 `engine/faults/simulator.ts`

Mevcut `simulateFaults` korunur. B-overload eklenir:
```typescript
// B'nin çağırma şekli:
simulateFaults({ selectedRows, independencePairs })
// → Array<{ id: string; detected: boolean }>
```
Altitude case'in seeded_faults'ını kullanarak her fault için detected/missed hesaplar.

### 3.3 `engine/misconceptions/detector.ts`

Mevcut `detectMisconceptions` korunur. B-overload eklenir:
```typescript
// B'nin çağırma şekli:
detectMisconceptions({ selectedRows, independencePairs })
// → string[]  (misconception ID listesi)
```

---

## 4. GameStore Extension

Mevcut `GameState` interface'i korunur. `mcdc` namespace eklenir:

```typescript
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

interface McdcState {
  selectedRows: number[]
  independencePairs: McdcPair[]
  verdictResult: McdcVerdictResult | null
  faultResults: McdcFaultResult[]
  misconceptions: string[]
}
```

**Mevcut `GameState`'e eklenenler:**
```typescript
mcdc: McdcState
toggleRow: (rowId: number) => void
addPair: (pair: McdcPair) => void      // mevcut addPair'ın YANINA eklenir
clearPairs: () => void
setVerdict: (
  result: McdcVerdictResult,
  faults: McdcFaultResult[],
  misconceptions: string[]
) => void
```

**Not:** Mevcut `addPair(pair: IndependencePair)` için isim çakışması var. Çözüm: mevcut `addPair` → `addMcdcPair` olarak yeniden adlandırılır (Week 3 testleri güncellenir).

**`mcdc` initial state:**
```typescript
mcdc: {
  selectedRows: [],
  independencePairs: [],
  verdictResult: null,
  faultResults: [],
  misconceptions: [],
}
```

---

## 5. Test Stratejisi

**Korunanlar (32 test):**
`caseLoader`, `coverage`, `faults`, `misconceptions`, `verdict`, `gameStore` test dosyaları — dokunulmaz.

**Güncellenenler:**
`gameStore.test.ts` — `addPair` → `addMcdcPair` rename'i yansıtılır.

**Yeni testler:**

`tests/engine/mcdc-compat.test.ts`:
- `TRUTH_TABLE` 8 satır içerir
- Her satırda `id`, `A`, `B`, `C`, `D` alanları var
- `isValidIndependencePair`: geçerli A pair (satır 4, 5) → true
- `isValidIndependencePair`: iki koşul değişen pair → false
- `isValidIndependencePair`: decision değişmeyen pair → false
- `validateMcdcCoverage` (B signature): tam coverage → `coverageAchieved: true`
- `simulateFaults` (B signature): doğru pair → `detected: true`
- `detectMisconceptions` (B signature): isolation pattern → ID listesinde

`tests/stores/mcdc-store.test.ts`:
- `toggleRow` seçer ve ikinci çağrıda kaldırır
- `addPair` + `clearPairs` çalışır
- `setVerdict` `mcdc.verdictResult`'u yazar

---

## 6. Başarı Kriterleri

- [ ] `pnpm test -- --run` → tüm testler geçer (32 eski + yeni)
- [ ] `pnpm build` → 0 TypeScript hatası
- [ ] `pnpm lint` → 0 problem
- [ ] B'nin 3 ekranı (`Investigation`, `Evidence`, `Trial`) compile eder
- [ ] MCDC case yüklenip end-to-end oynanabilir
