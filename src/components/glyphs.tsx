import type { ReactNode } from 'react'
import type { ModuleId } from '../game/data'

/**
 * Icons in the style of the navigation bar: filled, very rounded, soft two-tone gradient with a small
 * gloss and no outlines. Thick round-cap strokes are only used where they read as a solid shape.
 * Every icon is painted three times with the same geometry: base colour, tone gradient, gloss.
 */
export type IconName =
  | 'check' | 'close' | 'play' | 'pause' | 'repeat' | 'lock' | 'eye' | 'eyeOff' | 'hand' | 'bluetooth' | 'bluetoothOff'
  | 'star' | 'pencil' | 'drop' | 'card' | 'book' | 'map' | 'user' | 'cap' | 'arrowRight' | 'arrowLeft' | 'backspace'
  | 'download' | 'turtle' | 'heart' | 'keyboard' | 'refresh' | 'sparkle' | 'flame' | 'info' | 'exit'
  | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'cloud' | 'trophy' | 'clock' | 'calendar' | 'chart' | 'growth'

const R = { strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const

/** Each icon receives the paint to use (currentColor, tone gradient or gloss gradient). */
const PATHS: Record<IconName, (f: string) => ReactNode> = {
  check: (f) => <path d="M5.4 12.9l4.5 4.5 8.7-9.8" {...R} stroke={f} strokeWidth={4.6} />,
  close: (f) => <path d="M6.6 6.6l10.8 10.8M17.4 6.6L6.6 17.4" {...R} stroke={f} strokeWidth={4.4} />,
  play: (f) => <path d="M8.2 5.6v12.8c0 .8.9 1.3 1.6.9l10-6.4c.6-.4.6-1.4 0-1.8l-10-6.4c-.7-.4-1.6.1-1.6.9z" fill={f} stroke={f} strokeWidth={1.6} strokeLinejoin="round" />,
  pause: (f) => (
    <>
      <rect x="5.6" y="4.5" width="5" height="15" rx="2.5" fill={f} />
      <rect x="13.4" y="4.5" width="5" height="15" rx="2.5" fill={f} />
    </>
  ),
  repeat: (f) => (
    <>
      <path d="M19 12a7 7 0 1 1-2.2-5.1" {...R} stroke={f} strokeWidth={3.6} />
      <path d="M21 2.8v8h-8z" fill={f} stroke={f} strokeWidth={1.4} strokeLinejoin="round" />
    </>
  ),
  lock: (f) => (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M 4 13 A 3.8 3.8 0 0 1 7.2 9.2 V 7.4 A 4.8 4.8 0 0 1 16.8 7.4 V 9.2 A 3.8 3.8 0 0 1 20 13 V 17.2 A 3.8 3.8 0 0 1 16.2 21 H 7.8 A 3.8 3.8 0 0 1 4 17.2 Z M 9.6 9.2 V 7.4 A 2.4 2.4 0 0 1 14.4 7.4 V 9.2 Z M 12 12.6 A 1.35 1.35 0 0 1 13.35 14.1 L 12.85 16.9 A 0.4 0.4 0 0 1 12.45 17.3 H 11.55 A 0.4 0.4 0 0 1 11.15 16.9 L 10.65 14.1 A 1.35 1.35 0 0 1 12 12.6 Z"
      fill={f}
    />
  ),
  eye: (f) => (
    <>
      <path d="M12 5c4.8 0 8.6 3 10.2 7-1.6 4-5.4 7-10.2 7S3.4 16 1.8 12C3.4 8 7.2 5 12 5z" fill={f} />
      <circle cx="12" cy="12" r="3.4" fill="#fff" />
    </>
  ),
  eyeOff: (f) => (
    <>
      <path d="M12 5c4.8 0 8.6 3 10.2 7-1.6 4-5.4 7-10.2 7S3.4 16 1.8 12C3.4 8 7.2 5 12 5z" fill={f} />
      <circle cx="12" cy="12" r="3.4" fill="#fff" />
      <path d="M4 20L20 4" stroke="#fff" strokeWidth={6.4} strokeLinecap="round" />
      <path d="M4 20L20 4" {...R} stroke={f} strokeWidth={3} />
    </>
  ),
  hand: (f) => (
    <>
      <rect x="16.3" y="6.6" width="3.2" height="9" rx="1.6" fill={f} />
      <rect x="13" y="3.6" width="3.4" height="11" rx="1.7" fill={f} />
      <rect x="9.6" y="2.8" width="3.4" height="12" rx="1.7" fill={f} />
      <rect x="6.3" y="4.4" width="3.4" height="11" rx="1.7" fill={f} />
      <path d="M6.3 12.4h13.2v3.2a6.4 6.4 0 0 1-6.4 6.4h-.4a6.4 6.4 0 0 1-6.4-6.4z" fill={f} />
      <rect x="2.2" y="11.2" width="3.4" height="8" rx="1.7" transform="rotate(-28 3.9 15.2)" fill={f} />
    </>
  ),
  bluetooth: (f) => <path d="M7 7.6l10 9-5 4.4V3l5 4.4-10 9" {...R} stroke={f} strokeWidth={3.2} />,
  bluetoothOff: (f) => (
    <>
      <path d="M7 7.6l10 9-5 4.4V3l5 4.4-10 9" {...R} stroke={f} strokeWidth={3.2} />
      <path d="M3.5 3.5l17 17" stroke="#fff" strokeWidth={6.4} strokeLinecap="round" />
      <path d="M3.5 3.5l17 17" {...R} stroke={f} strokeWidth={3} />
    </>
  ),
  star: (f) => <path d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.5l-5.4 3 1.1-6.1-4.5-4.2 6.1-.8z" fill={f} stroke={f} strokeWidth={2.6} strokeLinejoin="round" />,
  pencil: (f) => <path d="M3 17.4V21h3.6L17.7 9.9 14.1 6.3 3 17.4zM20.6 7a1 1 0 0 0 0-1.4l-2.2-2.2a1 1 0 0 0-1.4 0l-1.8 1.8 3.6 3.6L20.6 7z" fill={f} stroke={f} strokeWidth={1} strokeLinejoin="round" />,
  drop: (f) => <path d="M12 2.4c3.5 4.1 6.6 7 6.6 11a6.6 6.6 0 0 1-13.2 0c0-4 3.1-6.9 6.6-11z" fill={f} />,
  card: (f) => (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="4.6" fill={f} />
      <rect x="6.2" y="8.6" width="8" height="2.4" rx="1.2" fill="#fff" />
      <rect x="6.2" y="13" width="11.6" height="2.4" rx="1.2" fill="#fff" />
    </>
  ),
  book: (f) => (
    <>
      <path d="M12 6.4C9.6 4.7 6.2 4.4 2.8 5.2v13.1c3.4-.8 6.8-.5 9.2 1.3 2.4-1.8 5.8-2.1 9.2-1.3V5.2c-3.4-.8-6.8-.5-9.2 1.2z" fill={f} stroke={f} strokeWidth={1.4} strokeLinejoin="round" />
      <rect x="11.1" y="6.6" width="1.8" height="12.8" fill="#fff" />
    </>
  ),
  map: (f) => (
    <>
      <path d="M2.8 6.6l6-2.6 6.4 2.6 6-2.6v13.4l-6 2.6-6.4-2.6-6 2.6z" fill={f} stroke={f} strokeWidth={1.4} strokeLinejoin="round" />
      <path d="M8.8 4.4v13M15.2 6.8v13" stroke="#fff" strokeWidth={1.6} />
    </>
  ),
  user: (f) => (
    <>
      <circle cx="12" cy="7.8" r="4.8" fill={f} />
      <path d="M3.4 21.2c0-4.8 3.8-7.6 8.6-7.6s8.6 2.8 8.6 7.6z" fill={f} stroke={f} strokeWidth={1.2} strokeLinejoin="round" />
    </>
  ),
  cap: (f) => (
    <>
      <path d="M12 3.2L1.6 8.6 12 14l8.4-4.4v5.9h2V8.6z" fill={f} stroke={f} strokeWidth={1} strokeLinejoin="round" />
      <path d="M5.4 12.4v4.2c0 1.6 3 3.4 6.6 3.4s6.6-1.8 6.6-3.4v-4.2L12 15.8z" fill={f} />
    </>
  ),
  arrowRight: (f) => <path d="M4.6 12h13.6M12.6 5.8l6.2 6.2-6.2 6.2" {...R} stroke={f} strokeWidth={3.8} />,
  arrowLeft: (f) => <path d="M19.4 12H5.8M11.4 5.8L5.2 12l6.2 6.2" {...R} stroke={f} strokeWidth={3.8} />,
  chevronDown: (f) => <path d="M5.8 9l6.2 6.2L18.2 9" {...R} stroke={f} strokeWidth={4.2} />,
  chevronRight: (f) => <path d="M9 5.8l6.2 6.2L9 18.2" {...R} stroke={f} strokeWidth={4.2} />,
  chevronLeft: (f) => <path d="M15 5.8L8.8 12l6.2 6.2" {...R} stroke={f} strokeWidth={4.2} />,
  backspace: (f) => (
    <>
      <path d="M8.8 4.8H19a2.2 2.2 0 0 1 2.2 2.2v10a2.2 2.2 0 0 1-2.2 2.2H8.8L2.4 12z" fill={f} stroke={f} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M11.6 9.4l5 5M16.6 9.4l-5 5" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
    </>
  ),
  download: (f) => (
    <>
      <path d="M12 3.5v10M7.6 9.6l4.4 4.4 4.4-4.4" {...R} stroke={f} strokeWidth={3.6} />
      <rect x="3.5" y="16.4" width="17" height="4.6" rx="2.3" fill={f} />
    </>
  ),
  turtle: (f) => (
    <>
      <path d="M3.6 16.6a8.4 7.4 0 0 1 16.8 0z" fill={f} />
      <circle cx="21" cy="13.4" r="2.6" fill={f} />
      <rect x="5.4" y="15.4" width="3.2" height="5" rx="1.6" fill={f} />
      <rect x="14.6" y="15.4" width="3.2" height="5" rx="1.6" fill={f} />
    </>
  ),
  heart: (f) => <path d="M12 21c-.5 0-1-.2-1.4-.5C6 16.6 2.5 13.4 2.5 9.3 2.5 6.4 4.7 4.3 7.4 4.3c1.9 0 3.5 1 4.6 2.6 1.1-1.6 2.7-2.6 4.6-2.6 2.7 0 4.9 2.1 4.9 5 0 4.1-3.5 7.3-8.1 11.2-.4.3-.9.5-1.4.5z" fill={f} />,
  keyboard: (f) => (
    <>
      <rect x="2" y="5.5" width="20" height="13" rx="4" fill={f} />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14.4h10" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
    </>
  ),
  refresh: (f) => (
    <>
      <path d="M19.4 12a7.4 7.4 0 1 1-2.3-5.3" {...R} stroke={f} strokeWidth={3.6} />
      <path d="M21 2.8v8h-8z" fill={f} stroke={f} strokeWidth={1.4} strokeLinejoin="round" />
    </>
  ),
  sparkle: (f) => <path d="M12 2.2c.7 4.6 2.2 6.8 7.8 7.8-5.6 1-7.1 3.2-7.8 7.8-.7-4.6-2.2-6.8-7.8-7.8 5.6-1 7.1-3.2 7.8-7.800zM19 15.600c.3 1.9.9 2.8 3 3.2-2.1.4-2.7 1.3-3 3.2-.3-1.9-.9-2.8-3-3.2 2.1-.4 2.7-1.3 3-3.200z" fill={f} stroke={f} strokeWidth={0.8} strokeLinejoin="round" />,
  flame: (f) => <path d="M12.6 2.400c.5 3.2-1.3 4.7-2.9 6.600C8.1 10.8 6.5 12.8 6.5 15.500a5.5 5.5 0 0 0 11 0c0-2.2-1-3.8-2.1-5.1-.2 1.3-.8 2.2-1.7 2.7.6-3.8-.1-7.9-1.1-10.700z" fill={f} stroke={f} strokeWidth={1} strokeLinejoin="round" />,
  info: (f) => (
    <>
      <circle cx="12" cy="12" r="10" fill={f} />
      <rect x="10.8" y="10.6" width="2.4" height="6.4" rx="1.2" fill="#fff" />
      <circle cx="12" cy="7.6" r="1.5" fill="#fff" />
    </>
  ),
  exit: (f) => (
    <>
      <path d="M4 6.4A3.4 3.4 0 0 1 7.4 3H12v3.200H7.200v11.600H12V21H7.400A3.4 3.4 0 0 1 4 17.600z" fill={f} />
      <path d="M10.2 12H20M16.4 8l4 4-4 4" {...R} stroke={f} strokeWidth={3.4} />
    </>
  ),
  cloud: (f) => <path d="M7 19a4.6 4.6 0 0 1-.6-9.100A6 6 0 0 1 18 9.6 4.7 4.7 0 0 1 17.4 19z" fill={f} stroke={f} strokeWidth={1.2} strokeLinejoin="round" />,
  trophy: (f) => (
    <>
      <path d="M7 3.500h10v5.200a5 5 0 0 1-10 0z" fill={f} />
      <path d="M7 5H3.800v1.600A3.4 3.4 0 0 0 7.2 10M17 5h3.200v1.600A3.4 3.4 0 0 1 16.8 10" {...R} stroke={f} strokeWidth={2.2} />
      <rect x="10.6" y="12.8" width="2.8" height="4" fill={f} />
      <rect x="7.4" y="16.4" width="9.2" height="4.2" rx="2.1" fill={f} />
    </>
  ),
  clock: (f) => (
    <>
      <circle cx="12" cy="12" r="10" fill={f} />
      <path d="M12 6.600V12l3.6 2.2" {...R} stroke="#fff" strokeWidth={2.4} />
    </>
  ),
  calendar: (f) => (
    <>
      <rect x="3" y="4.6" width="18" height="16.4" rx="4.4" fill={f} />
      <rect x="6.8" y="2.4" width="2.6" height="5" rx="1.3" fill={f} />
      <rect x="14.6" y="2.4" width="2.6" height="5" rx="1.3" fill={f} />
      <rect x="6.6" y="11" width="4" height="3.2" rx="1.2" fill="#fff" />
      <rect x="13.4" y="11" width="4" height="3.2" rx="1.2" fill="#fff" />
      <rect x="6.6" y="15.8" width="4" height="3" rx="1.2" fill="#fff" />
    </>
  ),
  chart: (f) => (
    <>
      <rect x="3.6" y="12.6" width="4.6" height="8" rx="1.8" fill={f} />
      <rect x="9.7" y="8" width="4.6" height="12.6" rx="1.8" fill={f} />
      <rect x="15.8" y="4" width="4.6" height="16.6" rx="1.8" fill={f} />
    </>
  ),
  growth: (f) => (
    <>
      <ellipse cx="12" cy="13.8" rx="6.8" ry="8.2" fill={f} />
      <path d="M8 13.400l2.4-2 2 2 2-2 2.4 2" {...R} stroke="#fff" strokeWidth={1.8} />
    </>
  ),
}

/** Defs shared by every icon. Rendered once at the app root. */
export function IconDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <defs>
        <linearGradient id="ico-tone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".34" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#7A1F00" stopOpacity=".2" />
        </linearGradient>
        <radialGradient id="ico-gloss" cx=".3" cy=".2" r=".42">
          <stop offset="0" stopColor="#fff" stopOpacity=".6" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        {/* keeps only the white pixels of a module asset and paints them grey (locked module casilla) */}
        <filter id="mod-glyph" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
          <feColorMatrix type="matrix" values="0 0 0 0 .60  0 0 0 0 .65  0 0 0 0 .69  3.4 3.4 3.4 0 -9.2" />
        </filter>
      </defs>
    </svg>
  )
}

