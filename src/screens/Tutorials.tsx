import { useEffect, useRef, useState, type CSSProperties } from 'react'
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
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlayToggle = () => {
    if (videoRef.current && videoRef.current.src) {
      if (playing) {
        videoRef.current.pause()
        setPlaying(false)
      } else {
        videoRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(true))
      }
    } else {
      setPlaying((prev) => !prev)
    }
  }

  const next = () => dispatch({ type: 'TUTORIAL_KID_DONE' })

  return (
    <Screen bg="#FF8001" className="relative flex h-full w-full flex-col justify-between overflow-hidden select-none">
      {/* Decorative bottom clouds from Figma */}
      <CloudsOrange />

      {/* Top right forward arrow button only */}
      <div
        className="absolute right-5 z-30"
        style={{ top: 'calc(1.25rem + env(safe-area-inset-top, 0px))' }}
      >
        <button
          type="button"
          onClick={next}
          aria-label="Continuar"
          className="btn3d grid size-14 place-items-center rounded-full transition-transform active:scale-95 cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
          style={{ '--bg': '#fff', '--edge': '#FFD2A8', '--fg': '#FF8001', padding: 0, minHeight: 56 } as CSSProperties}
        >
          <Icon name="arrowRight" size={24} solid color="#FF8001" />
        </button>
      </div>

      {/* Main centered container */}
      <div
        className="relative z-10 flex h-full w-full flex-col justify-between overflow-y-auto px-5 no-scrollbar"
        style={{
          paddingTop: 'calc(4.75rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(1.75rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Centered white card with avatar */}
        <div className="my-auto mx-auto w-full max-w-[340px] pt-9">
          <div className="relative rounded-[36px] bg-white px-4 pt-16 pb-5 shadow-[0_16px_36px_rgba(0,0,0,0.14)] sm:px-5 sm:pt-[72px] sm:pb-6">
            {/* Top decorative avatar perched on top edge - clean white border, no shadows */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2">
              <div className="relative size-[76px] overflow-hidden rounded-full border-[6px] border-white bg-[#FF8001] flex items-center justify-center">
                <img
                  src="/people/hijo.svg"
                  alt="Niño"
                  draggable={false}
                  className="size-[88%] object-contain translate-y-1"
                />
              </div>
            </div>

            {/* Video tutorial area */}
            <div className="relative aspect-square w-full overflow-hidden rounded-[24px] bg-[#EAF1F8] shadow-inner">
              <video
                ref={videoRef}
                playsInline
                className={`size-full object-cover ${playing ? 'block' : 'hidden'}`}
                onEnded={() => setPlaying(false)}
              />
              <img
                src="/assets/110ea.png"
                alt="Tutorial de señas"
                draggable={false}
                className={`size-full object-cover ${playing ? 'hidden' : 'block'}`}
              />

              {/* Centered Play Button with same styling as circular arrow button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={handlePlayToggle}
                  aria-label={playing ? 'Pausar' : 'Reproducir'}
                  className="btn3d grid size-16 sm:size-[72px] place-items-center rounded-full transition-transform active:scale-95 cursor-pointer shadow-[0_6px_18px_rgba(0,0,0,0.22)]"
                  style={{ '--bg': '#fff', '--edge': '#FFD2A8', '--fg': '#FF8001', padding: 0 } as CSSProperties}
                >
                  <Icon
                    name={playing ? 'pause' : 'play'}
                    size={32}
                    solid
                    color="#FF8001"
                    className={playing ? '' : 'translate-x-0.5'}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom "Listo" button with exact Figma style: #ED7600 with #D23100 bottom shadow */}
        <div className="mx-auto w-full max-w-[280px] shrink-0 pt-4">
          <button
            type="button"
            onClick={next}
            className="flex h-[58px] sm:h-[62px] w-full items-center justify-center gap-3 rounded-full bg-[#ED7600] font-display text-[22px] font-bold text-white shadow-[inset_0px_-6px_0px_0px_#D23100] transition-all duration-150 active:translate-y-1 active:shadow-[inset_0px_-2px_0px_0px_#D23100] cursor-pointer"
          >
            <Icon name="check" size={24} solid color="#FFFFFF" />
            <span>Listo</span>
          </button>
        </div>
      </div>
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
      <div className="card absolute top-[238px] inset-x-5 mx-auto max-w-[350px] px-4 py-3">
        <ul>
          {ROWS.map((r) => (
            <li key={r.text} className="flex min-h-[60px] items-center gap-4 py-1.5">
              <span className="grid size-[48px] shrink-0 place-items-center rounded-full text-ink" style={{ background: r.tint, color: r.tint === '#FF8001' ? '#fff' : '#4A5A8C' }}>{r.icon}</span>
              <span className="font-sans text-[16px] leading-[22px] font-bold">{r.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute inset-x-5 mx-auto max-w-[350px]" style={{ bottom: 'calc(2.875rem + env(safe-area-inset-bottom, 0px))' }}><Btn icon="check" onClick={() => dispatch({ type: 'TUTORIAL_PARENT_DONE' })}>Listo</Btn></div>
    </Screen>
  )
}
