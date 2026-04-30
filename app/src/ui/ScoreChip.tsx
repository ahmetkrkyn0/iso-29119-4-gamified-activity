import { TC, PIXEL_FONT } from './tokens'

interface Props {
  label: string
  value: string | number
  color?: string
}

export default function ScoreChip({ label, value, color = TC.orange }: Props) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: PIXEL_FONT,
        fontSize: 9,
        background: color,
        color: '#fff',
        padding: '5px 10px',
        border: `2px solid ${TC.ink}`,
        boxShadow: `3px 3px 0 ${TC.ink}`,
      }}
    >
      <span style={{ opacity: 0.8 }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}
