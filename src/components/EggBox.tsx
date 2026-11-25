import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { OPTION_META } from '../game/data'
import { boxControls, isPaused, lit } from '../game/engine'
import { useGame } from '../game/context'
import { Icon, Shape } from './glyphs'
import { Avatar } from './ui'
import { egg, EGG_MODE, virtualEgg, type EggButton } from '../egg'
import { useConnectFlow } from '../screens/Entry'

const N = 12
const OFF = '#C9D0DC'
const mix = (a: string, b: string, t: number) => {
  const pa = a.match(/\w\w/g)!.map((h) => parseInt(h, 16))
  const pb = b.match(/\w\w/g)!.map((h) => parseInt(h, 16))
  return `rgb(${pa.map((v, k) => Math.round(v + (pb[k] - v) * t)).join(',')})`
}
/** Frames of the simulated ring at ~30 fps (the same effects the real firmware plays). */
function useRing() {
  const [, tick] = useState(0)
  useEffect(() => virtualEgg.subscribe(() => tick((n) => n + 1)), [])
  return virtualEgg.cssFrame()
}

/** The physical egg (Arduino) as a virtual box: LED ring, 3 colour buttons and «?». */
export function EggBox() {
  const { s } = useGame()
  const flow = useConnectFlow()
  const ring = useRing()
  const controls = boxControls(s)
  const count = lit(s.heat)
  const waiting = !s.connected
  const master = s.screen === 'master' || s.screen === 'almost'
  const hatch = s.screen === 'hatch'
  const paused = isPaused(s)
  const [down, setDown] = useState<number | null>(null)

  // A finger on a button: the egg sends B:x (the app only reacts when that button is live) and flashes locally.
  const press = (button: EggButton, k: number) => {
    setDown(k)
    window.setTimeout(() => setDown(null), 220)
    virtualEgg.press(button)
  }
  const status = waiting
    ? { icon: <Icon name="bluetoothOff" size={16} />, text: 'Sin conexión' }
    : master
      ? { icon: <Icon name="cap" size={16} />, text: 'Modo maestro' }
      : hatch
        ? { icon: <Icon name="sparkle" size={16} />, text: '¡Eclosión!' }
        : { icon: <Icon name="flame" size={16} />, text: paused ? 'En pausa' : 'Calor del huevo' }
  if (EGG_MODE === 'ble') {
    return (
      <section className="flex h-full flex-col items-center justify-center gap-4 rounded-[40px] bg-[#FDF6E4] p-8 text-center shadow-[0_24px_48px_rgba(74,90,140,.16)]">
        <Icon name={s.connected ? 'bluetooth' : 'bluetoothOff'} size={64} color={s.connected ? '#45C1FF' : '#9AA5B1'} />
        <h2 className="font-display text-[24px] leading-8 font-semibold">Huevo real por Bluetooth</h2>
        <p className="font-sans text-[16px] font-semibold text-ink2">{s.connected ? 'Conectado' : 'Sin conexión'}</p>
      </section>
    )
  }
  const owner = controls.owner
  const active = controls.colors || controls.help

  return (
    <section className="flex h-full flex-col rounded-[40px] bg-[#FDF6E4] p-6 shadow-[0_24px_48px_rgba(31,42,68,.16)]">
      <header className="flex items-start justify-between">
        <div>
          <div className="font-sans text-[14px] font-extrabold tracking-[.14em] text-ink2 uppercase">Objeto físico · Arduino</div>
          <h2 className="font-display text-[24px] leading-8 font-semibold">Caja virtual del huevo</h2>
        </div>
        <button type="button" onClick={() => (s.connected ? void egg.disconnect() : flow.start())} className={`flex min-h-11 items-center gap-2 rounded-full px-4 font-display text-[16px] font-semibold shadow-[0_4px_10px_rgba(0,0,0,.1)] ${s.connected ? 'bg-white' : 'bg-[#45C1FF] text-white'}`}>
          <span className={`size-2.5 rounded-full ${s.connected ? 'bg-[#73D83A]' : 'bg-white'}`} />
          {s.connected ? 'Conectada' : 'Conectar'}
        </button>
      </header>

      {/* LED ring under the dome: static heat, soft lilac pulse in Modo maestro, 3 pulses when hatching. */}
      <div className="relative mx-auto mt-3 grid h-[300px] w-[300px] place-items-center">
        <div className="absolute inset-8 rounded-full blur-3xl" style={{ background: ring.reduce((best, c) => (c.level > best.level ? c : best), ring[0]).css, opacity: Math.min(0.55, 0.1 + Math.max(...ring.map((c) => c.level)) * 0.45) }} />
        <svg viewBox="0 0 330 330" width="300">
          <defs>
            <radialGradient id="dome2" cx="38%" cy="30%" r="75%"><stop offset="0" stopColor="#fff" stopOpacity=".9" /><stop offset="1" stopColor="#fff" stopOpacity=".15" /></radialGradient>
            <filter id="glow2" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5" /></filter>
          </defs>
          <circle cx="165" cy="165" r="150" fill="#2A3350" />
          <circle cx="165" cy="165" r="98" fill="#1E2640" />
          {Array.from({ length: N }, (_, i) => {
            const a = (i / N) * Math.PI * 2 - Math.PI / 2
            const x = 165 + Math.cos(a) * 124
            const y = 165 + Math.sin(a) * 124
            const { css, level } = ring[i]
            const on = level > 0.03
            return (
              <g key={i}>
                {on && <circle cx={x} cy={y} r="19" fill={css} filter="url(#glow2)" opacity={Math.min(0.85, level)} />}
                <circle cx={x} cy={y} r="13" fill={on ? css : '#46517A'} opacity={on ? 1 : 0.9} />
              </g>
            )
          })}
          <path d="M165 38C222 38 248 128 248 172C248 230 212 266 165 266C118 266 82 230 82 172C82 128 108 38 165 38Z" fill="url(#dome2)" />
        </svg>
        {waiting && <span className="absolute bottom-9 flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 font-sans text-[14px] font-extrabold shadow-[0_4px_10px_rgba(0,0,0,.12)]"><Icon name="bluetoothOff" size={16} /> Huevo apagado</span>}
      </div>

      <div className="mx-auto mt-1 flex items-center gap-3">
        <span className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 font-sans text-[14px] font-extrabold shadow-[0_3px_8px_rgba(0,0,0,.08)]">{status.icon} {status.text}</span>
        <b className="rounded-full bg-ink px-4 py-1.5 font-sans text-[14px] text-white">{hatch ? 12 : count}/12</b>
      </div>

      {/* A single "Elegir" area: 3 colours + «?», always for whoever guesses. */}
      <div className="mt-6 rounded-[30px] bg-white/70 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar who={owner} size={40} />
            <div className="leading-tight">
              <div className="font-display text-[20px] font-semibold">Elegir</div>
              <div className="font-sans text-[14px] font-bold text-ink2">Botones de quien adivina: {owner === 'papa' ? 'padre' : 'niño'}</div>
            </div>
          </div>
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[14px] font-extrabold ${active ? 'bg-[#FFE44C]' : 'bg-ink/5 text-ink2'}`}>
            <span className={`size-2 rounded-full ${active ? 'animate-pulse bg-accent' : 'bg-ink/25'}`} />
            {active ? 'Activo' : 'En espera'}
          </span>
        </div>
        <div className="mt-5 flex items-start justify-center gap-5">
          {OPTION_META.map((o, k) => {
            const live = controls.colors && controls.colorIndexes.includes(k)
            return (
              <Physical key={o.key} label={o.label} live={live} down={down === k} onClick={() => press((['circle', 'triangle', 'square'] as const)[k], k)} style={{ background: o.color, boxShadow: `0 7px 0 ${mix(o.color.slice(1), '000000', 0.3)}` }}>
                <Shape kind={o.shape} size={34} color={o.ink} />
              </Physical>
            )
          })}
          <span className="mt-3 h-14 w-1 rounded-full bg-ink/10" />
          <Physical label="No entendí" live={controls.help} down={down === 9} onClick={() => press('help', 9)} style={{ background: '#FFFFFF', boxShadow: '0 7px 0 #C9D0DC' }}>
            <span className="font-display text-[42px] leading-none font-bold text-ink">?</span>
          </Physical>
        </div>
      </div>

      <p className="mt-3 truncate text-center font-mono text-[14px] font-bold text-ink2" aria-label="Mensajes Bluetooth">{virtualEgg.log.slice(-3).join('  ·  ') || 'BLE · sin mensajes'}</p>
      <div className="mt-auto flex flex-wrap justify-center gap-x-4 gap-y-1 pt-3 font-sans text-[14px] font-bold text-ink2">
        <span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-[#FF8001]" /> Calor: solo sube</span>
        <span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-[#E7B3FF]" /> Modo maestro</span>
        <span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-[#45C1FF]" /> Sin conexión</span>
        <span className="w-full text-center">Brillo máx. 100/255 · máx. 3 destellos por segundo · sin luces que giran</span>
      </div>
    </section>
  )
}

function Physical({ children, onClick, live, label, style, down }: { children: ReactNode; onClick: () => void; live: boolean; label: string; style?: CSSProperties; down: boolean }) {
  return (
    <div className="flex w-[76px] flex-col items-center gap-2.5">
      <button type="button" aria-label={label} aria-disabled={!live} onClick={onClick} className={`relative grid size-[76px] place-items-center rounded-full transition ${live ? '' : 'opacity-45'}`} style={{ transform: down ? 'translateY(5px)' : undefined, ...style }}>
        {live && <span className="btn-live absolute -inset-1.5 -z-10 rounded-full bg-[#FF8001] blur-md" />}
        {children}
      </button>
      <span className="text-center font-sans text-[14px] leading-tight font-bold text-ink2">{label}</span>
    </div>
  )
}

