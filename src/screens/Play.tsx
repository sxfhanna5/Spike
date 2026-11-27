import { useState, useRef } from 'react'
import { useGame } from '../game/context'
import { COLOR_HEX, MODULES, OPTION_META, ROUND_INFO, ROLE_COLOR, type Challenge, type Person, type ModuleId } from '../game/data'
import { boxControls, countTotalLearned, current, interpreter, signer, stageOf, teacherOf, teacherPicker } from '../game/engine'
import { CloudsBlue } from '../art/CloudsBlue'
import { CloudsOrange } from '../art/CloudsOrange'
import { GoodScene } from '../art/GoodScene'
import { LevelRays } from '../art/LevelRays'
import { SkyHills } from '../art/SkyHills'
import { Avatar, Dock, GameHeader, InstructionStrip, LearnedWordBadge, ListoBtn, ModuleBadge, PrimaryActionButton, ProgressBar, RoundChip, Screen, Spike, XButton, usePausedTimeout } from '../components/ui'
import { Icon, Pictogram, Shape, hasPictogram } from '../components/glyphs'

/* ============================== shared pieces ============================== */

/** Font size that keeps the learning content readable and inside its card. */
const fit = (text: string, big: number) => {
  if (text.length <= 1) return big
  if (text.length <= 4) return Math.round(big * 0.72)
  if (text.length <= 7) return Math.round(big * 0.48)
  if (text.length <= 10) return Math.round(big * 0.38)
  return Math.round(big * 0.30)
}

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
      className={`flex w-full items-center justify-between gap-2.5 sm:gap-3.5 rounded-full pr-5 pl-3 sm:pl-3.5 shadow-[0_4px_16px_rgba(74,90,140,0.12)] border border-[#E8ECF4]/60 transition-all duration-300 ease-[cubic-bezier(.3,1.5,.5,1)] active:scale-[0.98] ${selected ? 'scale-[1.03] shadow-[0_12px_24px_rgba(0,0,0,.18)]' : ''} ${dim ? 'opacity-40' : ''}`}
      style={{ height: h, background: selected ? o.color : '#fff' }}
    >
      <OptionBadge index={index} size={compact ? 50 : 56} />
      <span
        className="flex-1 flex items-center justify-center text-center font-sans leading-tight font-extrabold text-[#4A5A8C] px-1 line-clamp-2"
        style={{ fontSize: fit(label, compact ? 36 : 42), color: selected ? '#4A5A8C' : undefined }}
      >
        {label}
      </span>
      {c.kind === 'color' && hex && <span className="size-9 rounded-full shrink-0" style={{ background: hex }} aria-hidden />}
      {c.kind === 'number' && <span className="font-sans text-[30px] font-black text-[#4A5A8C] shrink-0">{NUMBER_DIGIT[label]}</span>}
      {c.kind === 'word' && hasPictogram(label) && <span className="shrink-0 flex items-center justify-center"><Pictogram content={label} size={46} /></span>}
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

/* ============================== intro cards (level · turn · maestro) ============================== */

