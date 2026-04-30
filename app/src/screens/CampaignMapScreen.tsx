import { useState } from 'react'
import { TC, PIXEL_FONT, HAND_FONT, MONO_FONT } from '../ui/tokens'
import PixelButton from '../ui/PixelButton'
import ScoreChip from '../ui/ScoreChip'
import { BugSprite } from '../ui/CharacterSprites'
import type { Screen } from '../stores/gameStore'

interface Props {
  onNavigate: (screen: Screen) => void
  onBack: () => void
  completedCases: string[]
}

const acts = [
  {
    id: 'combinatorial',
    name: 'ACT I',
    title: 'Combinatorial',
    subtitle: 'Forensic Combinatorics',
    color: TC.orange,
    bugType: 'combinatorial' as const,
    clauses: '§5.2.5',
    cases: [
      { id: 'combo-01', name: 'The Parameter Matrix',   difficulty: 1, status: 'complete'   },
      { id: 'combo-02', name: 'Pair-wise Pursuit',      difficulty: 2, status: 'available'  },
      { id: 'combo-03', name: 'Base Choice Betrayal',   difficulty: 3, status: 'locked'     },
    ],
  },
  {
    id: 'bcc',
    name: 'ACT II',
    title: 'BCC',
    subtitle: 'Compound Testimony',
    color: TC.green,
    bugType: 'bcc' as const,
    clauses: '§5.3.5',
    cases: [
      { id: 'bcc-01', name: 'The Boolean Witness',  difficulty: 1, status: 'locked' },
      { id: 'bcc-02', name: 'Condition Cascade',    difficulty: 2, status: 'locked' },
      { id: 'bcc-03', name: 'Exhaustive Evidence',  difficulty: 3, status: 'locked' },
    ],
  },
  {
    id: 'mcdc',
    name: 'ACT III',
    title: 'MC/DC',
    subtitle: 'Cross-Examination',
    color: TC.magenta,
    bugType: 'mcdc' as const,
    clauses: '§5.3.6',
    cases: [
      { id: 'mcdc-altitude-disengage-01', name: 'Altitude Hold Disengage', difficulty: 1, status: 'available' },
      { id: 'mcdc-02',                   name: 'Independence Inquisition', difficulty: 2, status: 'locked'    },
      { id: 'mcdc-03',                   name: 'The Paired Verdict',       difficulty: 3, status: 'locked'    },
    ],
  },
  {
    id: 'dataflow',
    name: 'ACT IV',
    title: 'Data Flow',
    subtitle: 'Chain of Custody',
    color: TC.blue,
    bugType: 'dataflow' as const,
    clauses: '§5.3.7',
    cases: [
      { id: 'df-01', name: 'Define & Use',       difficulty: 1, status: 'locked' },
      { id: 'df-02', name: 'The Path Divergence', difficulty: 2, status: 'locked' },
      { id: 'df-03', name: 'All-Uses Acquittal',  difficulty: 3, status: 'locked' },
    ],
  },
]

export default function CampaignMapScreen({ onNavigate, onBack, completedCases }: Props) {
  const [selectedAct, setSelectedAct] = useState<string | null>(null)

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1, padding: '30px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
        <PixelButton small variant="secondary" onClick={onBack}>← MENU</PixelButton>
        <h2 style={{ fontFamily: PIXEL_FONT, fontSize: 16, color: TC.ink, margin: 0 }}>CAMPAIGN</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <ScoreChip label="CASES" value={`${completedCases.length}/12`} color={TC.blue} />
          <ScoreChip label="BADGES" value="1/8" color={TC.green} />
        </div>
      </div>

      {/* Act timeline */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
        {acts.map(act => (
          <div key={act.id} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Act header card */}
            <button
              onClick={() => setSelectedAct(selectedAct === act.id ? null : act.id)}
              style={{
                background: selectedAct === act.id ? `${act.color}18` : TC.cream,
                border: `3px solid ${act.color}`,
                boxShadow: `4px 4px 0 ${TC.ink}`,
                padding: 16,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.06s steps(2)',
              }}
            >
              <div style={{ fontFamily: PIXEL_FONT, fontSize: 8, color: TC.grey }}>{act.name}</div>
              <div style={{ fontFamily: PIXEL_FONT, fontSize: 14, color: act.color, margin: '8px 0' }}>{act.title}</div>
              <div style={{ fontFamily: HAND_FONT, fontSize: 16, color: TC.ink }}>{act.subtitle}</div>
              <div style={{ margin: '10px auto 0' }}>
                <BugSprite size={50} type={act.bugType} />
              </div>
              <div style={{ fontFamily: MONO_FONT, fontSize: 8, color: TC.grey, marginTop: 6 }}>{act.clauses}</div>
            </button>

            {/* Cases list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {act.cases.map(c => {
                const isComplete = completedCases.includes(c.id) || c.status === 'complete'
                const isLocked = c.status === 'locked' && !completedCases.includes(c.id)
                return (
                  <button
                    key={c.id}
                    onClick={() => !isLocked && onNavigate('briefing')}
                    style={{
                      background: isComplete ? `${TC.green}15` : TC.cream,
                      border: `2px solid ${isLocked ? TC.greyLight : TC.ink}`,
                      boxShadow: !isLocked ? `3px 3px 0 ${TC.ink}` : 'none',
                      padding: '10px 12px',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                      opacity: isLocked ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ fontFamily: PIXEL_FONT, fontSize: 7, color: isComplete ? TC.green : TC.ink }}>
                      {isComplete ? '✓ ' : isLocked ? '🔒 ' : '▶ '}{c.name}
                    </div>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[1, 2, 3].map(d => (
                        <div
                          key={d}
                          style={{
                            width: 8,
                            height: 8,
                            background: d <= c.difficulty ? act.color : TC.grid,
                            border: `1px solid ${TC.ink}`,
                          }}
                        />
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
