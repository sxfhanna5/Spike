import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useGame } from '../game/context'
import { MODULES, MODULE_IDS, SLOTS, TOTAL_CASILLAS, moduleOf, slotOfModule, slotOfReto, type ModuleDef, type ModuleId } from '../game/data'
import { stageOf } from '../game/engine'
import { FRAME_H, FRAME_W, K, MAP_H, PATH_D, getGeometry } from '../game/mapGeometry'
import { MapArt } from '../art/MapArt'
import { Badge, Icon, ModuleArt } from '../components/glyphs'
import { ModuleBadge, NavBar, Screen, Spike } from '../components/ui'

type TileState = 'locked' | 'active' | 'done'

/** Challenge casillas and module casillas share one diameter (the design's 132 px disc, reduced). */
const TILE_W = 59
const TILE_SCALE = TILE_W / 132
/** Centre of the colour disc inside the tile box (the white edge is drawn inside the disc, so it does not move it). */
const CX = 66 * TILE_SCALE
const CY = 58.286 * TILE_SCALE
const TILE_H = 143.571 * TILE_SCALE

export const moduleState = (id: ModuleId, done: number): TileState => (done >= MODULES[id].last ? 'done' : done >= MODULES[id].first - 1 ? 'active' : 'locked')

/** One reto: 3D disc. Locked = grey + lock · active = white with the module colour and its number · done = module colour + check. */
function Tile({ n, state, m, shaking, onTap }: { n: number; state: TileState; m: ModuleDef; shaking: boolean; onTap: () => void }) {
  const top = state === 'locked' ? '#D9DEE7' : state === 'active' ? '#FFFFFF' : m.color
  const side = state === 'locked' ? '#9AA5B1' : m.accent
  const ring = state === 'active' ? m.color : '#FFFFFF'
  const label = `Reto ${n - m.first + 1} de ${m.challenges.length}, ${m.name}, ${state === 'locked' ? 'bloqueado' : state === 'active' ? 'siguiente' : 'completado'}`
  return (
    <button type="button" onClick={onTap} aria-label={label} className={`relative block ${shaking ? 'shake' : ''}`} style={{ width: TILE_W, height: TILE_H }}>
      {state === 'active' && <span className="glow-pulse pointer-events-none absolute rounded-full blur-[7px]" style={{ left: -10, top: -9, width: TILE_W + 20, height: 62, background: m.accent, opacity: 0.8 }} />}
      <svg width={TILE_W} height={TILE_H} viewBox="0 0 132 143.571" className={`relative ${state === 'active' ? 'tile-pulse' : ''}`} style={{ transformOrigin: '50% 40%' }} aria-hidden>
        <path d="M0 94.285V58.79L132 58.285V94.285S132 143.571 66 143.571 0 94.285 0 94.285z" fill={side} />
        <ellipse cx="66" cy="58.286" rx="66" ry="58.286" fill={top} />
        <ellipse cx="66" cy="58.286" rx="61" ry="53.3" fill="none" stroke={ring} strokeWidth="10" />
        {state === 'active' && <text x="66" y="76" textAnchor="middle" fontFamily="Fredoka" fontWeight="700" fontSize="46" fill={m.accent}>{n - m.first + 1}</text>}
      </svg>
      {state === 'locked' && <span className="pointer-events-none absolute grid place-items-center" style={{ left: CX - 13, top: CY - 13, width: 26, height: 26 }}><Icon name="lock" size={24} color="#FFFFFF" solid /></span>}
      {state === 'done' && <span className="pointer-events-none absolute grid place-items-center" style={{ left: CX - 14, top: CY - 14, width: 28, height: 28 }}><Icon name="check" size={28} color="#fff" /></span>}
    </button>
  )
}

/** Start of a module: same disc as the retos, with the module icon instead of a number. Not a reto, not counted in the 46. */
function ModuleTile({ id, state, onTap }: { id: ModuleId; state: TileState; onTap: () => void }) {
  const m = MODULES[id]
  return (
    <button type="button" onClick={onTap} aria-label={`Módulo ${m.name}, ${state === 'locked' ? 'bloqueado' : state === 'active' ? 'en curso' : 'completado'}`} className="relative block" style={{ width: TILE_W, height: TILE_H }}>
      {state === 'active' && <span className="glow-pulse pointer-events-none absolute rounded-full blur-[7px]" style={{ left: -10, top: -9, width: TILE_W + 20, height: 62, background: m.accent, opacity: 0.8 }} />}
      <span className={`relative block ${state === 'active' ? 'tile-pulse' : ''}`} style={{ transformOrigin: '50% 40%' }}>
        <ModuleArt id={id} size={TILE_W} locked={state === 'locked'} />
      </span>
      {state === 'done' && <span className="pop pointer-events-none absolute" style={{ right: -7, top: -7 }}><Badge icon="check" color="#73D83A" accent="#369C00" size={22} /></span>}
    </button>
  )
}

