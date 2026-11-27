import { useState, useRef } from 'react'
import { useGame } from '../game/context'
import { COLOR_HEX, MODULES, OPTION_META, ROUND_INFO, ROLE_COLOR, type Challenge, type Person, type ModuleId } from '../game/data'
import { boxControls, countTotalLearned, current, interpreter, signer, stageOf, teacherOf } from '../game/engine'
import { CloudsBlue } from '../art/CloudsBlue'
import { CloudsOrange } from '../art/CloudsOrange'
import { GoodScene } from '../art/GoodScene'
import { LevelRays } from '../art/LevelRays'
import { SkyHills } from '../art/SkyHills'
import { Avatar, Dock, GameHeader, InstructionStrip, LearnedWordBadge, ModuleBadge, PrimaryActionButton, RoundChip, Screen, Spike, XButton, usePausedTimeout } from '../components/ui'
import { Icon, Pictogram, Shape, hasPictogram } from '../components/glyphs'

/* ============================== shared pieces ============================== */

/** Font size that keeps the learning content readable and inside its card. */
const fit = (text: string, big: number) => (text.length <= 1 ? big : text.length <= 5 ? big * 0.72 : text.length <= 8 ? big * 0.58 : text.length <= 12 ? big * 0.46 : big * 0.34)

/** What the child (or the parent) has to recognise: letter, colour, number or word with its picture. */
export function ContentBig({ c, size = 150 }: { c: Challenge; size?: number }) {
  if (c.kind === 'color') {
    return (
      <div className="flex flex-col items-center gap-3">
        <span className="size-[132px] rounded-full shadow-[0_10px_22px_rgba(0,0,0,.16)]" style={{ background: COLOR_HEX[c.content] }} />
        <span className="font-sans text-[44px] leading-[48px] font-black text-ink">{c.content}</span>
      </div>
    )
  }
  if (c.kind === 'number') {
    return (
      <div className="flex flex-col items-center">
        <span className="font-sans leading-none font-black text-ink" style={{ fontSize: 132 }}>{c.digit}</span>
        <span className="font-sans text-[36px] leading-[44px] font-black text-ink2">{c.content}</span>
      </div>
    )
  }
  if (c.kind === 'word' || c.kind === 'write') {
    return (
      <div className="flex flex-col items-center gap-2">
        {hasPictogram(c.content) && <Pictogram content={c.content} size={112} />}
        <span className="font-sans leading-[1.1] font-black text-ink" style={{ fontSize: fit(c.content, 56) }}>{c.content}</span>
      </div>
    )
  }
  return <span className="font-sans leading-none font-black text-ink" style={{ fontSize: size }}>{c.content}</span>
}

/** ● ▲ ■ badge, identical to the buttons of the box. */
export function OptionBadge({ index, size = 56 }: { index: number; size?: number }) {
  const o = OPTION_META[index]
  return (
    <span className="grid shrink-0 place-items-center rounded-full" style={{ width: size, height: size, background: o.color }} aria-label={o.label}>
      <Shape kind={o.shape} size={size * 0.46} color={o.ink} />
    </span>
  )
}

export function OptionCard({ index, c, selected, dim, onClick, compact }: { index: number; c: Challenge; selected?: boolean; dim?: boolean; onClick?: () => void; compact?: boolean }) {
  const label = c.options[index]
  const o = OPTION_META[index]
  const h = compact ? 72 : 78
  const hex = COLOR_HEX[label]
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${o.label}: ${label}`}
      className={`flex w-full items-center gap-4 sm:gap-5 rounded-full pr-6 pl-3 sm:pl-3.5 text-left shadow-[0_4px_16px_rgba(74,90,140,0.12)] border border-[#E8ECF4]/60 transition-all duration-300 ease-[cubic-bezier(.3,1.5,.5,1)] active:scale-[0.98] ${selected ? 'scale-[1.03] shadow-[0_12px_24px_rgba(0,0,0,.18)]' : ''} ${dim ? 'opacity-40' : ''}`}
      style={{ height: h, background: selected ? o.color : '#fff' }}
    >
      <OptionBadge index={index} size={compact ? 50 : 56} />
      <span className="flex-1 font-sans leading-none font-extrabold text-[#4A5A8C]" style={{ fontSize: fit(label, compact ? 40 : 46), color: selected ? '#4A5A8C' : undefined }}>{label}</span>
      {c.kind === 'color' && hex && <span className="size-9 rounded-full" style={{ background: hex }} aria-hidden />}
      {c.kind === 'number' && <span className="font-sans text-[30px] font-black text-[#4A5A8C]">{NUMBER_DIGIT[label]}</span>}
      {c.kind === 'word' && hasPictogram(label) && <Pictogram content={label} size={46} />}
    </button>
  )
}
const NUMBER_DIGIT: Record<string, number> = { UNO: 1, DOS: 2, TRES: 3, CUATRO: 4, CINCO: 5, SEIS: 6, SIETE: 7, OCHO: 8, NUEVE: 9, DIEZ: 10 }