export function IntroCard() {
  const { s, dispatch } = useGame()
  const intro = s.intro!
  const done = () => dispatch({ type: 'INTRO_DONE' })
  const isFrozen = typeof window !== 'undefined' && window.location.search.includes('freeze=true')
  usePausedTimeout(done, isFrozen ? 999999 : (intro.kind === 'level' ? 2000 : 1800), true, [intro.kind, s.idx, intro.who, s.teacherPhase, s.teacherLoops, s.screen])
  return (
    <div role="button" tabIndex={0} aria-label="Toca para saltar" onClick={done} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && done()} className="screen-in absolute inset-0 z-50 cursor-pointer outline-none">
      {intro.kind === 'level' ? <LevelCard /> : intro.kind === 'teacher' ? <TeacherTurnCard who={intro.who} /> : <TurnCard />}
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

function TeacherTurnCard({ who }: { who: Person }) {
  const { s } = useGame()
  const isPapa = who === 'papa'

  return (
    <div className="absolute inset-0 bg-white overflow-hidden flex flex-col items-center justify-between px-4 select-none pt-[calc(2rem+env(safe-area-inset-top,0px))] pb-8 sm:pt-[calc(2.5rem+env(safe-area-inset-top,0px))] sm:pb-10">
      {/* Top Header: Circular Disc Badge matching current module (Figma 817:3119 / 817:3154) */}
      <div className="flex flex-col items-center w-full">
        <ModuleBadge id={s.level} size={50} />
      </div>

      {/* Central Card Area */}
      <div className="my-auto flex flex-col items-center w-full max-w-[340px] sm:max-w-[356px]">
        {/* Large Rounded Purple Card (Figma 817:3104 / 817:3127) */}
        <div className="w-full rounded-[34px] sm:rounded-[38px] bg-[#E2ACFF] px-6 pt-7 pb-8 shadow-[0_12px_32px_rgba(186,80,240,0.18)] flex flex-col items-center text-center">
          {/* Title: Padre maestro or Niño maestro */}
          <h1 className="font-display font-black text-white text-[32px] sm:text-[36px] leading-tight">
            {isPapa ? 'Padre maestro' : 'Niño maestro'}
          </h1>
          {/* Subtitle: Quien sabe, es quien enseña */}
          <p className="mt-1.5 text-white/95 font-medium text-[16px] sm:text-[18px]">
            Quien sabe, es quien enseña
          </p>

          {/* Central Circular Avatar with Perched Graduation Cap */}
          <div className="relative mt-8 mb-2 flex items-center justify-center">
            {/* Graduation Cap (perched on top of circle matching Figma image 63 Vectorized) */}
            <div className="absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 z-20 w-[84px] sm:w-[94px] pointer-events-none select-none">
              <img
                src="/assets/teacher-cap.svg"
                alt=""
                className="size-full object-contain drop-shadow-sm"
              />
            </div>

            {/* Avatar Circle */}
            <div
              className={`size-[164px] sm:size-[184px] rounded-full border-[7px] border-white relative overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.12)] shrink-0 flex items-end justify-center ${
                isPapa ? 'bg-[#38B6FF]' : 'bg-[#FF8001]'
              }`}
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
            </div>
          </div>
        </div>

        {/* Below Card Instruction */}
        {isPapa ? (
          <div className="mt-4 sm:mt-5 flex items-center justify-center gap-2 text-[#8C8C8C] text-[16px] sm:text-[17px] font-medium select-none">
            <Icon name="arrowLeft" size={20} color="#8C8C8C" solid />
            <span>Gira el celular hacia tu padre</span>
          </div>
        ) : (
          <div className="mt-4 sm:mt-5 flex items-center justify-center gap-2 text-[#8C8C8C] text-[16px] sm:text-[17px] font-medium select-none">
            <span>Gira el celular hacia el niño</span>
            <Icon name="arrowRight" size={20} color="#8C8C8C" solid />
          </div>
        )}
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
  const who = intro.who

  const signing = signer(c.round) === who && (s.screen === 'sign' || (s.screen === 'write' && s.write.stage === 'sign'))
  const role = signing ? 'sign' : s.screen === 'write' ? 'write' : 'guess'
  const kid = who === 'nino'
  const name = who === 'papa' ? 'padre' : 'niño'
  const roundInfo = ROUND_INFO[c.round]
  const cardBg = kid ? '#FF8001' : '#45C1FF'
  const title = `Turno del ${name}`
  const subtitle = role === 'sign'
    ? (who === 'papa' ? 'Haz la seña frente a tu hijo' : 'Haz la seña frente a papá')
    : (who === 'nino' ? 'Adivina la seña de papá' : 'Adivina la seña de tu hijo')
  const subIcon = role === 'sign' ? 'hand' : 'eye'

  return (
    <div className="absolute inset-0 bg-white overflow-hidden flex flex-col items-center justify-between px-4 select-none pt-[calc(2rem+env(safe-area-inset-top,0px))] pb-6 sm:pt-[calc(2.75rem+env(safe-area-inset-top,0px))] sm:pb-8">
      {/* Top Section: Graduation Cap if Maestro mode, else Level 3D disc badge + Segmented Progress Bar */}
      <div className="flex flex-col items-center w-full">
        {teacher ? (
          <div className="w-[50px] sm:w-[56px] aspect-[147/123] flex items-center justify-center drop-shadow-sm pointer-events-none select-none">
            <img
              src="/assets/teacher-cap.svg"
              alt=""
              className="size-full object-contain"
            />
          </div>
        ) : (
          <ModuleBadge id={m.id} size={50} />
        )}
        <ProgressBar isMaster={teacher} masterLoops={s.teacherLoops} onWhite={true} className="mt-2.5" />
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

        {/* Prompt right below card: ONLY for father turns, NEVER for child turns */}
        {who === 'papa' && (
          <div className="mt-2.5 sm:mt-3 flex items-center justify-center gap-2 text-[#71717A] text-[15px] sm:text-[16px] font-medium select-none">
            <span>Gira el celular hacia tu padre</span>
            <Icon name="arrowRight" size={18} color="#71717A" solid />
          </div>
        )}
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

export function GuessScreen({ isMasterMode = false }: { isMasterMode?: boolean } = {}) {
  const { s, dispatch } = useGame()
  const c = current(s)
  const master = teacherOf(s)
  const picker = teacherPicker(s)
  const ctl = boxControls(s)
  const two = [c.correct, (c.correct + 1) % 3].sort()
  const optionsToRender = isMasterMode ? two : c.options.map((_, k) => k)
  const isSelected = isMasterMode ? s.teacherSelected !== null : s.selected !== null

  usePausedTimeout(() => dispatch({ type: 'CHECK' }), 850, s.selected !== null, [s.selected])
  return (
    <Screen bg={isMasterMode ? '#E7B3FF' : '#BCEDFF'} className={`relative flex h-full w-full flex-col justify-between overflow-hidden select-none ${isMasterMode ? 'bg-[#E7B3FF]' : ''}`}>
      {!isMasterMode && <SkyHills />}
      <GameHeader isMaster={isMasterMode} masterLoops={s.teacherLoops} chip={true} />
      <div className="relative z-10 my-auto mx-auto flex w-full max-w-[356px] sm:max-w-[380px] flex-col gap-3.5 sm:gap-4 px-3 sm:px-4">
        {optionsToRender.map((k) => (
          <OptionCard
            key={k}
            index={k}
            c={c}
            selected={isMasterMode ? s.teacherSelected === k : s.selected === k}
            dim={isMasterMode ? s.teacherSelected !== null && s.teacherSelected !== k : s.selected !== null && s.selected !== k}
            onClick={() => ctl.colors && dispatch({ type: 'COLOR', index: k })}
          />
        ))}
      </div>
      <div
        className="relative z-10 flex w-full justify-center pb-16 sm:pb-20"
        style={{ paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {isSelected ? (
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
            <div className="relative z-10 flex w-full items-center justify-center gap-3 mt-1 px-2">
              {/* Content Badge (e.g. "A", "GRACIAS", "PERDÓN") */}
              <div className="flex h-[46px] sm:h-[50px] min-w-[96px] max-w-[170px] sm:max-w-[185px] items-center justify-center rounded-full bg-white px-3.5 sm:px-4 shadow-[0_4px_14px_rgba(0,0,0,0.08)] shrink">
                <span
                  className="font-display font-bold text-[#C48243] text-center truncate leading-none"
                  style={{
                    fontSize: c.content.length > 10 ? 14 : c.content.length > 5 ? 17 : 24,
                  }}
                >
                  {c.content}
                </span>
              </div>
              {/* Level Learned Droplet Badge (e.g. 💧 +1, 💧 +2...) */}
              <LearnedWordBadge count={levelLearnedCount} plus className="shrink-0" />
            </div>
          </div>
        </div>
      </Screen>
    </div>
  )
}

export function AlmostScreen() {
  const { s, dispatch } = useGame()
  const teacher = teacherOf(s)
  const isPapaTeacher = teacher === 'papa'
  usePausedTimeout(() => dispatch({ type: 'AUTO_NEXT' }), 2600)

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Continuar al modo maestro"
      onClick={() => dispatch({ type: 'AUTO_NEXT' })}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && dispatch({ type: 'AUTO_NEXT' })}
      className="relative flex h-full w-full flex-col justify-between overflow-hidden select-none cursor-pointer outline-none bg-[#E7B3FF]"
    >
      {/* Full-bleed background from Figma (node 827:5883 / 817:1942) */}
      <img
        src="/assets/casi-bg.svg"
        alt=""
        draggable={false}
        className="absolute inset-0 size-full object-cover object-bottom pointer-events-none select-none"
      />

      {/* Top Header: Circular Purple "Aa" Disc Badge + Title + Subtitle */}
      <div className="relative z-20 flex flex-col items-center pt-[calc(1.8rem+env(safe-area-inset-top,0px))] sm:pt-[calc(2.2rem+env(safe-area-inset-top,0px))]">
        <ModuleBadge id={1} size={50} />

        <div className="flex flex-col items-center text-center px-4 mt-3 sm:mt-4">
          <h1
            className="font-display font-black text-white text-[52px] sm:text-[58px] leading-tight select-none"
            style={{ textShadow: '0 2px 6px rgba(138,63,196,0.35)' }}
          >
            ¡Casi!
          </h1>
          <p className="font-sans font-medium text-white/90 text-[17px] sm:text-[19px] mt-0.5">
            La seña no se entendió
          </p>
        </div>
      </div>

      {/* Central Mascot: Egg resting directly on the green hill crest + Thought bubble with '?' */}
      <div className="relative z-20 my-auto flex items-center justify-center w-full max-w-[320px] sm:max-w-[350px] mx-auto pt-2 pb-0 translate-y-8 sm:translate-y-9">
        <div className="relative w-[220px] sm:w-[246px] aspect-[475/584] flex items-center justify-center">
          {/* Egg Mascot SVG */}
          <img
            src="/assets/casi-egg.svg"
            alt="Spike confundido"
            draggable={false}
            className="size-full object-contain pointer-events-none select-none drop-shadow-sm"
          />

          {/* Thought Bubble with '?' perched on upper right */}
          <div className="absolute -top-3 -right-4 sm:-top-4 sm:-right-6 w-[58px] sm:w-[66px] aspect-[143/141] flex items-center justify-center pointer-events-none select-none">
            <img
              src="/assets/casi-bubble.svg"
              alt=""
              className="absolute inset-0 size-full object-contain drop-shadow-sm"
            />
            <span className="relative z-10 font-display font-black text-white text-[26px] sm:text-[30px] -translate-y-0.5">
              ?
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Area: Transition Pill Card resting on the green hill */}
      <div className="relative z-20 w-full flex flex-col items-center pb-9 sm:pb-11 px-4" style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="w-full max-w-[316px] sm:max-w-[336px] rounded-[30px] bg-white px-5 pt-3.5 pb-4 shadow-[0_10px_28px_rgba(74,90,140,0.18)] border border-[#E8ECF4] flex flex-col items-center select-none">
          {/* Avatar -> Arrow -> Teacher Cap (matching Figma 817:1942) */}
          <div className="flex items-center justify-center gap-3.5 sm:gap-4">
            {/* Teacher Avatar Disc */}
            <div className={`size-11 sm:size-12 rounded-full border-[3px] border-white shadow-sm overflow-hidden flex items-end justify-center ${isPapaTeacher ? 'bg-[#38B6FF]' : 'bg-[#FF8001]'}`}>
              {isPapaTeacher ? (
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

            {/* Transition Arrow */}
            <Icon name="arrowRight" size={18} color="#6A7187" solid />

            {/* Graduation Cap Icon */}
            <div className="w-10 sm:w-11 aspect-[147/123] flex items-center justify-center drop-shadow-sm pointer-events-none select-none">
              <img
                src="/assets/teacher-cap.svg"
                alt="Modo maestro"
                draggable={false}
                className="size-full object-contain"
              />
            </div>
          </div>

          {/* Invitation Text */}
          <p className="mt-2 text-[#6A7187] font-sans font-bold text-[14px] sm:text-[15px] text-center leading-tight">
            {isPapaTeacher ? 'Papá, llegó tu momento de enseñar' : 'Hijo, llegó tu momento de enseñar'}
          </p>
        </div>
      </div>
    </div>
  )
}

export { ModuleBadge }