/** Rounded cloud made of circles; drawn at (x, y) with a width scale. */
function Cloud({ x, y, k = 1, fill }: { x: number; y: number; k?: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} fill={fill}>
      <circle cx="40" cy="46" r="34" />
      <circle cx="92" cy="30" r="42" />
      <circle cx="148" cy="44" r="36" />
      <circle cx="196" cy="52" r="28" />
      <rect x="6" y="46" width="214" height="34" rx="17" />
    </g>
  )
}

const TOTAL_MAP_H = MAP_H + 160

export function MapScreen() {
  const { s, dispatch } = useGame()
  const geo = useMemo(() => getGeometry(), [])
  const scroller = useRef<HTMLDivElement>(null)
  const layers = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const active = Math.min(TOTAL_CASILLAS, s.done + 1)
  const finished = s.done >= TOTAL_CASILLAS
  const anim = s.mapAnim
  const slotArcs = geo.arcs
  const activeSlot = slotOfReto(active)
  const stage = stageOf(s.done)

  useEffect(() => {
    const updateScale = () => {
      if (scroller.current) {
        const w = scroller.current.clientWidth
        if (w > 0) setScale(w / 390)
      }
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  // Spike's position along the path (arc) and the hop height.
  const [pos, setPos] = useState(() => ({ arc: slotArcs[slotOfReto(anim ? anim.from : active)], hop: 0 }))
  const [shake, setShake] = useState<number | null>(null)
  const [toast, setToast] = useState<{ key: number; text: string; icon: 'lock' | 'cloud' } | null>(null)

  const px = (p: { x: number; y: number }) => ({ x: p.x * K, y: p.y * K })
  const pts = useMemo(() => slotArcs.map((a) => px(geo.pointAt(a))), [geo, slotArcs])

  const scrollToArc = (arc: number, smooth: boolean, offset = 0) => {
    const el = scroller.current
    if (!el) return
    const y = geo.pointAt(arc).y * K * scale
    const totalH = TOTAL_MAP_H * scale
    const top = Math.max(0, Math.min(totalH - el.clientHeight, y - el.clientHeight / 2 + 20 + offset * scale))
    if (smooth) el.scrollTo({ top, behavior: 'smooth' })
    else el.scrollTop = top
  }

  // Parallax: layers drift at most ±6 px (12 px in total) over the whole scroll.
  const onScroll = () => {
    const el = scroller.current
    if (!el || !layers.current) return
    const totalH = TOTAL_MAP_H * scale
    const t = el.scrollTop / Math.max(1, totalH - el.clientHeight)
    layers.current.style.setProperty('--py', `${(t - 0.5) * 12}px`)
  }

  useLayoutEffect(() => {
    scrollToArc(slotArcs[slotOfReto(anim ? anim.from : active)], false, 220)
    onScroll()
    const t = window.setTimeout(() => scrollToArc(slotArcs[slotOfReto(anim ? anim.from : active)], true), 80)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // After a reto: Spike hops from casilla to casilla (also over a module casilla) and the path fills with the module colour.
  useEffect(() => {
    if (!anim) {
      setPos({ arc: slotArcs[activeSlot], hop: 0 })
      return
    }
    const a = slotOfReto(anim.from)
    const b = slotOfReto(anim.to)
    const HOP = 520
    const total = (b - a) * HOP
    const start = performance.now() + 600
    let raf = 0
    const tick = (now: number) => {
      const el = Math.max(0, Math.min(total, now - start))
      const seg = Math.min(b - a - 1, Math.floor(el / HOP))
      const t = (el - seg * HOP) / HOP
      const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
      const arc = slotArcs[a + seg] + (slotArcs[a + seg + 1] - slotArcs[a + seg]) * e
      setPos({ arc, hop: Math.sin(Math.PI * t) * 20 })
      if (el < total) raf = requestAnimationFrame(tick)
      else dispatch({ type: 'MAP_ANIM_DONE' })
    }
    setPos({ arc: slotArcs[a], hop: 0 })
    raf = requestAnimationFrame(tick)
    const sc = window.setTimeout(() => scrollToArc(slotArcs[b], true), 700)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(sc)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anim?.key])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 1900)
    return () => window.clearTimeout(t)
  }, [toast])

  const tap = (n: number) => {
    if (n > active && !finished) {
      setShake(n)
      setToast({ key: Date.now(), text: 'Primero juega el reto anterior', icon: 'lock' })
      window.setTimeout(() => setShake(null), 560)
      return
    }
    dispatch({ type: 'OPEN_RETO', casilla: n })
  }

  const m = moduleOf(active)
  const doneInModule = Math.max(0, Math.min(m.challenges.length, s.done - m.first + 1))
  const fillArc = finished ? slotArcs[SLOTS.length - 1] : pos.arc
  const spikePt = px(geo.pointAt(pos.arc))
  const SPIKE = stage === 1 ? 54 : 70

  return (
    <Screen bg="#45C1FF">
      <div ref={scroller} onScroll={onScroll} className="no-scrollbar absolute inset-0 overflow-x-hidden overflow-y-auto" aria-label="Mapa de niveles">
        <div style={{ width: '100%', height: TOTAL_MAP_H * scale, position: 'relative', overflow: 'hidden', background: 'linear-gradient(to bottom, #45C1FF 0%, #45C1FF 80%, #FFFFFF 92%, #FFFFFF 100%)' }}>
          <div
            ref={layers}
            className="relative origin-top-left bg-[#45C1FF]"
            style={{
              width: 390,
              height: TOTAL_MAP_H,
              transform: `scale(${scale})`,
              '--py': '0px',
            } as CSSProperties}
          >
            <MapArt />
            {/* top of the map: Spike in his current stage, neutral, breathing */}
            <div className="pointer-events-none absolute z-[5]" style={{ left: 195 - 88, top: 132 }}>
              <Spike stage={stage} mood="calm" size={176} />
            </div>
            {/* path filled with the module colours */}
            <svg className="pointer-events-none absolute top-0 left-0" width={390} height={MAP_H} viewBox={`0 0 ${FRAME_W} ${FRAME_H}`} aria-hidden>
              {MODULE_IDS.map((id) => {
                const mod = MODULES[id]
                const a = slotArcs[slotOfModule(id)]
                const b = slotArcs[slotOfReto(mod.last)]
                const len = Math.max(0, Math.min(fillArc - a, b - a))
                return <path key={id} d={PATH_D} fill="none" stroke={mod.color} strokeWidth={86} strokeLinecap="round" strokeDasharray={`${len} ${geo.total}`} strokeDashoffset={-a} style={{ transition: anim ? undefined : 'stroke-dasharray 600ms ease-out' }} />
              })}
            </svg>

            {SLOTS.map((slot, i) => {
              const q = pts[i]
              if (slot.kind === 'module') {
                return (
                  <div key={`m${slot.id}`} className="absolute z-10" style={{ left: q.x - CX, top: q.y - CY }}>
                    <ModuleTile id={slot.id} state={moduleState(slot.id, s.done)} onTap={() => dispatch({ type: 'OPEN_MODULE', module: slot.id })} />
                  </div>
                )
              }
              const n = slot.n
              const st: TileState = n <= s.done ? 'done' : n === active ? 'active' : 'locked'
              return (
                <div key={n} className="absolute z-10" style={{ left: q.x - CX, top: q.y - CY }}>
                  <Tile n={n} state={st} m={moduleOf(n)} shaking={shake === n} onTap={() => tap(n)} />
                </div>
              )
            })}

            {/* Solid white background extending from the cloud base to the bottom edge */}
            <div
              className="pointer-events-none absolute inset-x-0 z-[1] bg-white"
              style={{
                top: 3650,
                height: TOTAL_MAP_H - 3650 + 600,
              }}
              aria-hidden
            />

            {!finished && (
              <div className="pointer-events-none absolute z-20" style={{ left: spikePt.x - SPIKE / 2, top: spikePt.y - CY + 16 - SPIKE - pos.hop }}>
                <div className={anim ? '' : 'egg-bob'}>
                  <Spike stage={stage} mood="calm" size={SPIKE} animate={false} className="drop-shadow-[0_6px_6px_rgba(0,0,0,.25)]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* top: current module chip, and the tutorials button */}
      <div className="pointer-events-none absolute right-3.5 left-3.5 sm:right-5 sm:left-5 z-30 flex items-start justify-between" style={{ top: 'calc(1.25rem + env(safe-area-inset-top, 0px))' }}>
        <div className="pointer-events-auto card-in flex h-14 items-center gap-2 rounded-full bg-white py-1 pr-4 pl-3 shadow-[0_6px_16px_rgba(0,0,0,.14)]" role="status">
          <ModuleBadge id={m.id} size={36} />
          <span className="font-display text-[18px] font-semibold whitespace-nowrap text-ink">{m.name} {doneInModule}/{m.challenges.length}</span>
        </div>
        <button
          type="button"
          aria-label="Tutoriales"
          onClick={() => dispatch({ type: 'OVERLAY', overlay: 'tutorials' })}
          className="btn3d pointer-events-auto grid size-14 place-items-center rounded-full font-display text-[32px] font-bold"
          style={{ '--bg': '#FF8001', '--edge': '#FF4F1A', '--fg': '#fff', '--ts': '0 2px 0 rgb(255 79 26 / .4)', padding: 0, minHeight: 56, fontWeight: 700 } as CSSProperties}
        >
          ?
        </button>
      </div>

      {toast && (
        <div key={toast.key} className="toast pointer-events-none absolute bottom-[124px] left-1/2 z-40 flex items-center gap-2 rounded-full bg-white py-2.5 pr-5 pl-3 font-sans text-[15px] font-bold whitespace-nowrap text-ink shadow-[0_8px_20px_rgba(0,0,0,.18)]" role="status">
          <Badge icon={toast.icon} color="#9AA5B1" accent="#65739F" size={30} />
          {toast.text}
        </div>
      )}
      <NavBar />
    </Screen>
  )
}
