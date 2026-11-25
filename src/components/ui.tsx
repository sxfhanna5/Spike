import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { MODULES, ROUND_INFO, type ModuleId, type Person, type Round } from '../game/data'
import { useGame } from '../game/context'
import { Icon, ModuleArt, type IconName } from './glyphs'

/* ============================== buttons ============================== */

type Variant = 'primary' | 'secondary' | 'tertiary' | 'soft'
const VARIANTS: Record<Variant, { bg: string; edge: string; fg: string; shadow?: string }> = {
  // every important action: orange with the solid accent lip and a soft text shadow
  primary: { bg: '#FF8001', edge: '#FF4F1A', fg: '#FFFFFF', shadow: '0 2px 0 rgb(255 79 26 / .4)' },
  secondary: { bg: '#FFFFFF', edge: '#D9DEE7', fg: '#4A5A8C' },
  tertiary: { bg: '#F1F3F8', edge: '#D9DEE7', fg: '#65739F' },
  // gentle secondary action (log out): very light orange, no red
  soft: { bg: '#FFE6CC', edge: '#FFD2A8', fg: '#FF8001' },
}

export function Btn({ children, onClick, variant = 'primary', icon, disabled, className = '', full = true, type = 'button', ariaLabel }: {
  children?: ReactNode
  onClick?: () => void
  variant?: Variant
  icon?: IconName
  disabled?: boolean
  className?: string
  full?: boolean
  type?: 'button' | 'submit'
  ariaLabel?: string
}) {
  const v = VARIANTS[variant]
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`btn3d inline-flex min-h-[60px] items-center justify-center gap-3 rounded-full px-8 ${full ? 'w-full' : ''} ${className}`}
      style={{ '--bg': v.bg, '--edge': v.edge, '--fg': v.fg, '--ts': v.shadow ?? 'none', fontWeight: variant === 'primary' ? 700 : 600 } as CSSProperties}
    >
      {icon && <Icon name={icon} size={26} />}
      {children}
    </button>
  )
}

