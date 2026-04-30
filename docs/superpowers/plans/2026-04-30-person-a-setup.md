# Person A — Setup & Altyapı Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `app/` dizinini Vite + React + TypeScript + Tailwind + Zustand + Zod ile kurmak; 3 geçen Vitest testi ve Vercel'de canlı hello-world ile Week 2'yi tamamlamak.

**Architecture:** `pnpm create vite` ile scaffolding, ardından TypeScript strict mode / ESLint / Prettier / Tailwind konfigürasyonları eklenir. Engine dizini React-free saf TypeScript olarak tutulur. TDD sırası: önce testleri yaz (kırmızı), sonra Zod şemasını implement et (yeşil).

**Tech Stack:** React 18, TypeScript (strict), Vite, pnpm, Zustand, Zod, Tailwind CSS v3, Vitest, ESLint, Prettier

---

### Task 1: Projeyi scaffold et ve bağımlılıkları yükle

**Files:**
- Create: `app/` (Vite scaffold — tüm dizin)
- Modify: `app/package.json`

- [ ] **Step 1: Repo kök dizininde Vite projesi oluştur**

```bash
cd /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity
pnpm create vite app --template react-ts
```

Beklenen çıktı: `✔ Done. Now run: cd app && pnpm install`

- [ ] **Step 2: `app/` içine geç ve temel bağımlılıkları yükle**

```bash
cd app
pnpm install
```

- [ ] **Step 3: Production bağımlılıklarını ekle**

```bash
pnpm add zustand zod
```

Beklenen: `zustand` ve `zod` `dependencies`'e eklendi.

- [ ] **Step 4: Dev bağımlılıklarını ekle**

```bash
pnpm add -D tailwindcss@3 autoprefixer postcss vitest jsdom @vitest/coverage-v8 prettier eslint-plugin-react-hooks
```

- [ ] **Step 5: `package.json` scripts'e `test` ve `format` ekle**

`app/package.json` içindeki `"scripts"` bloğunu şununla değiştir:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint src",
    "test": "vitest",
    "format": "prettier --write src"
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add app/
git commit -m "feat: scaffold Vite + React + TS project in app/"
```

---

### Task 2: TypeScript strict mode

**Files:**
- Modify: `app/tsconfig.json` (Vite 4) **veya** `app/tsconfig.app.json` (Vite 5+)

> Not: `ls app | grep tsconfig` çalıştır — `tsconfig.app.json` varsa onu düzenle, yoksa `tsconfig.json`'ı.

- [ ] **Step 1: Hangi dosyanın `src/` kapsamını tanımladığını bul**

```bash
ls /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app | grep tsconfig
```

- [ ] **Step 2: `src/` kapsayan tsconfig'in `compilerOptions`'ını şunla değiştir**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true
  },
  "include": ["src", "tests"]
}
```

`resolveJsonModule: true` — JSON case dosyalarını `import` ile yüklemek için şart.  
`"include": ["src", "tests"]` — `tests/` dizini de type-check kapsamına girer.

- [ ] **Step 3: TypeScript'in temiz geçtiğini doğrula**

```bash
pnpm exec tsc --noEmit
```

Beklenen: 0 hata. (Vite template'i `App.tsx`'te bazı strict uyarıları verebilir — Task 6'da düzeltilecek.)

- [ ] **Step 4: Commit**

```bash
git add app/tsconfig.json app/tsconfig.app.json
git commit -m "feat: enable TypeScript strict mode with noUncheckedIndexedAccess"
```

---

### Task 3: ESLint + Prettier konfigürasyonu

**Files:**
- Create/Modify: `app/eslint.config.js` (Vite 5+) **veya** `app/.eslintrc.cjs` (Vite 4)
- Create: `app/.prettierrc`

- [ ] **Step 1: Vite'ın ürettiği ESLint config dosyasını bul**

```bash
ls /Users/ahmetkarakoyun/Desktop/iso-29119-4-gamified-activity/app | grep eslint
```

- [ ] **Step 2a: `eslint.config.js` varsa (Vite 5+ flat config) şu içerikle güncelle**

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: { 'react-hooks': reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },
)
```

- [ ] **Step 2b: `.eslintrc.cjs` varsa (Vite 4 legacy config) şu içerikle güncelle**

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist'],
  parser: '@typescript-eslint/parser',
  rules: {},
}
```

- [ ] **Step 3: `.prettierrc` oluştur**

`app/.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "all"
}
```

- [ ] **Step 4: Lint geçtiğini doğrula**

```bash
pnpm lint
```

Beklenen: 0 uyarı, 0 hata.

