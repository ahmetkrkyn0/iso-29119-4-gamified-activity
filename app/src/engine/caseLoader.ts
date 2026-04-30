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