/** White dock that lets an orange button stand out on an orange scene. */
export function Dock({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card-in rounded-full bg-white p-2 shadow-[0_8px_20px_rgba(0,0,0,.14)] ${className}`}>{children}</div>
}

/** Round icon button (back, close, play…): white disc, soft lip, gradient glyph. */
export function RoundBtn({ icon, label, onClick, size = 52, bg = '#FFFFFF', fg = '#FF8001', edge = '#FFD2A8', className = '' }: {
  icon: IconName
  label: string
  onClick: () => void
  size?: number
  bg?: string
  fg?: string
  edge?: string
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`btn3d grid shrink-0 place-items-center rounded-full ${className}`}
      style={{ '--bg': bg, '--edge': edge, '--fg': fg, width: size, height: size, minHeight: size, padding: 0 } as CSSProperties}
    >
      <Icon name={icon} size={size * 0.5} />
    </button>
  )
}

export function XButton({ light = true }: { light?: boolean }) {
  const { dispatch } = useGame()
  return (
    <button
      type="button"
      aria-label="Salir del reto"
      onClick={() => dispatch({ type: 'OVERLAY', overlay: 'exit' })}
      className="btn3d absolute top-5 left-5 z-30 grid size-14 place-items-center rounded-full"
      style={{ '--bg': light ? '#FFFFFF' : '#4A5A8C', '--edge': '#FFD2A8', '--fg': light ? '#FF8001' : '#fff', padding: 0, minHeight: 56 } as CSSProperties}
    >
      <Icon name="close" size={28} />
    </button>
  )
}

/* ============================== motion helpers ============================== */

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Counts from 0 to the value (the value itself when motion is reduced). */
export function useCountUp(value: number, ms = 800) {
  const [v, setV] = useState(() => (reduced() ? value : 0))
  useEffect(() => {
    if (reduced()) { setV(value); return }
    let raf = 0
    const t0 = performance.now()
    const from = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / ms)
      const e = 1 - (1 - t) ** 3
      setV(Math.round(from + (value - from) * e))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, ms])
  return v
}
export function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const v = useCountUp(value)
  return <>{v}{suffix}</>
}

/** Progress bar whose fill animates from 0 to the value. */
export function Bar({ pct, color, height = 10, track = '#E8ECF6', className = '' }: { pct: number; color: string; height?: number; track?: string; className?: string }) {
  const [w, setW] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setW(Math.max(0, Math.min(100, pct))))
    return () => cancelAnimationFrame(id)
  }, [pct])
  return (
    <div className={`overflow-hidden rounded-full ${className}`} style={{ height, background: track }} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full" style={{ width: `${w}%`, background: color, transition: 'width 800ms cubic-bezier(.3,1.15,.5,1)' }} />
    </div>
  )
}

/** Soft twinkling sparkles (slow fades, never a flash). */
const SPARKS = [[12, 14, 22], [82, 10, 18], [20, 34, 16], [90, 40, 24], [8, 58, 18], [76, 64, 20], [30, 78, 16], [62, 24, 14], [48, 86, 20], [92, 82, 16]] as const
export function Sparkles({ color = '#fff', className = '' }: { color?: string; className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {SPARKS.map(([x, y, sz], k) => (
        <span key={k} className="sparkle-fx absolute" style={{ left: `${x}%`, top: `${y}%`, color, animationDelay: `${(k * 0.37) % 2.6}s`, animationDuration: `${3 + (k % 3) * 0.6}s` }}>
          <Icon name="sparkle" size={sz} />
        </span>
      ))}
    </div>
  )
}

/* ============================== layout ============================== */

export function Screen({ children, bg = '#FFFFFF', className = '' }: { children: ReactNode; bg?: string; className?: string }) {
  return (
    <div className={`screen-in relative h-full w-full overflow-hidden ${className}`} style={{ background: bg }}>
      {children}
    </div>
  )
}

export function Sheet({ children, onClose, label }: { children: ReactNode; onClose?: () => void; label: string }) {
  return (
    <div className="fade-in absolute inset-0 z-50 flex items-end bg-[#4A5A8C]/45" onClick={onClose} role="dialog" aria-label={label} aria-modal>
      <div className="sheet-up w-full rounded-t-[32px] bg-white px-5 pt-3 pb-8 shadow-[0_-12px_40px_rgba(0,0,0,0.16)]" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D9DEE7]" />
        {children}
      </div>
    </div>
  )
}

/** Timer that stops while the game is paused (exit sheet, egg disconnected) and restarts afterwards. */
export function usePausedTimeout(cb: () => void, ms: number, active = true, deps: unknown[] = []) {
  const { paused } = useGame()
  const ref = useRef(cb)
  ref.current = cb
  useEffect(() => {
    if (paused || !active) return
    const t = window.setTimeout(() => ref.current(), ms)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, active, ms, ...deps])
}

/* ============================== Spike ============================== */

export type SpikeMood = 'sleep' | 'calm' | 'happy' | 'restless' | 'confused' | 'surprised'
const MOOD_CLASS: Record<SpikeMood, string> = {
  sleep: 'spike-breathe',
  calm: 'spike-breathe',
  happy: 'spike-bounce',
  restless: 'spike-wiggle',
  confused: 'spike-tilt',
  surprised: 'spike-bounce',
}
/** Frame of the attached dinosaur set per mood: Relax Feliz · Confundido · Sorprendido (pasar de nivel). */
const EMOTION: Record<SpikeMood, 'feliz' | 'confundido' | 'sorprendido'> = {
  sleep: 'feliz', calm: 'feliz', happy: 'feliz', restless: 'feliz', confused: 'confundido', surprised: 'sorprendido',
}

/** Spike by growth stage (1 huevo … 5 adulto), using the attached frames as they are. */
export function Spike({ stage = 5, mood = 'calm', size = 160, locked, className = '', animate = true }: {
  stage?: number
  mood?: SpikeMood
  size?: number
  locked?: boolean
  className?: string
  animate?: boolean
}) {
  const st = Math.max(1, Math.min(5, stage))
  return (
    <span className={`relative inline-flex shrink-0 items-end justify-center ${className}`} style={{ width: size, height: size }}>
      <img
        src={`/spike/${st}-${EMOTION[mood]}.svg`}
        alt={locked ? 'Etapa bloqueada' : 'Spike'}
        draggable={false}
        className={`h-full w-full object-contain object-bottom ${animate && !locked ? MOOD_CLASS[mood] : ''}`}
        style={locked ? { filter: 'brightness(0) invert(.84)' } : undefined}
      />
      {mood === 'sleep' && !locked && (
        <span className="pointer-events-none absolute font-display font-semibold text-ink2" style={{ right: size * 0.04, top: size * 0.04, fontSize: size * 0.17 }}>
          <span className="zzz inline-block">z</span>
          <span className="zzz inline-block" style={{ animationDelay: '.9s', fontSize: '0.75em' }}>z</span>
        </span>
      )}
    </span>
  )
}

/* ============================== avatars ============================== */

/** Round parent / child icons from the attached frames. They have no background of their own. */
export function Avatar({ who, size = 56, cap, question, halo, className = '' }: { who: Person; size?: number; cap?: boolean; question?: boolean; halo?: boolean; className?: string }) {
  return (
    <span className={`relative inline-block shrink-0 ${className}`} style={{ width: size, height: size }} aria-label={who === 'papa' ? 'Padre' : 'Niño'}>
      <span className="absolute inset-0 overflow-hidden rounded-full" style={halo ? { filter: 'drop-shadow(0 6px 8px rgba(74,90,140,.22))' } : undefined}>
        {who === 'papa' ? (
          <>
            <span className="absolute" style={{ left: 0, right: '-2.21%', top: '19.49%', bottom: '-1.81%' }}>
              <img src="/people/padre.png" alt="" draggable={false} className="size-full max-w-none" />
            </span>
            <img src="/people/padre-detalle.svg" alt="" draggable={false} className="absolute max-w-none" style={{ left: '20.2%', top: '53.74%', width: '19.5%', height: '5.49%' }} />
          </>
        ) : (
          <img src="/people/hijo.svg" alt="" draggable={false} className="absolute max-w-none" style={{ left: '11.52%', top: '7.47%', width: '76.77%', height: '92.53%' }} />
        )}
      </span>
      {cap && (
        <span className="absolute left-1/2 -translate-x-1/2 text-[#D06BFF] drop-shadow-[0_3px_0_rgba(138,63,196,.55)]" style={{ top: -size * 0.27 }}>
          <Icon name="cap" size={size * 0.56} />
        </span>
      )}
      {question && (
        <span className="absolute -top-1 -right-2 grid place-items-center rounded-full bg-white font-display font-bold text-ink2 shadow-[0_4px_10px_rgba(0,0,0,.14)]" style={{ width: size * 0.42, height: size * 0.42, fontSize: size * 0.3 }}>
          ?
        </span>
      )}
    </span>
  )
}

/** Account icon: the profile face of the navigation bar. */
export function ProfileFace({ size = 48 }: { size?: number }) {
  return <img src="/nav/perfil.svg" alt="" draggable={false} width={size} height={size} />
}

/* ============================== module marks ============================== */

/** Module mark of the design frames (disc + lip + icon), used in chips, cards and headers. */
export function ModuleBadge({ id, size = 52 }: { id: ModuleId; size?: number }) {
  return <ModuleArt id={id} size={size} />
}

/** Who signs → who guesses. */
export function RoundChip({ round, className = '', textless }: { round: Round; className?: string; textless?: boolean }) {
  const r = ROUND_INFO[round]
  return (
    <span className={`card-in inline-flex items-center gap-2 rounded-full bg-white py-1.5 ${textless ? 'pr-3' : 'pr-4'} pl-1.5 text-[14px] font-bold whitespace-nowrap text-ink2 shadow-[0_3px_8px_rgba(0,0,0,.1)] ${className}`}>
      <Avatar who={r.signer} size={28} />
      <Icon name="hand" size={20} color={r.signer === 'papa' ? '#45C1FF' : '#FF8001'} />
      <Icon name="arrowRight" size={14} color="#4A5A8C" />
      <Avatar who={r.guesser} size={28} />
      {!textless && <span className="ml-1 font-bold">{r.short}</span>}
    </span>
  )
}

/** In-reto header: X, module badge, progress bar «3 de 8» and the round chip. */
export function GameHeader({ chip = true, x = true, onWhite = false }: { chip?: boolean; x?: boolean; onWhite?: boolean }) {
  const { s } = useGame()
  const m = MODULES[s.level]
  const total = s.queue.length
  const round = s.queue[Math.min(s.idx, total - 1)].round
  return (
    <div className="relative z-20 flex flex-col items-center pt-[18px]">
      {x && <XButton />}
      <ModuleBadge id={s.level} size={52} />
      <div className="mt-2 flex w-[330px] items-center gap-3">
        <div className="flex flex-1 gap-1" aria-hidden>
          {Array.from({ length: total }, (_, k) => (
            <span key={k} className="h-[6px] flex-1 overflow-hidden rounded-full" style={{ background: onWhite ? '#E6EAF5' : 'rgba(255,255,255,0.75)' }}>
              <span className="block h-full rounded-full" style={{ width: k <= s.idx ? '100%' : '0%', background: m.color, transition: 'width 500ms cubic-bezier(.3,1.2,.5,1)' }} />
            </span>
          ))}
        </div>
        <span className="font-sans text-[14px] font-extrabold whitespace-nowrap text-ink">{Math.min(s.idx + 1, total)} de {total}</span>
      </div>
      {chip && <RoundChip round={round} className="mt-3.5" textless={s.facing === 'nino'} />}
    </div>
  )
}

/* ============================== navigation ============================== */

const NAV_W = 748
const NAV_H = 212
const NAV_K = 0.42
/** Centre x of each tab in the 748 × 212 design of the navigation bar. */
const TABS = [
  { id: 'map', label: 'Mapa', cx: 194.5 },
  { id: 'album', label: 'Progreso', cx: 385.5 },
  { id: 'profile', label: 'Perfil', cx: 573 },
] as const

const ins = (t: number, r: number, b: number, l: number): CSSProperties => ({ position: 'absolute', top: `${t}%`, right: `${r}%`, bottom: `${b}%`, left: `${l}%` })
const fill = 'absolute inset-0 block max-w-none size-full'

/** Floating bar from the design frames. The orange indicator slides to the tab of the current screen. */
export function NavBar() {
  const { s, dispatch } = useGame()
  const idx = Math.max(0, TABS.findIndex((t) => t.id === s.screen))
  const cx = TABS[idx].cx
  return (
    <nav className="absolute bottom-5 left-1/2 z-40 -translate-x-1/2 drop-shadow-[0_10px_20px_rgba(74,90,140,.25)]" style={{ width: NAV_W * NAV_K, height: NAV_H * NAV_K }} aria-label="Navegación">
      <div className="card-in absolute top-0 left-0 origin-top-left rounded-[111px] bg-white" style={{ width: NAV_W, height: NAV_H, transform: `scale(${NAV_K})` }}>
        {/* Mapa */}
        <div className={`absolute overflow-clip transition-transform duration-300 ease-[cubic-bezier(.3,1.5,.5,1)] ${idx === 0 ? '-translate-y-2 scale-105' : ''}`} style={{ left: 139, top: 35, width: 111, height: 122 }}>
          <div style={ins(16.9, -3.75, -3.15, -3.75)}><img src="/nav/mapa-folded.svg" alt="" className={fill} draggable={false} /></div>
          <div style={ins(0.39, 23.67, 37.32, 23.67)}><img src="/nav/mapa-pin.svg" alt="" className={fill} draggable={false} /></div>
        </div>
        {/* Progreso */}
        <div className={`absolute overflow-visible transition-transform duration-300 ease-[cubic-bezier(.3,1.5,.5,1)] ${idx === 1 ? '-translate-y-2 scale-105' : ''}`} style={{ left: 331, top: 37, width: 109, height: 118 }}>
          <div style={ins(63.56, 72.48, 0, 0)}><img src="/nav/prog-1.svg" alt="" className={fill} draggable={false} /></div>
          <div style={ins(50.85, 39.45, 0, 33.03)}><img src="/nav/prog-2.svg" alt="" className={fill} draggable={false} /></div>
          <div style={ins(41.15, 6.52, 0.37, 65.95)}><img src="/nav/prog-3.svg" alt="" className={fill} draggable={false} /></div>
          <div style={ins(0, -0.14, 64.3, 59.65)}><img src="/nav/prog-star.svg" alt="" className={fill} draggable={false} /></div>
        </div>
        {/* Perfil */}
        <div className={`absolute transition-transform duration-300 ease-[cubic-bezier(.3,1.5,.5,1)] ${idx === 2 ? '-translate-y-2 scale-105' : ''}`} style={{ left: 515, top: 38, width: 116, height: 116 }}>
          <img src="/nav/perfil.svg" alt="" className={fill} draggable={false} />
        </div>
        {/* sliding indicator */}
        <div className="absolute rounded-[48px] bg-[#FF8001]" style={{ left: cx - 38.5, top: 176, width: 77, height: 13, transition: 'left 420ms cubic-bezier(.3,1.4,.5,1)' }} aria-hidden />
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-label={t.label}
            aria-current={s.screen === t.id ? 'page' : undefined}
            onClick={() => dispatch({ type: 'NAV', screen: t.id })}
            className="absolute rounded-full outline-offset-[-6px]"
            style={{ left: t.cx - 95, top: 8, width: 190, height: 196 }}
          />
        ))}
      </div>
    </nav>
  )
}

/** Connected dot shared by the map chip and the profile. */
export function ConnDot({ on }: { on: boolean }) {
  return <span className={`inline-block size-3 shrink-0 rounded-full ${on ? 'bg-[#73D83A]' : 'bg-[#9AA5B1]'}`} role="img" aria-label={on ? 'Huevo conectado' : 'Huevo desconectado'} />
}
