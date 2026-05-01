import { TC } from './tokens'

interface SpriteProps {
  size?: number
  pose?: string
}

export function JudgeSprite({ size = 120, pose = 'idle' }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="75" width="90" height="35" rx="2" fill={TC.cream} stroke={TC.ink} strokeWidth="2" />
      <line x1="20" y1="85" x2="100" y2="85" stroke={TC.ink} strokeWidth="1.5" />
      <path d="M45 75 Q47 55 60 50 Q73 55 75 75" fill={TC.ink} stroke={TC.ink} strokeWidth="1.5" />
      <circle cx="60" cy="38" r="14" fill={TC.cream} stroke={TC.ink} strokeWidth="2" />
      <path d="M44 35 Q44 20 60 18 Q76 20 76 35" fill="none" stroke={TC.ink} strokeWidth="2" />
      <path d="M44 35 Q42 40 40 42" stroke={TC.ink} strokeWidth="1.5" fill="none" />
      <path d="M76 35 Q78 40 80 42" stroke={TC.ink} strokeWidth="1.5" fill="none" />
      <circle cx="41" cy="43" r="3" fill="none" stroke={TC.ink} strokeWidth="1.2" />
      <circle cx="79" cy="43" r="3" fill="none" stroke={TC.ink} strokeWidth="1.2" />
      <circle cx="41" cy="49" r="2.5" fill="none" stroke={TC.ink} strokeWidth="1.2" />
      <circle cx="79" cy="49" r="2.5" fill="none" stroke={TC.ink} strokeWidth="1.2" />
      <circle cx="54" cy="36" r="2" fill={TC.ink} />
      <circle cx="66" cy="36" r="2" fill={TC.ink} />
      <line x1="55" y1="44" x2="65" y2="44" stroke={TC.ink} strokeWidth="1.5" />
      {pose === 'verdict' ? (
        <>
          <rect x="82" y="60" width="20" height="10" rx="2" fill={TC.orange} stroke={TC.ink} strokeWidth="1.5" transform="rotate(-25 92 65)" />
          <line x1="92" y1="65" x2="85" y2="80" stroke={TC.ink} strokeWidth="2" />
        </>
      ) : (
        <>
          <rect x="85" y="68" width="16" height="8" rx="2" fill={TC.orange} stroke={TC.ink} strokeWidth="1.5" />
          <line x1="93" y1="72" x2="93" y2="82" stroke={TC.ink} strokeWidth="2" />
        </>
      )}
      <rect x="35" y="90" width="50" height="12" fill={TC.cream} stroke={TC.ink} strokeWidth="1" />
      <text x="60" y="99" textAnchor="middle" fontFamily="'Press Start 2P'" fontSize="5" fill={TC.ink}>JUDGE</text>
    </svg>
  )
}

export function ProsecutorSprite({ size = 120, pose = 'idle' }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 110 Q42 80 55 68 Q60 65 65 68 Q78 80 80 110" fill={TC.ink} stroke={TC.ink} strokeWidth="1.5" />
      <path d="M58 68 L60 82 L62 68" fill={TC.blue} stroke={TC.ink} strokeWidth="1" />
      <circle cx="60" cy="50" r="15" fill={TC.cream} stroke={TC.ink} strokeWidth="2" />
      <path d="M45 45 Q45 32 60 30 Q75 32 75 45" fill={TC.ink} stroke={TC.ink} strokeWidth="1" />
      <rect x="52" y="47" width="5" height="3" rx="1" fill={TC.ink} />
      <rect x="63" y="47" width="5" height="3" rx="1" fill={TC.ink} />
      <line x1="51" y1="44" x2="58" y2="43" stroke={TC.ink} strokeWidth="1.5" />
      <line x1="62" y1="43" x2="69" y2="44" stroke={TC.ink} strokeWidth="1.5" />
      <path d="M55 56 Q60 59 65 56" fill="none" stroke={TC.ink} strokeWidth="1.5" />
      {pose === 'pointing' ? (
        <>
          <line x1="80" y1="78" x2="100" y2="60" stroke={TC.ink} strokeWidth="2" />
          <circle cx="101" cy="59" r="2" fill={TC.ink} />
        </>
      ) : (
        <>
          <line x1="80" y1="80" x2="90" y2="90" stroke={TC.ink} strokeWidth="2" />
          <rect x="86" y="88" width="10" height="14" rx="1" fill={TC.cream} stroke={TC.ink} strokeWidth="1.5" />
        </>
      )}
      <text x="60" y="118" textAnchor="middle" fontFamily="'Press Start 2P'" fontSize="5" fill={TC.ink}>PROSECUTOR</text>
    </svg>
  )
}