- [ ] **Step 5: Commit**

```bash
git add app/.eslintrc.cjs app/eslint.config.js app/.prettierrc
git commit -m "feat: add ESLint and Prettier config"
```

---

### Task 4: Tailwind CSS kurulumu

**Files:**
- Create: `app/tailwind.config.ts`
- Create: `app/postcss.config.cjs`
- Modify: `app/src/index.css`

- [ ] **Step 1: Tailwind config dosyasını oluştur**

`app/tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config
```

- [ ] **Step 2: PostCSS config dosyasını oluştur**

`app/postcss.config.cjs`:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 3: `src/index.css` içeriğini Tailwind direktifleriyle değiştir**

Mevcut tüm içeriği sil ve şunu yaz:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: Dev server'ı başlat ve Tailwind'in yüklendiğini doğrula**

```bash
pnpm dev
```

`http://localhost:5173` açıldığında sayfa görünür olmalı. Ctrl+C ile durdur.

- [ ] **Step 5: Commit**

```bash
git add app/tailwind.config.ts app/postcss.config.cjs app/src/index.css
git commit -m "feat: add Tailwind CSS v3"
```

---

### Task 5: Vitest konfigürasyonu

**Files:**
- Modify: `app/vite.config.ts`
- Create: `app/tests/.gitkeep`

- [ ] **Step 1: `vite.config.ts` dosyasını güncelle**

`app/vite.config.ts`:

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
})
```

`/// <reference types="vitest" />` — `test` bloğunu TypeScript'e tanıtır.  
`globals: true` — `describe`, `test`, `expect` import etmeden kullanılabilir.

- [ ] **Step 2: `tests/` dizinini oluştur ve Git'e ekle**

```bash
mkdir -p app/tests && touch app/tests/.gitkeep
```

- [ ] **Step 3: Test runner'ın çalıştığını doğrula**

```bash
cd app && pnpm test -- --run
```

Beklenen çıktı: `No test files found, exiting with code 0`

- [ ] **Step 4: Commit**

```bash
git add app/vite.config.ts app/tests/.gitkeep
git commit -m "feat: configure Vitest with jsdom environment"
```

---

### Task 6: Hello-world App.tsx

**Files:**
- Modify: `app/src/App.tsx`

- [ ] **Step 1: `App.tsx` içeriğini tamamen değiştir**

`app/src/App.tsx`:

```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <h1 className="text-3xl font-bold text-gray-800">
        Test Courthouse — coming soon
      </h1>
    </div>
  )
}
```

- [ ] **Step 2: Build'in temiz geçtiğini doğrula**

```bash
cd app && pnpm build
```

Beklenen: `dist/` dizini oluştu, TypeScript hatası yok.

- [ ] **Step 3: Commit**

```bash
git add app/src/App.tsx
git commit -m "feat: hello-world App with Tailwind layout"
```

---

### Task 7: 3 Zod testi yaz — TDD kırmızı aşama

**Files:**
- Create: `app/tests/caseLoader.test.ts`

- [ ] **Step 1: Test dosyasını oluştur**

`app/tests/caseLoader.test.ts`:

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
})
```

- [ ] **Step 2: Testlerin kırmızı olduğunu doğrula**

```bash
cd app && pnpm test -- --run
```

Beklenen: 3 test FAIL — `Cannot find module '../src/engine/caseLoader'`

- [ ] **Step 3: Commit (kırmızı testler intentional)**

```bash
git add app/tests/caseLoader.test.ts
git commit -m "test: add failing Zod schema tests (TDD red)"
```

---

### Task 8: MCDC case JSON dosyasını oluştur

**Files:**
- Create: `app/src/content/cases/mcdc-altitude-disengage-01.json`

- [ ] **Step 1: Dizini oluştur**

```bash
mkdir -p app/src/content/cases
```

- [ ] **Step 2: JSON dosyasını oluştur**

`app/src/content/cases/mcdc-altitude-disengage-01.json`:

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

- [ ] **Step 3: Commit**

```bash
git add app/src/content/
git commit -m "feat: add MCDC altitude disengage case file"
```

---

### Task 9: Zod şemasını implement et — TDD yeşil aşama

**Files:**
- Create: `app/src/engine/caseLoader.ts`

- [ ] **Step 1: Engine dizinini oluştur**

```bash
mkdir -p app/src/engine
```

- [ ] **Step 2: `caseLoader.ts` dosyasını oluştur**

`app/src/engine/caseLoader.ts`:

```typescript
import { z } from 'zod'

const ConditionSchema = z.object({
  id: z.string(),
  label: z.string(),
})