export function Icon({ name, size = 24, className = '', color, solid = false }: { name: IconName; size?: number; className?: string; color?: string; solid?: boolean }) {
  const P = PATHS[name]
  const paint = color || 'currentColor'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`} style={color ? { color } : undefined} aria-hidden>
      {P(paint)}
      {!solid && P('url(#ico-tone)')}
      {!solid && P('url(#ico-gloss)')}
    </svg>
  )
}

/** Round badge with a thick lip in the accent colour (button effect) and a white filled symbol. */
export function Badge({ icon, color = '#FF8001', accent = '#FF4F1A', size = 40, className = '' }: { icon: IconName; color?: string; accent?: string; size?: number; className?: string }) {
  return (
    <span className={`inline-grid shrink-0 place-items-center rounded-full text-white ${className}`} style={{ width: size, height: size, background: `linear-gradient(160deg, ${color}, ${color})`, boxShadow: `0 ${Math.max(3, size * 0.1)}px 0 ${accent}`, marginBottom: Math.max(3, size * 0.1) }}>
      <Icon name={icon} size={size * 0.56} />
    </span>
  )
}

export type ShapeKind = 'circle' | 'triangle' | 'square'
export function Shape({ kind, size = 24, color = 'currentColor' }: { kind: ShapeKind; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      {kind === 'circle' && <circle cx={12} cy={12} r={8.6} fill={color} />}
      {kind === 'triangle' && <path d="M12 3.6L21.4 19.6H2.6Z" fill={color} stroke={color} strokeWidth={2.4} strokeLinejoin="round" />}
      {kind === 'square' && <rect x={3.8} y={3.8} width={16.4} height={16.4} rx={3.4} fill={color} />}
    </svg>
  )
}

/* ============================== module marks (design assets) ============================== */

const MW = 132
const MH = 143.571
const LABEL_FONT = "'Nunito:Black', 'Nunito', sans-serif"
const letterCss = (left: number, top: number, color: string) => ({
  position: 'absolute' as const, left, top, transform: 'translateX(-50%)', width: 93.7, height: 66.28, textAlign: 'center' as const,
  fontFamily: LABEL_FONT, fontWeight: 900, fontSize: 56.372, lineHeight: 'normal', color, userSelect: 'none' as const,
})
const GLYPH_CLIP = 'ellipse(30% 26% at 50% 40.6%)'

/**
 * Module mark exactly as in the attached frames: coloured disc, white edge, thick lip and the module icon
 * (Aa · drop · 1 · chat bubble · pencil). `locked` repaints it in grey with the icon in grey at 60 %.
 */
export function ModuleArt({ id, size = 60, locked = false, className = '' }: { id: ModuleId; size?: number; locked?: boolean; className?: string }) {
  const k = size / MW
  const img = (src: string, top: number, h: number, extra: object = {}) => (
    <img src={src} alt="" draggable={false} className="absolute" style={{ left: 0, top, width: MW, height: h, ...extra }} />
  )
  return (
    <span className={`relative inline-block shrink-0 ${className}`} style={{ width: size, height: MH * k }} aria-hidden>
      <span className="absolute top-0 left-0 origin-top-left" style={{ width: MW, height: MH, transform: `scale(${k})` }}>
        {locked ? (
          <>
            <svg width={MW} height={MH} viewBox={`0 0 ${MW} ${MH}`} className="absolute inset-0">
              <path d="M0 94.285V58.79L132 58.285V94.285S132 143.571 66 143.571 0 94.285 0 94.285z" fill="#9AA5B1" />
              <ellipse cx="66" cy="58.286" rx="66" ry="58.286" fill="#D9DEE7" />
              <ellipse cx="66" cy="58.286" rx="61" ry="53.3" fill="none" stroke="#fff" strokeWidth="10" />
            </svg>
            <span className="absolute inset-0" style={{ opacity: 0.6 }}>
              {id === 1 && <span style={letterCss(66.1, 17.14, '#9AA5B1')}>Aa</span>}
              {id === 3 && <span style={letterCss(65.9, 20, '#9AA5B1')}>1</span>}
              {id === 2 && img('/modules/m2.svg', 0, MH, { filter: 'url(#mod-glyph)', clipPath: GLYPH_CLIP })}
              {id === 4 && img('/modules/m4.svg', 0, MH, { filter: 'url(#mod-glyph)', clipPath: GLYPH_CLIP })}
              {id === 5 && img('/modules/m5.svg', 0, MH, { filter: 'url(#mod-glyph)', clipPath: GLYPH_CLIP })}
            </span>
          </>
        ) : (
          <>
            {id === 1 && (
              <>
                {img('/modules/m1-lip.svg', 58.29, 85.286)}
                {img('/modules/m1-circle.svg', 0, 116.571)}
                <span style={letterCss(66.1, 17.14, '#fff')}>Aa</span>
              </>
            )}
            {id === 2 && img('/modules/m2.svg', 0, MH)}
            {id === 3 && (
              <>
                {img('/modules/m3-lip.svg', 58.29, 85.286)}
                {img('/modules/m3-circle.svg', 0, 116.571)}
                <span style={letterCss(65.9, 20, '#fff')}>1</span>
              </>
            )}
            {id === 4 && img('/modules/m4.svg', 0, MH)}
            {id === 5 && img('/modules/m5.svg', 0, MH)}
          </>
        )}
      </span>
    </span>
  )
}

/* ============================== pictograms (flat, filled) ============================== */

const INK = '#4A5A8C'
function Face({ fill, children }: { fill: string; children: ReactNode }) {
  return (
    <>
      <circle cx="32" cy="32" r="27" fill={fill} />
      {children}
    </>
  )
}
const Eyes = ({ y = 27, r = 3.4 }: { y?: number; r?: number }) => (
  <>
    <circle cx="22.5" cy={y} r={r} fill={INK} />
    <circle cx="41.5" cy={y} r={r} fill={INK} />
  </>
)

const PICTO: Record<string, ReactNode> = {
  FELIZ: (
    <Face fill="#FFD93D">
      <Eyes />
      <path d="M17 36c3 11 27 11 30 0z" fill={INK} />
      <circle cx="15" cy="37" r="4" fill="#FF9E7A" opacity=".7" />
      <circle cx="49" cy="37" r="4" fill="#FF9E7A" opacity=".7" />
    </Face>
  ),
  TRISTE: (
    <Face fill="#8FD0FF">
      <Eyes y={28} />
      <path d="M21 45c4-6 18-6 22 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M44 34c2 3 3 5 0 7-3-2-2-4 0-7z" fill="#fff" />
    </Face>
  ),
  ENOJADO: (
    <Face fill="#FF8A66">
      <Eyes y={30} r={3} />
      <path d="M16 20l11 5M48 20l-11 5" stroke={INK} strokeWidth="4.2" strokeLinecap="round" />
      <path d="M22 45c4-4 16-4 20 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    </Face>
  ),
  MIEDO: (
    <Face fill="#CDB8FF">
      <circle cx="22.5" cy="27" r="6.5" fill="#fff" />
      <circle cx="41.5" cy="27" r="6.5" fill="#fff" />
      <circle cx="22.5" cy="28" r="3" fill={INK} />
      <circle cx="41.5" cy="28" r="3" fill={INK} />
      <ellipse cx="32" cy="45" rx="5" ry="6.4" fill={INK} />
    </Face>
  ),
  CANSADO: (
    <Face fill="#FFC98B">
      <path d="M17 28c3 3 8 3 11 0M36 28c3 3 8 3 11 0" fill="none" stroke={INK} strokeWidth="3.6" strokeLinecap="round" />
      <ellipse cx="32" cy="44" rx="6" ry="5" fill={INK} />
      <text x="46" y="14" fontFamily="Nunito" fontWeight="900" fontSize="14" fill="#7B8AB0">z</text>
    </Face>
  ),
  AMO: <path d="M32 56C11 41 4 32 4 23c0-8 6-14 14-14 5 0 10 3 14 9 4-6 9-9 14-9 8 0 14 6 14 14 0 9-7 18-28 33z" fill="#FF6B8B" />,
  GRACIAS: (
    <>
      <path d="M10 30c0-6 4-10 10-10h24c6 0 10 4 10 10v6c0 10-8 18-22 18S10 46 10 36z" fill="#FFC98B" />
      <path d="M32 14c-5-6-14-2-14 5 0 6 8 10 14 15 6-5 14-9 14-15 0-7-9-11-14-5z" fill="#FF6B8B" />
    </>
  ),
  DIME: (
    <>
      <path d="M10 12h44a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H34L20 58V46h-10a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6z" fill="#45C1FF" />
      <circle cx="22" cy="29" r="4" fill="#fff" />
      <circle cx="34" cy="29" r="4" fill="#fff" />
      <circle cx="46" cy="29" r="4" fill="#fff" />
    </>
  ),
  ABRAZO: <path d="M32 55C12 40 5 31 5 22c0-8 6-13 13-13 5 0 10 3 14 9 4-6 9-9 14-9 7 0 13 5 13 13 0 9-7 18-27 33z" fill="#FF6B8B" />,
  'GRACIAS / PERDÓN': (
    <>
      <path d="M24 50C8 38 3 31 3 24c0-6 4-10 10-10 4 0 8 2 11 7 3-5 7-7 11-7 6 0 10 4 10 10 0 7-5 14-21 26z" fill="#FF6B8B" />
      <path d="M44 56c-12-9-16-14-16-19 0-4 3-7 7-7 3 0 6 1 9 5 2-4 5-5 8-5 4 0 7 3 7 7 0 5-5 10-15 19z" transform="translate(-2 -4)" fill="#D06BFF" />
    </>
  ),
  HAMBRE: (
    <>
      <path d="M32 18c-6-6-20-3-20 13 0 14 9 24 16 24 3 0 3-1 4-1s1 1 4 1c7 0 16-10 16-24 0-16-14-19-20-13z" fill="#FF5A4F" />
      <path d="M32 18c0-6 2-10 7-12" fill="none" stroke="#7A4A1E" strokeWidth="4" strokeLinecap="round" />
      <path d="M36 14c6-8 16-4 14 2-6 4-12 2-14-2z" fill="#73D83A" />
    </>
  ),
  SED: (
    <>
      <path d="M13 8h38l-5 46a5 5 0 0 1-5 4H23a5 5 0 0 1-5-4z" fill="#CFEFFF" />
      <path d="M16 26h32l-3 28a5 5 0 0 1-5 4H24a5 5 0 0 1-5-4z" fill="#45C1FF" />
      <circle cx="32" cy="42" r="4" fill="#fff" opacity=".7" />
    </>
  ),
  SUEÑO: (
    <>
      <path d="M44 8a24 24 0 1 0 12 36A20 20 0 0 1 44 8z" fill="#FFD93D" />
      <path d="M40 10l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#FFE44C" />
      <text x="44" y="30" fontFamily="Nunito" fontWeight="900" fontSize="16" fill="#8FA2D8">z</text>
      <text x="52" y="20" fontFamily="Nunito" fontWeight="900" fontSize="11" fill="#8FA2D8">z</text>
    </>
  ),
  BAÑO: (
    <>
      <rect x="16" y="6" width="32" height="20" rx="6" fill="#CFEFFF" />
      <path d="M10 28h44c0 14-8 24-22 24S10 42 10 28z" fill="#45C1FF" />
      <rect x="24" y="50" width="16" height="8" rx="3" fill="#9AA5B1" />
    </>
  ),
  AYUDA: (
    <>
      <path fillRule="evenodd" d="M32 6a26 26 0 1 1 0 52 26 26 0 0 1 0-52zm0 15a11 11 0 1 0 0 22 11 11 0 0 0 0-22z" fill="#FF5A4F" />
      <circle cx="32" cy="32" r="18.5" fill="none" stroke="#fff" strokeWidth="9" strokeDasharray="14.5 14.5" strokeDashoffset="7" />
    </>
  ),
  JUGAR: (
    <>
      <circle cx="32" cy="32" r="26" fill="#FF8001" />
      <path d="M32 6a26 26 0 0 1 22 40C40 46 30 36 32 6z" fill="#FFE44C" />
      <path d="M6 28C20 30 28 40 24 57A26 26 0 0 1 6 28z" fill="#45C1FF" />
      <circle cx="22" cy="18" r="5" fill="#fff" opacity=".5" />
    </>
  ),
  MAMÁ: (
    <>
      <path d="M13 30C9 8 55 8 51 30l3 14H10z" fill="#8A4B2A" />
      <circle cx="32" cy="29" r="14" fill="#F3C9A3" />
      <path d="M10 62c0-14 9-20 22-20s22 6 22 20z" fill="#FF8001" />
      <path d="M22 30c0-6 6-8 10-8s10 2 10 8c-5-3-15-3-20 0z" fill="#8A4B2A" />
    </>
  ),
  PAPÁ: (
    <>
      <circle cx="32" cy="27" r="14" fill="#F3C9A3" />
      <path d="M17 24c0-14 30-14 30 0-4-6-26-6-30 0z" fill="#3B2A20" />
      <path d="M10 62c0-14 9-20 22-20s22 6 22 20z" fill="#45C1FF" />
    </>
  ),
  NIDO: (
    <>
      <ellipse cx="24" cy="30" rx="9" ry="11" fill="#FFF1D6" />
      <ellipse cx="41" cy="29" rx="9" ry="11" fill="#FFE9BE" />
      <path d="M6 34c3 20 49 20 52 0z" fill="#B7793F" />
      <path d="M11 41l42-3M14 47l36-1" stroke="#8A5629" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  PAN: (
    <>
      <path d="M10 28c0-12 10-18 22-18s22 6 22 18c0 4-2 6-4 7v13c0 4-3 6-6 6H20c-3 0-6-2-6-6V35c-2-1-4-3-4-7z" fill="#E8A24A" />
      <path d="M22 18l-4 12M33 16l-4 14M44 18l-4 12" stroke="#FFD9A0" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  DEDO: (
    <>
      <rect x="25" y="4" width="13" height="30" rx="6.5" fill="#F3C9A3" />
      <path d="M14 34c0-4 3-6 7-6h26c6 0 11 4 11 10v8c0 10-8 16-18 16H30c-8 0-16-6-16-14z" fill="#F3C9A3" />
      <path d="M22 40v10M32 40v10M42 40v10" stroke="#E5A57E" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
}

export const hasPictogram = (content: string) => content in PICTO || content === 'DINO'
export function Pictogram({ content, size = 48 }: { content: string; size?: number }) {
  if (content === 'DINO') return <img src="/spike/3-feliz.svg" alt="" width={size} height={size} style={{ objectFit: 'contain' }} />
  const art = PICTO[content]
  if (!art) return null
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      {art}
    </svg>
  )
}
