import { useState, type CSSProperties, type ReactNode } from 'react'
import { TC, PIXEL_FONT } from './tokens'

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning'

const variants: Record<Variant | 'disabled', CSSProperties> = {
  primary:   { background: TC.blue,      color: '#fff',   boxShadow: `4px 4px 0 ${TC.ink}` },
  secondary: { background: TC.cream,     color: TC.ink,   boxShadow: `4px 4px 0 ${TC.ink}` },
  danger:    { background: TC.magenta,   color: '#fff',   boxShadow: `4px 4px 0 ${TC.ink}` },
  success:   { background: TC.green,     color: '#fff',   boxShadow: `4px 4px 0 ${TC.ink}` },
  warning:   { background: TC.orange,    color: '#fff',   boxShadow: `4px 4px 0 ${TC.ink}` },
  disabled:  { background: TC.greyLight, color: TC.grey,  boxShadow: `4px 4px 0 ${TC.grey}`, cursor: 'not-allowed' },
}

interface Props {
  children: ReactNode
  variant?: Variant
  onClick?: () => void
  disabled?: boolean
  small?: boolean
  style?: CSSProperties
}

export default function PixelButton({ children, variant = 'primary', onClick, disabled, small, style }: Props) {
  const [pressed, setPressed] = useState(false)
  const v = disabled ? 'disabled' : variant

  const base: CSSProperties = {
    fontFamily: PIXEL_FONT,
    fontSize: small ? 8 : 10,
    border: `3px solid ${TC.ink}`,
    padding: small ? '6px 12px' : '10px 18px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    textTransform: 'uppercase',
    letterSpacing: 1,
    position: 'relative',
    lineHeight: 1.4,
    transition: 'transform 0.06s steps(2), box-shadow 0.06s steps(2)',
    imageRendering: 'pixelated',
    ...variants[v],
    ...(pressed && !disabled ? { transform: 'translate(2px,2px)', boxShadow: `2px 2px 0 ${TC.ink}` } : {}),
    ...style,
  }

  return (
    <button
      style={base}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </button>
  )
}