const SeededFaultSchema = z.object({
  id: z.string(),
  description: z.string(),
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

- [ ] **Step 3: Testlerin yeşil olduğunu doğrula**

```bash
cd app && pnpm test -- --run
```

Beklenen çıktı:

```
✓ tests/caseLoader.test.ts (3)
  ✓ CaseFile schema > geçerli MCDC case dosyasını parse eder
  ✓ CaseFile schema > eksik zorunlu alan reddedilir
  ✓ CaseFile schema > geçersiz act enum değeri reddedilir

Test Files  1 passed (1)
Tests       3 passed (3)
```

- [ ] **Step 4: TypeScript temiz geçiyor mu kontrol et**

```bash
pnpm exec tsc --noEmit
```

Beklenen: 0 hata.

- [ ] **Step 5: Commit**

```bash
git add app/src/engine/caseLoader.ts
git commit -m "feat: implement Zod case-file schema (TDD green)"
```

---

### Task 10: Engine stub'larını oluştur

**Files:**
- Create: `app/src/engine/coverage/mcdc.ts`
- Create: `app/src/engine/faults/simulator.ts`
- Create: `app/src/engine/misconceptions/detector.ts`

- [ ] **Step 1: Alt dizinleri oluştur**

```bash
mkdir -p app/src/engine/coverage app/src/engine/faults app/src/engine/misconceptions
```

- [ ] **Step 2: Coverage stub**

`app/src/engine/coverage/mcdc.ts`:

```typescript
export function validateMcdcCoverage(_submission: unknown): boolean {
  throw new Error('Not implemented — Week 3')
}
```

- [ ] **Step 3: Fault simulator stub**

`app/src/engine/faults/simulator.ts`:

```typescript
import type { CaseFile } from '../caseLoader'

export function simulateFaults(_caseFile: CaseFile, _testSuite: unknown): string[] {
  throw new Error('Not implemented — Week 3')
}
```

- [ ] **Step 4: Misconception detector stub**

`app/src/engine/misconceptions/detector.ts`:

```typescript
export function detectMisconceptions(_submission: unknown): string[] {
  throw new Error('Not implemented — Week 3')
}
```

- [ ] **Step 5: Engine dizininde React import olmadığını doğrula**

```bash
grep -r "from 'react'" app/src/engine/ && echo "HATA: React import var" || echo "OK: React import yok"
```

Beklenen: `OK: React import yok`

- [ ] **Step 6: TypeScript temiz geçiyor mu kontrol et**

```bash
cd app && pnpm exec tsc --noEmit
```

Beklenen: 0 hata.

- [ ] **Step 7: Commit**

```bash
git add app/src/engine/coverage/ app/src/engine/faults/ app/src/engine/misconceptions/
git commit -m "feat: add engine stubs (coverage, faults, misconceptions)"
```

---

### Task 11: Final doğrulama + Vercel deploy

**Files:**
- (Opsiyonel) Create: `app/.vercelignore`

- [ ] **Step 1: Tüm başarı kriterlerini çalıştır**

```bash
cd app
pnpm test -- --run
pnpm build
pnpm lint
```

Beklenen:
```
Tests:  3 passed (3)
Build:  dist/ oluştu, 0 hata
Lint:   0 problem
```

- [ ] **Step 2: Engine'de React import olmadığını son kez doğrula**

```bash
grep -r "from 'react'" app/src/engine/ && echo "FAIL" || echo "PASS"
```

Beklenen: `PASS`

- [ ] **Step 3: Vercel deploy**

Vercel Dashboard'da (`vercel.com/new`):
1. "Import Git Repository" → bu repo'yu seç
2. Root Directory: `app`
3. Build Command: `pnpm build`
4. Output Directory: `dist`
5. Install Command: `pnpm install`
6. "Deploy" butonuna bas

Canlı URL açıldığında "Test Courthouse — coming soon" yazısı görünmeli.

- [ ] **Step 4: Final commit**

```bash
git add app/
git commit -m "feat: Week 2 Person A setup complete — all checks pass"
```

---

## Başarı Kriterleri Özeti

| Kriter | Komut | Beklenen |
|--------|-------|----------|
| 3 Vitest testi geçer | `pnpm test -- --run` | 3 passed |
| TypeScript hatasız build | `pnpm build` | dist/ oluşur, 0 hata |
| ESLint temiz | `pnpm lint` | 0 uyarı/hata |
| Engine React-free | `grep -r "from 'react'" src/engine/` | Çıktı yok |
| Vercel hello-world | Vercel URL | Sayfa açılır |
