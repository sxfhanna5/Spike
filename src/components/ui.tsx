import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { MODULES, ROUND_INFO, type ModuleId, type Person, type Round } from '../game/data'
import { useGame } from '../game/context'
import { Icon, ModuleArt, type IconName } from './glyphs'

/* ============================== buttons ============================== */

type Variant = 'primary' | 'secondary' | 'tertiary' | 'soft' | 'whiteOrange'
const VARIANTS: Record<Variant, { bg: string; edge: string; fg: string; shadow?: string }> = {
  // every important action: orange with the solid accent lip and a soft text shadow
  primary: { bg: '#FF8001', edge: '#FF4F1A', fg: '#FFFFFF', shadow: '0 2px 0 rgb(255 79 26 / .4)' },
  secondary: { bg: '#FFFFFF', edge: '#FFD2A8', fg: '#FF8001' },
  tertiary: { bg: '#FFFFFF', edge: '#FFD2A8', fg: '#FF8001' },
  whiteOrange: { bg: '#FFFFFF', edge: '#FFD2A8', fg: '#FF8001' },
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
      style={{ '--bg': v.bg, '--edge': v.edge, '--fg': v.fg, '--ts': v.shadow ?? 'none', fontWeight: 700 } as CSSProperties}
    >
      {icon && <Icon name={icon} size={26} solid />}
      {children}
    </button>
  )
}

/** Canonical primary action button: unified "Listo" or "Saltar tutorial". */
export function PrimaryActionButton({
  label = 'Listo',
  icon = 'check',
  onClick,
  disabled,
  className = '',
}: {
  label?: string
  icon?: IconName | null
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`btn3d mx-auto flex h-[58px] sm:h-[62px] w-full max-w-[280px] sm:max-w-[300px] items-center justify-center gap-3 rounded-full font-bold cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      style={{
        '--bg': '#FF8001',
        '--edge': '#FF4F1A',
        '--fg': '#FFFFFF',
        '--ts': '0 2px 0 rgb(255 79 26 / .4)',
        fontSize: 22,
        fontWeight: 700,
      } as CSSProperties}
    >
      {icon && <Icon name={icon} size={24} solid color="#FFFFFF" />}
      <span>{label}</span>
    </button>
  )
}

/** White dock that lets an orange button stand out on an orange scene. */
export function Dock({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card-in rounded-full bg-white p-2 shadow-[0_8px_20px_rgba(0,0,0,.14)] ${className}`}>{children}</div>
}

/** Round icon button (back, close, play…): white disc, soft lip, gradient glyph. */
export function RoundBtn({ icon, label, onClick, size = 52, bg = '#FFFFFF', fg = '#FF8001', edge = '#FFD2A8', className = '', style }: {
  icon: IconName
  label: string
  onClick: () => void
  size?: number
  bg?: string
  fg?: string
  edge?: string
  className?: string
  style?: CSSProperties
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`btn3d grid shrink-0 place-items-center rounded-full ${className}`}
      style={{ '--bg': bg, '--edge': edge, '--fg': fg, width: size, height: size, minHeight: size, padding: 0, ...style } as CSSProperties}
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
      className="btn3d absolute left-4 sm:left-5 z-30 grid size-[46px] sm:size-[48px] place-items-center rounded-full"
      style={{ '--bg': light ? '#FFFFFF' : '#4A5A8C', '--edge': '#FFD2A8', '--fg': light ? '#FF8001' : '#fff', padding: 0, minHeight: 46, top: 'calc(1.5rem + env(safe-area-inset-top, 0px))' } as CSSProperties}
    >
      <Icon name="close" size={22} solid />
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
      <div className="sheet-up w-full rounded-t-[32px] bg-white px-5 pt-3 pb-8 shadow-[0_-12px_40px_rgba(0,0,0,0.16)]" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }} onClick={(e) => e.stopPropagation()}>
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