/** The «No entendí» capsule button, unified across child and father turns. */
export function HelpButton({ className = '' }: { className?: string }) {
  const { s, dispatch } = useGame()
  const live = boxControls(s).help
  return (
    <button
      type="button"
      disabled={!live}
      onClick={() => dispatch({ type: 'HELP' })}
      aria-label="No entendí"
      className={`mx-auto inline-flex h-[54px] sm:h-[58px] items-center gap-3 rounded-full bg-white pl-2 pr-6 shadow-[0_4px_16px_rgba(74,90,140,0.14)] border border-[#E8ECF4] transition-all active:scale-[0.98] cursor-pointer select-none ${live ? '' : 'opacity-50'} ${className}`}
    >
      <span className="grid size-10 sm:size-11 place-items-center rounded-full bg-[#65739F] font-display text-[26px] sm:text-[28px] leading-none font-bold text-white shadow-[0_2px_0_#4A5A8C]">
        ?
      </span>
      <span className="font-sans text-[17px] sm:text-[18px] font-bold text-[#4A5A8C]">
        No entendí
      </span>
    </button>
  )
}

function Thinking() {
  return (
    <div className="flex h-[60px] items-center justify-center gap-2" aria-live="polite">
      {[0, 1, 2].map((k) => <span key={k} className="dot-bounce size-3.5 rounded-full bg-white" style={{ animationDelay: `${k * 140}ms` }} />)}
    </div>
  )
}

/** Listo button: uses the canonical PrimaryActionButton shared across the app. */
function ListoBtn({ onClick }: { onClick: () => void }) {
  return <PrimaryActionButton label="Listo" icon="check" onClick={onClick} />
}

/* ============================== intro cards (level · turn · maestro) ============================== */

export function IntroCard() {
  const { s, dispatch } = useGame()
  const intro = s.intro!
  const done = () => dispatch({ type: 'INTRO_DONE' })
  const isFrozen = typeof window !== 'undefined' && window.location.search.includes('freeze=true')
  usePausedTimeout(done, isFrozen ? 999999 : (intro.kind === 'level' ? 2000 : 1800), true, [intro.kind, s.idx, intro.who, s.teacherPhase, s.teacherLoops, s.screen])
  return (
    <div role="button" tabIndex={0} aria-label="Toca para saltar" onClick={done} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && done()} className="screen-in absolute inset-0 z-50 cursor-pointer outline-none">
      {intro.kind === 'level' ? <LevelCard /> : <TurnCard />}
    </div>
  )
}

function LevelCoverIcon({ id }: { id: ModuleId }) {
  if (id === 1) {
    return <span className="font-display font-black text-[96px] sm:text-[112px] leading-none text-white tracking-tight">Aa</span>
  }
  if (id === 2) {
    return (
      <span className="grid place-items-center py-1">
        <Icon name="drop" size={90} color="#FFFFFF" solid />
      </span>
    )
  }
  if (id === 3) {
    return <span className="font-display font-black text-[96px] sm:text-[112px] leading-none text-white tracking-tight">1</span>
  }
  if (id === 4) {
    return (
      <span className="grid place-items-center py-1">
        <svg width="88" height="88" viewBox="0 0 24 24" fill="white" aria-hidden>
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2z" />
        </svg>
      </span>
    )
  }
  if (id === 5) {
    return (
      <span className="grid place-items-center py-1">
        <Icon name="pencil" size={84} color="#FFFFFF" solid />
      </span>
    )
  }
  return null
}

