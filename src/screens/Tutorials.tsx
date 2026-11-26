import { useRef, useState, type CSSProperties } from 'react'
import { useGame } from '../game/context'
import { OPTION_META } from '../game/data'
import { CloudsBlue } from '../art/CloudsBlue'
import { CloudsOrange } from '../art/CloudsOrange'
import { Screen } from '../components/ui'
import { Icon, Shape } from '../components/glyphs'

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

  const finish = () => {
    dispatch({ type: 'GOTO', screen: 'map' })
    dispatch({ type: 'OVERLAY', overlay: 'tutorials' })
  }

  return (
    <Screen bg="#FF8001" className="relative flex h-full w-full flex-col justify-between overflow-hidden select-none">
      {/* Decorative bottom clouds from Figma */}
      <CloudsOrange />

      {/* Main centered container */}
      <div
        className="relative z-10 flex h-full w-full flex-col justify-between overflow-y-auto px-5 no-scrollbar"
        style={{
          paddingTop: 'calc(2.5rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(3.25rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Centered white card with avatar */}
        <div className="my-auto mx-auto w-full max-w-[340px] pt-6 sm:pt-7">
          <div className="relative rounded-[36px] bg-white px-4 pt-14 pb-4 shadow-[0_16px_36px_rgba(0,0,0,0.14)] sm:px-5 sm:pt-16 sm:pb-5">
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

        {/* Bottom "Listo" button with exact Figma style */}
        <div className="mx-auto w-full max-w-[280px] shrink-0 pt-3">
          <button
            type="button"
            onClick={finish}
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
  {
    icon: <Icon name="hand" size={24} solid color="#FFFFFF" />,
    text: 'Tú haces la seña',
    tint: '#45C1FF',
  },
  {
    icon: (
      <div className="flex items-center justify-center gap-1">
        {OPTION_META.map((o) => (
          <Shape key={o.key} kind={o.shape} size={10} color={o.ink} />
        ))}
      </div>
    ),
    text: 'Tu hijo adivina con un color',
    tint: '#FFE44C',
  },
  {
    icon: <span className="font-display text-[26px] leading-none font-bold text-white select-none">?</span>,
    text: 'Si no te entiende, él te enseña',
    tint: '#E7B3FF',
  },
  {
    icon: <Icon name="refresh" size={22} solid color="#FFFFFF" />,
    text: 'Luego cambian: él señala y tú adivinas',
    tint: '#FFB45E',
  },
  {
    icon: (
      <svg
        width={22}
        height={22}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
        aria-hidden
      >
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        <path d="M3 3l18 18" strokeWidth={2.6} />
      </svg>
    ),
    text: 'Cuando señalas, él no mira',
    tint: '#9AD8FF',
  },
  {
    icon: <Icon name="flame" size={22} solid color="#FFFFFF" />,
    text: 'El calor del huevo solo sube',
    tint: '#FF8001',
  },
]

export function TutorialParent() {
  const { dispatch } = useGame()

  const finish = () => {
    dispatch({ type: 'GOTO', screen: 'map' })
    dispatch({ type: 'OVERLAY', overlay: 'tutorials' })
  }

  return (
    <Screen bg="#45C1FF" className="relative flex h-full w-full flex-col justify-between overflow-hidden select-none">
      {/* Decorative bottom clouds from Figma */}
      <CloudsBlue />

      {/* Main centered container */}
      <div
        className="relative z-10 flex h-full w-full flex-col justify-between overflow-y-auto px-5 no-scrollbar"
        style={{
          paddingTop: 'calc(4.5rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(3.25rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Centered white card with avatar */}
        <div className="my-auto mx-auto w-full max-w-[340px] pt-8">
          <div className="relative rounded-[36px] bg-white px-5 pt-12 pb-7 shadow-[0_16px_36px_rgba(0,0,0,0.14)] sm:pt-14 sm:pb-8">
            {/* Top decorative avatar perched on top edge - clean white border, no shadows */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2">
              <div className="relative size-[76px] overflow-hidden rounded-full border-[6px] border-white bg-[#45C1FF] flex items-end justify-center">
                <img
                  src="/assets/b457d.png"
                  alt="Padres"
                  draggable={false}
                  className="max-w-none w-[124%] translate-y-[2px] object-contain"
                />
              </div>
            </div>

            {/* Instruction rows */}
            <ul className="flex flex-col gap-2.5 sm:gap-3">
              {ROWS.map((r) => (
                <li key={r.text} className="flex items-center gap-3.5">
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-full"
                    style={{ background: r.tint }}
                  >
                    {r.icon}
                  </span>
                  <span className="font-sans text-[15px] sm:text-[16px] leading-[20px] sm:leading-[22px] font-bold text-[#4A5A8C]">
                    {r.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom "Listo" button with exact Figma style - elevated higher over clouds */}
        <div className="mx-auto w-full max-w-[280px] shrink-0 pt-3">
          <button
            type="button"
            onClick={finish}
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