/** Round parent / child icons with solid circular backgrounds (blue for father, orange for child). */
export function Avatar({ who, size = 56, cap, question, halo, className = '', bg }: { who: Person; size?: number; cap?: boolean; question?: boolean; halo?: boolean; className?: string; bg?: string }) {
  const isPapa = who === 'papa'
  return (
    <span
      className={`relative inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-label={isPapa ? 'Padre' : 'Niño'}
    >
      <span
        className={`absolute inset-0 overflow-hidden rounded-full flex items-end justify-center ${bg ? '' : isPapa ? 'bg-[#45C1FF]' : 'bg-[#FF8001]'}`}
        style={{
          ...(bg ? { background: bg } : {}),
          ...(halo ? { filter: 'drop-shadow(0 6px 8px rgba(74,90,140,.22))' } : {}),
        }}
      >
        {isPapa ? (
          <img
            src="/people/padre.png"
            alt="Padres"
            draggable={false}
            className="w-[124%] max-w-none translate-y-[2%] select-none pointer-events-none"
          />
        ) : (
          <img
            src="/assets/dac2e.svg"
            alt="Niño"
            draggable={false}
            className="w-[84%] max-w-none translate-y-[1%] select-none pointer-events-none"
          />
        )}
      </span>
      {cap && (
        <span className="absolute left-1/2 -translate-x-1/2 text-[#D06BFF] drop-shadow-[0_3px_0_rgba(138,63,196,.55)]" style={{ top: -size * 0.27 }}>
          <Icon name="cap" size={size * 0.56} solid />
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

/** Unified learned words counter pill (droplet icon + number). */
export function LearnedWordBadge({ count, plus = false, className = '' }: { count: number; plus?: boolean; className?: string }) {
  return (
    <div
      className={`flex h-[46px] sm:h-[50px] min-w-[108px] sm:min-w-[120px] items-center justify-center gap-2 rounded-full bg-[#FF8001] px-4 sm:px-5 shadow-[0_4px_14px_rgba(255,128,1,0.38)] text-white select-none ${className}`}
    >
      <Icon name="drop" size={20} color="#FFFFFF" solid />
      <span className="font-display text-[22px] sm:text-[25px] font-bold">{plus ? `+${count}` : count}</span>
    </div>
  )
}

export interface InstructionStripProps {
  round?: Round
  signer?: Person
  guesser?: Person
  text?: string
  action?: 'adivina' | 'escribe'
  className?: string
}

/** Canonical instruction capsule: who signs → who guesses/writes (Figma 659:2283 & 659:1601). */
export function InstructionStrip({
  round,
  signer: propSigner,
  guesser: propGuesser,
  text: propText,
  action,
  className = '',
}: InstructionStripProps) {
  const { s } = useGame()
  const r = round ? ROUND_INFO[round] : ROUND_INFO[s?.queue?.[Math.min(s.idx, (s.queue?.length ?? 1) - 1)]?.round ?? 'directa']
  const signerWho: Person = propSigner ?? r?.signer ?? 'papa'
  const guesserWho: Person = propGuesser ?? r?.guesser ?? 'nino'

  // Regla de color estricta: Padre = azul (#45C1FF), Niño = naranja (#FF8001). NUNCA amarillo.
  const signerBg = signerWho === 'papa' ? '#45C1FF' : '#FF8001'
  const guesserBg = guesserWho === 'papa' ? '#45C1FF' : '#FF8001'
  const handColor = signerWho === 'papa' ? '#45C1FF' : '#FF8001'

  const act = action ?? ((s?.level === 5 || s?.screen === 'write') ? 'escribe' : 'adivina')
  const defaultText = propText ?? (
    signerWho === 'papa'
      ? `Padre hace seña - niño ${act}`
      : `Niño hace seña - padre ${act}`
  )

  return (
    <div
      className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white px-2.5 sm:px-3.5 h-[42px] sm:h-[46px] shadow-[0_4px_14px_rgba(0,0,0,0.08)] select-none shrink-0 max-w-full ${className}`}
    >
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <Avatar who={signerWho} size={25} bg={signerBg} />
        <Icon name="hand" size={19} color={handColor} solid />
        <Icon name="arrowRight" size={13} color="#4A5A8C" />
        <Avatar who={guesserWho} size={25} bg={guesserBg} />
      </div>
      <span className="font-sans font-bold text-[12px] sm:text-[13px] text-[#4A5A8C] whitespace-nowrap pl-0.5 sm:pl-1">
        {defaultText}
      </span>
    </div>
  )
}

/** Backwards-compatible alias for InstructionStrip. */
export function RoundChip({ round, className = '', textless }: { round: Round; className?: string; textless?: boolean }) {
  return <InstructionStrip round={round} className={className} />
}

/** In-reto header: X, module badge, progress bar and the canonical instruction strip. */
export function GameHeader({ chip = true, x = true, onWhite = false }: { chip?: boolean; x?: boolean; onWhite?: boolean }) {
  const { s } = useGame()
  const m = MODULES[s.level]
  const total = s.queue.length
  const round = s.queue[Math.min(s.idx, total - 1)].round
  const isColors = s.level === 2
  const isNumbers = s.level === 3
  const isWrite = s.level === 5
  return (
    <div className="relative z-20 flex flex-col items-center pt-[calc(1.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(2rem+env(safe-area-inset-top,0px))]">
      {x && <XButton />}
      <ModuleBadge id={s.level} size={50} />
      <div className="mt-2.5 flex w-full max-w-[280px] sm:max-w-[320px] items-center justify-center px-2">
        <div className="flex flex-1 gap-1.5 justify-center" aria-hidden>
          {Array.from({ length: total }, (_, k) => {
            const isDoneOrCurrent = k <= s.idx
            if (isColors) {
              return (
                <span
                  key={k}
                  className="h-[6px] sm:h-[7px] flex-1 max-w-[32px] overflow-hidden rounded-full transition-colors duration-300"
                  style={{ background: isDoneOrCurrent ? '#FF4F1A' : '#F9F9F9' }}
                />
              )
            }
            if (isNumbers) {
              return (
                <span
                  key={k}
                  className="h-[6px] sm:h-[7px] flex-1 max-w-[32px] overflow-hidden rounded-full transition-colors duration-300"
                  style={{ background: isDoneOrCurrent ? '#45C1FF' : '#F9F9F9' }}
                />
              )
            }
            if (isWrite) {
              return (
                <span
                  key={k}
                  className="h-[6px] sm:h-[7px] flex-1 max-w-[32px] overflow-hidden rounded-full transition-colors duration-300"
                  style={{ background: isDoneOrCurrent ? '#C48243' : '#F9F9F9' }}
                />
              )
            }
            return (
              <span
                key={k}
                className="h-[6px] sm:h-[7px] flex-1 max-w-[32px] overflow-hidden rounded-full"
                style={{ background: onWhite ? '#E6EAF5' : 'rgba(255,255,255,0.75)' }}
              >
                <span
                  className="block h-full rounded-full"
                  style={{ width: isDoneOrCurrent ? '100%' : '0%', background: m.color, transition: 'width 500ms cubic-bezier(.3,1.2,.5,1)' }}
                />
              </span>
            )
          })}
        </div>
      </div>
      {chip && <InstructionStrip round={round} action={isWrite ? 'escribe' : 'adivina'} className="mt-3" />}
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
    <nav className="absolute left-1/2 z-40 -translate-x-1/2 origin-bottom max-w-[95vw] drop-shadow-[0_10px_20px_rgba(74,90,140,.25)]" style={{ width: NAV_W * NAV_K, height: NAV_H * NAV_K, bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }} aria-label="Navegación">
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