function LevelCard() {
  const { s } = useGame()
  const m = MODULES[s.level]

  return (
    <div
      className="absolute inset-0 overflow-hidden flex flex-col justify-between items-center px-5 select-none pt-[calc(2.5rem+env(safe-area-inset-top,0px))] pb-8 sm:pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pb-10"
      style={{ backgroundColor: m.color }}
    >
      {/* Background light rays */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden>
        <img
          src="/assets/rays.png"
          alt=""
          draggable={false}
          className="size-[1329px] max-w-none object-cover opacity-60 mix-blend-screen pointer-events-none"
        />
      </div>

      {/* Top Header: Icon, Nivel X, Title */}
      <div className="relative z-10 flex flex-col items-center text-center mt-1 sm:mt-3">
        <LevelCoverIcon id={m.id} />
        <span className="font-sans text-[18px] sm:text-[21px] font-medium text-white/75 mt-2">
          Nivel {m.id}
        </span>
        <h1 className="font-display text-[34px] sm:text-[40px] font-bold text-white leading-tight mt-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
          {m.title}
        </h1>
      </div>

      {/* Center Illustration: Big Egg for Level 1, Spike for Levels 2-5 */}
      <div className="relative z-10 my-auto flex flex-col items-center">
        {m.id === 1 ? (
          <div className="relative flex flex-col items-center">
            {/* Sombra ovalada debajo del huevo */}
            <div
              className="absolute -bottom-2 w-[200px] sm:w-[230px] h-[32px] rounded-[50%] bg-[#C590DE] blur-[1px] opacity-90 z-0 pointer-events-none"
              aria-hidden
            />
            {/* Huevo en primer plano, completamente por encima de la sombra */}
            <img
              src="/assets/737b7.svg"
              alt="Huevo de Spike"
              draggable={false}
              className="relative z-10 w-[270px] sm:w-[300px] max-h-[38vh] object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.18)]"
            />
          </div>
        ) : (
          <div className="relative flex flex-col items-center">
            <div
              className="absolute -bottom-2 w-[190px] sm:w-[220px] h-[28px] rounded-[50%] bg-black/20 blur-[3px] z-0 pointer-events-none"
              aria-hidden
            />
            <div className="relative z-10">
              <Spike
                stage={m.stage}
                mood="happy"
                size={270}
                className="max-h-[38vh] drop-shadow-[0_16px_32px_rgba(0,0,0,0.2)]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Capsule: "{m.challenges.length} retos donde padre e hijo se turnan" */}
      <div className="relative z-10 mb-2 sm:mb-4 w-full max-w-[360px] px-2">
        <div className="rounded-full bg-white py-3.5 px-6 shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center justify-center text-center">
          <span className="font-display text-[16px] sm:text-[18px] font-bold whitespace-nowrap" style={{ color: m.accent }}>
            {m.challenges.length} retos donde padre e hijo se turnan
          </span>
        </div>
      </div>
    </div>
  )
}

function TurnCard() {
  const { s } = useGame()
  const intro = s.intro!
  const c = current(s)
  const m = MODULES[s.level]
  const teacher = intro.kind === 'teacher'
  const who = teacher ? teacherOf(s) : intro.who
  const signing = signer(c.round) === who && (s.screen === 'sign' || (s.screen === 'write' && s.write.stage === 'sign'))
  const role = signing ? 'sign' : s.screen === 'write' ? 'write' : 'guess'
  const kid = who === 'nino'
  const name = who === 'papa' ? 'padre' : 'niño'
  const roundInfo = ROUND_INFO[c.round]
  const doneInModule = Math.max(1, Math.min(m.challenges.length, s.casilla - m.first + 1))
  const handColor = roundInfo.signer === 'papa' ? '#45C1FF' : '#FF8001'

  const cardBg = teacher ? '#E7B3FF' : kid ? '#FF8001' : '#45C1FF'
  const title = teacher ? `Maestro ${name}` : `Turno del ${name}`
  const subtitle = teacher
    ? 'El que sabe, enseña'
    : role === 'sign'
    ? (who === 'papa' ? 'Haz la seña frente a tu hijo' : 'Haz la seña frente a papá')
    : (who === 'nino' ? 'Adivina la seña de papá' : 'Adivina la seña de tu hijo')
  const subIcon = teacher ? 'cap' : role === 'sign' ? 'hand' : 'eye'

  return (
    <div className="absolute inset-0 bg-white overflow-hidden flex flex-col items-center justify-between px-4 select-none pt-[calc(2rem+env(safe-area-inset-top,0px))] pb-6 sm:pt-[calc(2.75rem+env(safe-area-inset-top,0px))] sm:pb-8">
      {/* Top Section: Level 3D disc badge + Segmented Progress Bar */}
      <div className="flex flex-col items-center w-full">
        <ModuleBadge id={m.id} size={50} />
        <div className="mt-2.5 flex w-full max-w-[280px] sm:max-w-[320px] items-center justify-center px-2">
          <div className="flex flex-1 gap-1.5 justify-center" aria-hidden>
            {Array.from({ length: m.challenges.length }).map((_, i) => {
              const isDoneOrCurrent = i < doneInModule
              if (m.id === 2) {
                return (
                  <span
                    key={i}
                    className="h-[6px] sm:h-[7px] flex-1 max-w-[32px] overflow-hidden rounded-full transition-colors duration-300"
                    style={{ background: isDoneOrCurrent ? '#FF4F1A' : '#F9F9F9' }}
                  />
                )
              }
              if (m.id === 3) {
                return (
                  <span
                    key={i}
                    className="h-[6px] sm:h-[7px] flex-1 max-w-[32px] overflow-hidden rounded-full transition-colors duration-300"
                    style={{ background: isDoneOrCurrent ? '#45C1FF' : '#F9F9F9' }}
                  />
                )
              }
              return (
                <span
                  key={i}
                  className="h-[6px] sm:h-[7px] flex-1 max-w-[32px] overflow-hidden rounded-full bg-[#E6EAF5]"
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
      </div>

      {/* Center container holding Card and below-card prompt */}
      <div className="my-auto flex flex-col items-center w-full max-w-[350px] sm:max-w-[364px]">
        {/* Main Card */}
        <div
          className="w-full h-[390px] sm:h-[430px] rounded-[32px] sm:rounded-[36px] flex flex-col items-center justify-between py-5 sm:py-6 px-3 sm:px-4 shadow-[0_14px_36px_rgba(0,0,0,0.12)]"
          style={{ backgroundColor: cardBg }}
        >
          {/* Card Header: Title & Subtitle */}
          <div className="flex flex-col items-center text-center">
            <h1 className="font-display text-[28px] sm:text-[34px] font-bold text-white leading-tight">
              {title}
            </h1>
            <p className="mt-1 flex items-center justify-center gap-2 text-white/95 text-[15px] sm:text-[17px] font-medium">
              <Icon name={subIcon} size={20} color="#FFFFFF" solid />
              <span>{subtitle}</span>
            </p>
          </div>

          {/* Central Illustration Circle */}
          <div
            className="my-2 sm:my-3 size-[160px] sm:size-[190px] rounded-full border-[7px] sm:border-[8px] border-white relative overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.1)] shrink-0"
            style={{ backgroundColor: cardBg }}
          >
            {who === 'papa' ? (
              <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
                <img
                  src="/people/padre.png"
                  alt="Padres"
                  draggable={false}
                  className="w-[124%] max-w-none translate-y-[2%] select-none pointer-events-none"
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
                <img
                  src="/assets/dac2e.svg"
                  alt="Niño"
                  draggable={false}
                  className="w-[84%] max-w-none translate-y-[1%] select-none pointer-events-none"
                />
              </div>
            )}
          </div>

          {/* Bottom Canonical Instruction Strip */}
          <InstructionStrip round={c.round} className="mx-auto" />
        </div>

        {/* Prompt right below card */}
        <div className="mt-2.5 sm:mt-3 flex items-center justify-center gap-2 text-[#71717A] text-[15px] sm:text-[16px] font-medium select-none">
          <span>{who === 'papa' ? 'Gira el celular hacia tu padre' : 'Gira el celular hacia el niño'}</span>
          <Icon name="arrowRight" size={18} color="#71717A" solid />
        </div>
      </div>
    </div>
  )
}

/* ============================== signs / unified challenge screen ============================== */

function ChallengeScreen({ who }: { who: 'papa' | 'nino' }) {
  const { s, dispatch } = useGame()
  const c = current(s)
  const isPapa = who === 'papa'
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

  const instruction = isPapa ? 'Haz la seña frente a tu hijo' : 'Haz la seña frente a papá'

  return (
    <Screen bg={isPapa ? '#45C1FF' : '#FF8001'} className="relative flex h-full w-full flex-col justify-between overflow-hidden select-none">
      {isPapa ? <CloudsBlue /> : <CloudsOrange />}
      <GameHeader />

      {/* Main card & instruction centered vertically */}
      <div className="my-auto mx-auto w-full max-w-[340px] sm:max-w-[354px] px-4 pt-7 sm:pt-9 z-10 flex flex-col items-center">
        {/* Centered white card */}
        <div className="relative w-full rounded-[36px] bg-white px-4 pt-12 pb-5 sm:px-5 sm:pt-14 sm:pb-6 shadow-[0_16px_36px_rgba(0,0,0,0.14)] flex flex-col items-center">
          {/* Top perched Avatar with white border */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2">
            <div className={`relative size-[76px] overflow-hidden rounded-full border-[6px] border-white flex items-end justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] ${isPapa ? 'bg-[#45C1FF]' : 'bg-[#FF8001]'}`}>
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
            </div>
          </div>

          {/* Main Card Body:
              - If kid's turn and color: only large color circle.
              - If kid's turn and number: only large number.
              - In ALL father turns (and kid letters): video player + answer text!
          */}
          {who === 'nino' && c.kind === 'color' ? (
            <div className="flex flex-1 w-full items-center justify-center py-7 sm:py-9 min-h-[220px] sm:min-h-[250px]">
              <span
                className="size-[150px] sm:size-[170px] rounded-full shadow-[0_12px_28px_rgba(0,0,0,0.16)] block shrink-0"
                style={{ backgroundColor: COLOR_HEX[c.content] }}
                aria-label={`Color ${c.content}`}
              />
            </div>
          ) : who === 'nino' && c.kind === 'number' ? (
            <div className="flex flex-1 w-full items-center justify-center py-6 sm:py-8 min-h-[220px] sm:min-h-[250px]">
              <span
                className="font-sans leading-none font-black text-[#4A5A8C] select-none text-[120px] sm:text-[136px]"
                aria-label={`Número ${c.digit ?? c.content}`}
              >
                {c.digit ?? c.content}
              </span>
            </div>
          ) : (
            <>
              {/* Media / Video container */}
              <div className="relative aspect-[4/3] sm:aspect-[1.3] w-full overflow-hidden rounded-[22px] sm:rounded-[24px] bg-[#EAF1F8] shadow-inner">
                <video
                  ref={videoRef}
                  playsInline
                  className={`size-full object-cover ${playing ? 'block' : 'hidden'}`}
                  onEnded={() => setPlaying(false)}
                />
                <img
                  src="/assets/110ea.png"
                  alt="Seña LSC"
                  draggable={false}
                  className={`size-full object-cover ${playing ? 'hidden' : 'block'}`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handlePlayToggle}
                    aria-label={playing ? 'Pausar' : 'Reproducir'}
                    className="btn3d grid size-14 sm:size-16 place-items-center rounded-full transition-transform active:scale-95 cursor-pointer shadow-[0_6px_18px_rgba(0,0,0,0.22)]"
                    style={{ '--bg': '#fff', '--edge': '#FFD2A8', '--fg': '#FF8001', padding: 0 } as React.CSSProperties}
                  >
                    <Icon
                      name={playing ? 'pause' : 'play'}
                      size={28}
                      solid
                      color="#FF8001"
                      className={playing ? '' : 'translate-x-0.5'}
                    />
                  </button>
                </div>
              </div>

              {/* Bottom badge / purple rectangle with letter/content (Figma 668:3561) */}
              <div className="mt-3.5 sm:mt-4 w-full h-[52px] sm:h-[58px] rounded-[26px] bg-[#E7B3FF] flex items-center justify-center shadow-[inset_0_-2px_0_rgba(191,94,235,0.25)]">
                <span
                  className="font-sans font-black text-[#BF5EEB] leading-none"
                  style={{ fontSize: fit(c.content, 34) }}
                >
                  {c.content}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Instruction centered right below the card */}
        <div className="mt-4 sm:mt-5 flex items-center justify-center gap-2.5 text-white text-[17px] sm:text-[19px] font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)] select-none">
          <Icon name="hand" size={24} color="#FFFFFF" solid />
          <span>{instruction}</span>
        </div>
      </div>

      {/* Bottom Listo button */}
      <div className="w-full flex items-center justify-center pb-5 sm:pb-7 z-20 px-4">
        <ListoBtn onClick={() => dispatch({ type: 'SIGN_DONE' })} />
      </div>
    </Screen>
  )
}

export function SignScreen() {
  const { s } = useGame()
  const who = signer(current(s).round)
  return <ChallengeScreen who={who} />
}

/* ============================== guess ============================== */

export function GuessScreen() {
  const { s, dispatch } = useGame()
  const c = current(s)
  const who = interpreter(c.round)
  const ctl = boxControls(s)
  usePausedTimeout(() => dispatch({ type: 'CHECK' }), 850, s.selected !== null, [s.selected])
  return (
    <Screen bg="#BCEDFF" className="relative flex h-full w-full flex-col justify-between overflow-hidden select-none">
      <SkyHills />
      <GameHeader />
      <div className="relative z-10 my-auto mx-auto flex w-full max-w-[356px] sm:max-w-[380px] flex-col gap-3.5 sm:gap-4 px-3 sm:px-4">
        {c.options.map((_, k) => (
          <OptionCard
            key={k}
            index={k}
            c={c}
            selected={s.selected === k}
            dim={s.selected !== null && s.selected !== k}
            onClick={() => ctl.colors && dispatch({ type: 'COLOR', index: k })}
          />
        ))}
      </div>
      <div
        className="relative z-10 flex w-full justify-center pb-16 sm:pb-20"
        style={{ paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {s.selected !== null ? (
          <div className="rounded-full bg-[#4A5A8C]/35 px-8">
            <Thinking />
          </div>
        ) : (
          <HelpButton />
        )}
      </div>
    </Screen>
  )
}

/* ============================== ¡Bien! · ¡Casi! ============================== */

export function GoodScreen() {
  const { s, dispatch } = useGame()
  const c = current(s)
  const learned = s.teacherPhase === 'learned'
  const levelLearnedCount = Math.max(1, (s.learned[s.level] ?? []).length)
  usePausedTimeout(() => dispatch({ type: 'AUTO_NEXT' }), 2400)

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Continuar"
      onClick={() => dispatch({ type: 'AUTO_NEXT' })}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && dispatch({ type: 'AUTO_NEXT' })}
      className="screen-in absolute inset-0 z-50 cursor-pointer outline-none select-none overflow-hidden"
    >
      <Screen bg="#BCEDFF" className="relative flex h-full w-full flex-col justify-between overflow-hidden">
        {/* Continuous sky gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-[#0095FF] via-[#45C1FF] via-[35%] to-[#BCEDFF]" />

        {/* Bottom clouds layer (Figma 667:1055) */}
        <CloudsBlue />

        {/* Central Reward Card Container (Figma 667:1103 / 667:1055) */}
        <div className="relative z-10 my-auto mx-auto flex w-full max-w-[356px] sm:max-w-[380px] flex-col items-center px-3 sm:px-4 pt-10 sm:pt-12">
          {/* Top Stars Cluster: Left (Star 13), Center (Star 11), Right (Star 12) - enlarged */}
          <div className="absolute -top-9 sm:-top-11 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none">
            <div className="-mr-4 -rotate-12 translate-y-3">
              <img src="/assets/17ebc.svg" alt="" className="w-[62px] h-[62px] sm:w-[70px] sm:h-[70px] drop-shadow-[0_3px_6px_rgba(0,0,0,0.16)]" />
            </div>
            <div className="z-10 -translate-y-1">
              <img src="/assets/4b70e.svg" alt="" className="w-[84px] h-[84px] sm:w-[94px] sm:h-[94px] drop-shadow-[0_4px_10px_rgba(0,0,0,0.2)]" />
            </div>
            <div className="-ml-4 rotate-12 translate-y-3">
              <img src="/assets/9e0b2.svg" alt="" className="w-[62px] h-[62px] sm:w-[70px] sm:h-[70px] drop-shadow-[0_3px_6px_rgba(0,0,0,0.16)]" />
            </div>
          </div>

          {/* Main Yellow Card with rounded corners - enlarged to match reference */}
          <div
            className="relative flex w-full flex-col items-center rounded-[36px] sm:rounded-[42px] px-5 sm:px-6 pt-9 sm:pt-11 pb-7 sm:pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.18)] overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #FFE44C 0%, #FFD000 65%, #FFBE00 100%)',
            }}
          >
            {/* Background sunburst light rays behind egg */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden>
              <img
                src="/assets/rays.png"
                alt=""
                draggable={false}
                className="size-[900px] max-w-none object-cover opacity-65 mix-blend-screen pointer-events-none"
              />
            </div>

            {/* ¡Bien! Text (below stars, bold white with soft shadow) */}
            <h1
              className="pop font-display text-[54px] sm:text-[62px] font-bold text-white tracking-wide text-center leading-none mt-3 sm:mt-4 z-10"
              style={{
                textShadow: '0 3px 6px rgba(0,0,0,0.15)',
              }}
            >
              {learned ? '¡Aprendimos!' : '¡Bien!'}
            </h1>

            {/* Egg / Character in center with purple spots - enlarged & protagonist */}
            <div className="relative my-3 sm:my-4 flex items-center justify-center z-10">
              <div className="relative size-[210px] sm:size-[235px] flex items-center justify-center">
                <img
                  src="/spike/1-feliz.svg"
                  alt="Huevo Spike"
                  draggable={false}
                  className="size-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.16)] select-none pointer-events-none"
                />
              </div>
            </div>

            {/* Bottom Reward Badges: Content white pill & Level Learned Droplet pill */}
            <div className="relative z-10 flex w-full items-center justify-center gap-3.5 mt-1">
              {/* Content Badge (e.g. "A") */}
              <div className="flex h-[46px] sm:h-[50px] min-w-[108px] sm:min-w-[120px] items-center justify-center rounded-full bg-white px-5 shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
                <span className="font-display text-[24px] sm:text-[26px] font-bold text-[#C48243]">
                  {c.content}
                </span>
              </div>
              {/* Level Learned Droplet Badge (e.g. 💧 +1, 💧 +2...) */}
              <LearnedWordBadge count={levelLearnedCount} plus />
            </div>
          </div>
        </div>
      </Screen>
    </div>
  )
}

export function AlmostScreen() {
  const { s, dispatch } = useGame()
  const who: Person = s.errorActor ?? 'papa'
  usePausedTimeout(() => dispatch({ type: 'AUTO_NEXT' }), 2400)
  return (
    <div role="button" tabIndex={0} aria-label="Seguir" onClick={() => dispatch({ type: 'AUTO_NEXT' })} onKeyDown={(e) => e.key === 'Enter' && dispatch({ type: 'AUTO_NEXT' })} className="absolute inset-0 cursor-pointer outline-none">
      <Screen bg="#BCEDFF">
        <SkyHills />
        <div className="card-in absolute top-[150px] inset-x-5 mx-auto flex max-w-[350px] flex-col items-center rounded-[28px] bg-white px-5 pt-6 pb-6 shadow-[0_10px_28px_rgba(0,0,0,.14)]">
          <h1 className="pop font-display text-[56px] leading-[60px] font-bold text-[#FF8001]" style={{ textShadow: '0 3px 0 rgb(255 79 26 / .25)' }}>¡Casi!</h1>
          <div className="mt-1 mb-2"><Spike stage={stageOf(s.done)} mood="confused" size={170} /></div>
          <div className="pop mt-1" style={{ animationDelay: '200ms' }}><Avatar who={who} size={96} halo question /></div>
          {who === 'papa' && <p className="mt-4 font-display text-[22px] leading-7 font-medium text-ink">{s.errorKind === 'help' ? 'Vamos a verla juntos' : 'Era otra. ¡Vamos juntos!'}</p>}
          <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#F7E8FF] py-1.5 pr-4 pl-2 font-sans text-[14px] font-extrabold text-[#8A3FC4]"><Icon name="cap" size={20} color="#D06BFF" />Modo maestro</span>
        </div>
        <XButton />
      </Screen>
    </div>
  )
}

export { ModuleBadge }