export function DefenseSprite({ size = 120, pose = 'idle' }: SpriteProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 110 Q42 80 55 68 Q60 65 65 68 Q78 80 80 110" fill="#4A4540" stroke={TC.ink} strokeWidth="1.5" />
      <circle cx="60" cy="50" r="15" fill={TC.cream} stroke={TC.ink} strokeWidth="2" />
      <path d="M45 48 Q47 30 60 28 Q73 30 75 48" fill={TC.ink} stroke={TC.ink} strokeWidth="1" />
      <circle cx="53" cy="48" r="6" fill="none" stroke={TC.ink} strokeWidth="1.5" />
      <circle cx="67" cy="48" r="6" fill="none" stroke={TC.ink} strokeWidth="1.5" />
      <line x1="59" y1="48" x2="61" y2="48" stroke={TC.ink} strokeWidth="1.5" />
      <circle cx="53" cy="49" r="1.5" fill={TC.ink} />
      <circle cx="67" cy="49" r="1.5" fill={TC.ink} />
      <path d="M56 57 Q60 55 65 57" fill="none" stroke={TC.ink} strokeWidth="1.5" />
      {pose === 'objecting' ? (
        <>
          <line x1="38" y1="85" x2="25" y2="70" stroke={TC.ink} strokeWidth="2" />
          <text x="10" y="67" fontFamily="'Press Start 2P'" fontSize="4" fill={TC.magenta}>OBJECTION!</text>
        </>
      ) : (
        <>
          <path d="M38 85 Q35 90 40 95" stroke={TC.ink} strokeWidth="2" fill="none" />
          <path d="M82 85 Q85 90 80 95" stroke={TC.ink} strokeWidth="2" fill="none" />
        </>
      )}
      <text x="60" y="118" textAnchor="middle" fontFamily="'Press Start 2P'" fontSize="5" fill={TC.ink}>DEFENSE</text>
    </svg>
  )
}

interface BugProps {
  size?: number
  type?: 'mcdc' | 'combinatorial' | 'dataflow' | 'bcc'
  mood?: 'nervous' | 'caught'
}

export function BugSprite({ size = 80, type = 'mcdc', mood = 'nervous' }: BugProps) {
  const bugColors = { mcdc: TC.magenta, combinatorial: TC.orange, dataflow: TC.blue, bcc: TC.green }
  const c = bugColors[type]
  const labels = { mcdc: 'MCDC', combinatorial: 'COMBO', dataflow: 'D-FLOW', bcc: 'BCC' }

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="48" rx="18" ry="22" fill={c} stroke={TC.ink} strokeWidth="2" opacity="0.3" />
      <ellipse cx="40" cy="48" rx="18" ry="22" fill="none" stroke={TC.ink} strokeWidth="2" />
      <line x1="25" y1="42" x2="55" y2="42" stroke={TC.ink} strokeWidth="1" />
      <line x1="24" y1="50" x2="56" y2="50" stroke={TC.ink} strokeWidth="1" />
      <line x1="25" y1="58" x2="55" y2="58" stroke={TC.ink} strokeWidth="1" />
      <circle cx="40" cy="24" r="10" fill={TC.cream} stroke={TC.ink} strokeWidth="2" />
      <circle cx="34" cy="22" r="2.5" fill="#fff" stroke={TC.ink} strokeWidth="1" />
      <circle cx="34" cy="22" r="1" fill={TC.ink} />
      <circle cx="40" cy="20" r="2.5" fill="#fff" stroke={TC.ink} strokeWidth="1" />
      <circle cx="40" cy="20" r="1" fill={TC.ink} />
      <circle cx="46" cy="22" r="2.5" fill="#fff" stroke={TC.ink} strokeWidth="1" />
      <circle cx="46" cy="22" r="1" fill={TC.ink} />
      {mood === 'nervous' ? (
        <path d="M35 29 Q37 31 39 29 Q41 31 43 29 Q45 31 47 29" fill="none" stroke={TC.ink} strokeWidth="1.2" />
      ) : (
        <circle cx="40" cy="30" r="2" fill={TC.ink} />
      )}
      <path d="M36 15 Q30 5 25 3" stroke={TC.ink} strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="2" r="2" fill={TC.ink} />
      <path d="M44 15 Q50 5 55 3" stroke={TC.ink} strokeWidth="1.5" fill="none" />
      <circle cx="56" cy="2" r="2" fill={TC.ink} />
      <path d="M22 40 Q15 38 10 42" stroke={TC.ink} strokeWidth="1.5" fill="none" />
      <path d="M22 50 Q12 50 8 55" stroke={TC.ink} strokeWidth="1.5" fill="none" />
      <path d="M23 60 Q15 63 12 68" stroke={TC.ink} strokeWidth="1.5" fill="none" />
      <path d="M58 40 Q65 38 70 42" stroke={TC.ink} strokeWidth="1.5" fill="none" />
      <path d="M58 50 Q68 50 72 55" stroke={TC.ink} strokeWidth="1.5" fill="none" />
      <path d="M57 60 Q65 63 68 68" stroke={TC.ink} strokeWidth="1.5" fill="none" />
      <text x="40" y="65" textAnchor="middle" fontFamily="'Press Start 2P'" fontSize="4" fill={TC.ink}>
        {labels[type]}
      </text>
    </svg>
  )
}
