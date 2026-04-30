import { TC, PIXEL_FONT } from './tokens'

interface Props {
  name: string
  icon: string
  unlocked: boolean
  color?: string
}

export default function Badge({ name, icon, unlocked, color = TC.green }: Props) {
  return (
    <div
      style={{
        width: 90,
        textAlign: 'center',
        opacity: unlocked ? 1 : 0.35,
        filter: unlocked ? 'none' : 'grayscale(1)',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          margin: '0 auto',
          border: `3px solid ${unlocked ? color : TC.grey}`,
          background: unlocked ? `${color}22` : TC.grid,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          boxShadow: unlocked ? `3px 3px 0 ${TC.ink}` : 'none',
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontFamily: PIXEL_FONT,
          fontSize: 6,
          color: unlocked ? TC.ink : TC.grey,
          display: 'block',
          marginTop: 6,
          lineHeight: 1.4,
          whiteSpace: 'pre-line',
        }}
      >
        {name}
      </span>
    </div>
  )
}
