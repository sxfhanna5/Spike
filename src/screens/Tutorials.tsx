import { useEffect, useState, type CSSProperties } from 'react'
import { useGame } from '../game/context'
import { OPTION_META } from '../game/data'
import { CloudsBlue } from '../art/CloudsBlue'
import { CloudsOrange } from '../art/CloudsOrange'
import { Btn, Avatar, Dock, RoundBtn, Screen } from '../components/ui'
import { Icon, Shape } from '../components/glyphs'

function Pill({ icon, children, onClick, side }: { icon?: 'arrowLeft'; children: string; onClick: () => void; side: 'left' | 'right' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn3d absolute top-5 z-20 inline-flex min-h-14 items-center gap-2 rounded-full px-5 ${side === 'left' ? 'left-5' : 'right-5'}`}
      style={{ '--bg': '#fff', '--edge': '#D9DEE7', '--fg': '#4A5A8C', fontSize: 18 } as CSSProperties}
    >
      {icon && <Icon name={icon} size={22} color="#FF8001" />}
      {children}
    </button>
  )
}

/* ============================== S6 · Tutorial del niño (video only) ============================== */

export function TutorialKid() {
  const { dispatch } = useGame()
  const [playing, setPlaying] = useState(false)
  const [pos, setPos] = useState(0)
  // Placeholder playback so the controls feel real until the LSC video is inserted.
  useEffect(() => {
    if (!playing) return
    const t = window.setInterval(() => setPos((p) => (p >= 100 ? 100 : p + 1.25)), 100)
    return () => window.clearInterval(t)
  }, [playing])
  useEffect(() => {
    if (pos >= 100) setPlaying(false)
  }, [pos])
  const next = () => dispatch({ type: 'TUTORIAL_KID_DONE' })
  return (
    <Screen bg="#FF8001">
      <CloudsOrange />
      {/* the child's tutorial has no sentences: icon buttons only */}
      <RoundBtn icon="arrowLeft" label="Volver" size={56} onClick={() => dispatch({ type: 'GOTO', screen: 'map' })} className="absolute top-5 left-5 z-20" />
      <RoundBtn icon="chevronRight" label="Saltar" size={56} onClick={next} className="absolute top-5 right-5 z-20" />
      <div className="absolute top-[92px] left-1/2 h-[404px] w-[228px] -translate-x-1/2 overflow-hidden rounded-[28px] bg-[#4A5A8C] shadow-[0_16px_36px_rgba(0,0,0,.28)]" role="region" aria-label="Video del tutorial en LSC">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#3A4A73,#4A5A8C_70%)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-5">
          <button type="button" aria-label={playing ? 'Pausar' : 'Reproducir'} onClick={() => { if (pos >= 100) setPos(0); setPlaying(!playing) }} className="btn3d grid size-[92px] place-items-center rounded-full" style={{ '--bg': '#fff', '--edge': '#FFD2A8', '--fg': '#FF8001', padding: 0, minHeight: 92 } as CSSProperties}>
            <Icon name={playing ? 'pause' : 'play'} size={44} />
          </button>
          <Icon name="hand" size={44} color="#fff" />
        </div>
        <div className="absolute right-5 bottom-5 left-5 h-2 overflow-hidden rounded-full bg-white/25"><div className="h-full rounded-full bg-[#FFE44C] transition-[width] duration-100" style={{ width: `${pos}%` }} /></div>
      </div>
      <div className="absolute top-[520px] left-0 flex w-full items-center justify-center gap-5">
        <button type="button" aria-label={playing ? 'Pausar' : 'Reproducir'} onClick={() => { if (pos >= 100) setPos(0); setPlaying(!playing) }} className="btn3d grid size-16 place-items-center rounded-full" style={{ '--bg': '#fff', '--edge': '#FFD2A8', '--fg': '#FF8001', padding: 0, minHeight: 64 } as CSSProperties}>
          <Icon name={playing ? 'pause' : 'play'} size={30} />
        </button>
        <button type="button" aria-label="Repetir" onClick={() => { setPos(0); setPlaying(true) }} className="btn3d grid size-16 place-items-center rounded-full" style={{ '--bg': '#fff', '--edge': '#FFD2A8', '--fg': '#FF8001', padding: 0, minHeight: 64 } as CSSProperties}>
          <Icon name="repeat" size={30} />
        </button>
      </div>
      <div className="absolute right-5 bottom-[38px] left-5"><Dock><Btn icon="check" onClick={next}>Listo</Btn></Dock></div>
    </Screen>
  )
}

/* ============================== S7 · Tutorial del padre ============================== */

const ROWS: { icon: React.ReactNode; text: string; tint: string }[] = [
  { icon: <Icon name="hand" size={30} />, text: 'Tú haces la seña', tint: '#45C1FF' },
  { icon: <span className="flex gap-0.5">{OPTION_META.map((o) => <Shape key={o.key} kind={o.shape} size={16} color={o.ink} />)}</span>, text: 'Tu hijo adivina con un color', tint: '#FFE44C' },
  { icon: <span className="font-display text-[30px] leading-none font-bold">?</span>, text: 'Si no te entiende, él te enseña', tint: '#E7B3FF' },
  { icon: <Icon name="refresh" size={28} />, text: 'Luego cambian: él señala y tú adivinas', tint: '#FFB45E' },
  { icon: <Icon name="eyeOff" size={28} />, text: 'Cuando señalas, él no mira', tint: '#9AD8FF' },
  { icon: <Icon name="flame" size={28} />, text: 'El calor del huevo solo sube', tint: '#FF8001' },
]

export function TutorialParent() {
  const { s, dispatch } = useGame()
  const first = !s.tutorialDone
  return (
    <Screen bg="#45C1FF">
      <CloudsBlue />
      <Pill icon="arrowLeft" side="left" onClick={() => dispatch(first ? { type: 'GOTO', screen: 'tutorialKid' } : { type: 'GOTO', screen: 'map' })}>Volver</Pill>
      <Pill side="right" onClick={() => dispatch({ type: 'TUTORIAL_PARENT_DONE' })}>Saltar</Pill>
      <div className="absolute top-[96px] left-0 flex w-full flex-col items-center">
        <Avatar who="papa" size={84} halo />
        <h1 className="mt-4 font-display text-[28px] leading-8 font-semibold text-white drop-shadow-[0_2px_0_rgba(0,123,185,.5)]">Tutorial del padre</h1>
      </div>
      <div className="card absolute top-[238px] left-5 w-[350px] px-4 py-3">
        <ul>
          {ROWS.map((r) => (
            <li key={r.text} className="flex min-h-[60px] items-center gap-4 py-1.5">
              <span className="grid size-[48px] shrink-0 place-items-center rounded-full text-ink" style={{ background: r.tint, color: r.tint === '#FF8001' ? '#fff' : '#4A5A8C' }}>{r.icon}</span>
              <span className="font-sans text-[16px] leading-[22px] font-bold">{r.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute right-5 bottom-[46px] left-5"><Btn icon="check" onClick={() => dispatch({ type: 'TUTORIAL_PARENT_DONE' })}>Listo</Btn></div>
    </Screen>
  )
}
