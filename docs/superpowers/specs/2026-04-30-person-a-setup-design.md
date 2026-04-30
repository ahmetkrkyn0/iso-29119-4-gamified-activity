# Person A — Setup & Altyapı Tasarım Dokümanı

**Tarih:** 2026-04-30  
**Kapsam:** Week 2 — Person A görevleri  
**Proje:** Test Courthouse (`/app/` dizini)

---

## 1. Genel Bakış

Bu doküman Test Courthouse oyununun `app/` dizininin Week 2 altyapı kurulumunu tanımlar. Hedef: Vercel'de yayında bir hello-world, çalışan Vitest suite'i, ve Week 3 engine implementasyonu için hazır iskelet.

Kapsam dışı: UI component'ları, Person B'nin design-system sayfası, herhangi bir gerçek game logic.

---

## 2. Dizin Yapısı

```
iso-29119-4-gamified-activity/
└── app/
    ├── src/
    │   ├── app/                          # route'lar, layout'lar, provider'lar
    │   ├── features/                     # Week 3'te dolacak, şimdi boş
    │   ├── engine/
    │   │   ├── coverage/
    │   │   │   └── mcdc.ts              # stub — imza var, implementasyon yok
    │   │   ├── faults/
    │   │   │   └── simulator.ts         # stub
    │   │   ├── misconceptions/
    │   │   │   └── detector.ts          # stub
    │   │   └── caseLoader.ts            # Zod şeması + parse fonksiyonu
    │   ├── content/
    │   │   └── cases/
    │   │       └── mcdc-altitude-disengage-01.json
    │   ├── stores/                       # Zustand store'ları (stub)
    │   ├── ui/                           # paylaşılan component'lar (stub)
    │   └── lib/                          # yardımcı fonksiyonlar
    ├── tests/
    │   └── caseLoader.test.ts            # 3 Vitest testi
    ├── .eslintrc.cjs
    ├── .prettierrc
    ├── vite.config.ts
    ├── tsconfig.json
    └── package.json
```

---

## 3. Bağımlılıklar

### Production
| Paket | Sürüm | Neden |
|-------|-------|-------|
| `react` | ^18 | UI framework |
| `react-dom` | ^18 | DOM renderer |
| `zustand` | ^4 | Game state yönetimi |
| `zod` | ^3 | Case file runtime validasyonu |

### Development
| Paket | Neden |
|-------|-------|
| `vite` | Build tool, sub-saniye HMR |
| `@vitejs/plugin-react` | React + Vite entegrasyonu |
| `typescript` | Strict type checking |
| `tailwindcss` | Utility-first CSS |
| `autoprefixer` | Tailwind için gerekli |
| `postcss` | Tailwind için gerekli |
| `vitest` | Test runner |
| `@testing-library/react` | React component testleri |
| `eslint` | Statik analiz |
| `typescript-eslint` | TS-aware ESLint kuralları |
| `eslint-plugin-react-hooks` | Hook kuralları |
| `prettier` | Kod formatlama |

**Paket yöneticisi:** pnpm

---

## 4. TypeScript Konfigürasyonu

`tsconfig.json` — strict mode tam açık:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "skipLibCheck": true
  },
  "include": ["src", "tests"]
}
```

`noUncheckedIndexedAccess`: JSON case dosyalarından array okurken compile-time güvencesi.  
`exactOptionalPropertyTypes`: Zod ile birlikte schema drift'i önler.

---

## 5. ESLint + Prettier

**`.eslintrc.cjs`:**
- `typescript-eslint/recommended`
- `eslint-plugin-react-hooks/recommended`
- Stilistik kural yok — Prettier halleder

**`.prettierrc`:**
```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "all"
}
```

**`package.json` scripts:**
```json
{
  "dev":    "vite",
  "build":  "tsc && vite build",
  "test":   "vitest",
  "lint":   "eslint src",
  "format": "prettier --write src"
}
```

---

## 6. Zod Case-File Şeması

`src/engine/caseLoader.ts` — tek export: `loadCase(json: unknown): CaseFile`

```typescript
// Alt şemalar
ConditionSchema      // { id, label }
SeededFaultSchema    // { id, description }
MisconceptionSchema  // { id, explanation_md }

// Üst seviye
CaseFileSchema = z.object({
  id:               z.string(),
  act:              z.enum(["MCDC", "BCC", "Combinatorial", "DataFlow"]),
  difficulty:       z.number().int().min(1).max(3),
  iso_clauses:      z.array(z.string()),
  scenario: z.object({
    title:                z.string(),
    narrative:            z.string(),
    code:                 z.string(),
    conditions:           z.array(ConditionSchema),
    decision_expression:  z.string(),
  }),
  seeded_faults:    z.array(SeededFaultSchema),
  misconceptions:   z.array(MisconceptionSchema),
})

export type CaseFile = z.infer<typeof CaseFileSchema>
```

`loadCase` — parse eder, hata varsa `ZodError` fırlatır (runtime crash yerine anlamlı mesaj).

---

## 7. Engine Stub'ları

Her stub aynı yapıyı izler — imzayı export eder, implementasyon yok:

```typescript
// engine/coverage/mcdc.ts
export function validateMcdcCoverage(_submission: unknown): boolean {
  throw new Error("Not implemented — Week 3")
}

// engine/faults/simulator.ts
export function simulateFaults(_caseFile: CaseFile, _testSuite: unknown): string[] {
  throw new Error("Not implemented — Week 3")
}

// engine/misconceptions/detector.ts
export function detectMisconceptions(_submission: unknown): string[] {
  throw new Error("Not implemented — Week 3")
}
```

Engine dizini framework-free TypeScript — React import yasak. Bu Week 5 dokümantasyonu için kritik.

---

## 8. Örnek MCDC Case Dosyası

`src/content/cases/mcdc-altitude-disengage-01.json`  
Kaynak: PROJECT_PLAN.md §6 — Altitude Hold Disengage senaryosu.

```json
{
  "id": "mcdc-altitude-disengage-01",
  "act": "MCDC",
  "difficulty": 1,
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
      "description": "Short-circuit evaluation skips C when B is true"
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

---

## 9. Vitest Testleri

`tests/caseLoader.test.ts` — 3 test, yalnızca şema doğrulaması:

1. **Geçerli MCDC case parse edilir** — `mcdc-altitude-disengage-01.json` yüklenir, hata fırlatmaz.
2. **Eksik zorunlu alan reddedilir** — `act` alanı çıkarılır, `safeParse` → `success: false`.
3. **Geçersiz enum değeri reddedilir** — `act: "Unknown"`, `safeParse` → `success: false`, hata `act` path'inde.

---

## 10. Vercel Deploy

- `app/` dizini Vercel'e bağlanır (ayrı proje olarak)
- Build command: `pnpm build`
- Output directory: `dist`
- `vercel.json` gerekmez — Vite static build otomatik tanınır
- Hello-world hedef: `src/app/` altında tek bir `App.tsx`, "Test Courthouse — coming soon" metni

---

## 11. Başarı Kriterleri (Week 2 sonu)

- [ ] `pnpm test` — 3 test geçer
- [ ] `pnpm build` — TypeScript hatasız build alır
- [ ] `pnpm lint` — ESLint uyarısız geçer
- [ ] Vercel'de hello-world canlı
- [ ] `src/engine/` dizini React import içermiyor
- [ ] `mcdc-altitude-disengage-01.json` şema validasyonundan geçiyor
