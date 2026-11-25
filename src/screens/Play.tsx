import { useGame } from '../game/context'
import { COLOR_HEX, MODULES, OPTION_META, ROUND_INFO, ROLE_COLOR, type Challenge, type Person } from '../game/data'
import { boxControls, current, interpreter, signer, stageOf, teacherOf } from '../game/engine'
import { CloudsBlue } from '../art/CloudsBlue'
import { CloudsOrange } from '../art/CloudsOrange'
import { GoodScene } from '../art/GoodScene'
import { LevelRays } from '../art/LevelRays'
import { SkyHills } from '../art/SkyHills'
import { Avatar, Dock, GameHeader, ModuleBadge, RoundChip, Screen, Spike, XButton, usePausedTimeout } from '../components/ui'
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
export function OptionBadge({ index, size = 58 }: { index: number; size?: number }) {
  const o = OPTION_META[index]
  return (
    <span className="grid shrink-0 place-items-center rounded-full" style={{ width: size, height: size, background: o.color, boxShadow: `0 4px 0 ${o.ink}55` }} aria-label={o.label}>
      <Shape kind={o.shape} size={size * 0.55} color={o.ink} />
    </span>
  )
}

export function OptionCard({ index, c, selected, dim, onClick, compact }: { index: number; c: Challenge; selected?: boolean; dim?: boolean; onClick?: () => void; compact?: boolean }) {
  const label = c.options[index]
  const o = OPTION_META[index]
  const h = compact ? 80 : 90
  const hex = COLOR_HEX[label]
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${o.label}: ${label}`}
      className={`flex w-full items-center gap-3 rounded-full pr-6 pl-4 text-left shadow-[0_6px_16px_rgba(0,0,0,.1)] transition-all duration-300 ease-[cubic-bezier(.3,1.5,.5,1)] ${selected ? 'scale-[1.04] shadow-[0_14px_28px_rgba(0,0,0,.2)]' : ''} ${dim ? 'opacity-40' : ''}`}
      style={{ height: h, background: selected ? o.color : '#fff' }}
    >
      <OptionBadge index={index} size={compact ? 52 : 58} />
      <span className="flex-1 font-sans leading-none font-black text-ink2" style={{ fontSize: fit(label, compact ? 44 : 52), color: selected ? '#4A5A8C' : undefined }}>{label}</span>
      {c.kind === 'color' && hex && <span className="size-9 rounded-full" style={{ background: hex }} aria-hidden />}
      {c.kind === 'number' && <span className="font-sans text-[30px] font-black text-ink2">{NUMBER_DIGIT[label]}</span>}
      {c.kind === 'word' && hasPictogram(label) && <Pictogram content={label} size={46} />}
    </button>
  )
}
const NUMBER_DIGIT: Record<string, number> = { UNO: 1, DOS: 2, TRES: 3, CUATRO: 4, CINCO: 5, SEIS: 6, SIETE: 7, OCHO: 8, NUEVE: 9, DIEZ: 10 }

/** The «?» button of the box, also on screen. Without label (child's turn) it is just the symbol. */
export function HelpButton({ label = 'No entendí' }: { label?: string }) {
  const { s, dispatch } = useGame()
  const live = boxControls(s).help
  return (
    <button
      type="button"
      disabled={!live}
      onClick={() => dispatch({ type: 'HELP' })}
      aria-label={`? ${label || 'No entendí'}`}
      className={`btn3d mx-auto inline-flex min-h-[60px] items-center gap-3 rounded-full py-1 pl-1.5 ${label ? 'pr-7' : 'pr-1.5'} ${live ? '' : 'opacity-50'}`}
      style={{ '--bg': '#fff', '--edge': '#D9DEE7', '--fg': '#4A5A8C' } as React.CSSProperties}
    >
      <span className="grid size-12 place-items-center rounded-full bg-[#65739F] font-display text-[32px] leading-none font-bold text-white shadow-[0_4px_0_#4A5A8C]">?</span>
      {label}
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

/** Listo button: always orange. On orange scenes it sits on a white dock so it still reads. */
function ListoBtn({ onClick, onOrange }: { onClick: () => void; onOrange?: boolean }) {
  const btn = (
    <button
      type="button"
      onClick={onClick}
      className="btn3d inline-flex min-h-[64px] w-[210px] items-center justify-center gap-3 rounded-full font-bold"
      style={{ '--bg': '#FF8001', '--edge': '#FF4F1A', '--fg': '#fff', '--ts': '0 2px 0 rgb(255 79 26 / .4)', fontSize: 24, fontWeight: 700 } as React.CSSProperties}
    >
      <Icon name="check" size={28} /> Listo
    </button>
  )
  return onOrange ? <Dock>{btn}</Dock> : btn
}

/* ============================== intro cards (level · turn · maestro) ============================== */

export function IntroCard() {
  const { s, dispatch } = useGame()
  const intro = s.intro!
  const done = () => dispatch({ type: 'INTRO_DONE' })
  usePausedTimeout(done, intro.kind === 'level' ? 2000 : 1800, true, [intro.kind, s.idx, intro.who, s.teacherPhase, s.teacherLoops, s.screen])
  return (
    <div role="button" tabIndex={0} aria-label="Toca para saltar" onClick={done} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && done()} className="screen-in absolute inset-0 z-40 cursor-pointer outline-none">
      {intro.kind === 'level' ? <LevelCard /> : <TurnCard />}
    </div>
  )
}

function LevelCard() {
  const { s } = useGame()
  const m = MODULES[s.level]
  const forKid = s.facing === 'nino'
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: `linear-gradient(170deg, ${m.color} 0%, ${m.color} 45%, ${m.accent} 130%)` }}>
      <LevelRays />
      <div className="absolute top-[clamp(32px,5vh,52px)] left-0 flex w-full flex-col items-center text-white">
        <div className="hatch-pop"><ModuleBadge id={m.id} size={118} /></div>
        {!forKid && (
          <>
            <span className="mt-3 font-display text-[22px] leading-7 font-medium text-white/90">Nivel {m.id}</span>
            <h1 className="font-display text-[44px] leading-[48px] font-semibold drop-shadow-[0_3px_0_rgba(0,0,0,.14)]">{m.title}</h1>
          </>
        )}
        {forKid && <span className="mt-3 grid size-14 place-items-center rounded-full bg-white font-display text-[30px] font-bold shadow-[0_4px_0_rgba(0,0,0,.12)]" style={{ color: m.accent }}>{m.id}</span>}
      </div>
      <div className="absolute top-[clamp(210px,34vh,310px)] left-1/2 flex -translate-x-1/2 flex-col items-center">
        <Spike stage={m.stage} mood="happy" size={m.stage === 1 ? 190 : 230} className="pop max-h-[26vh]" />
        <div className="-mt-3 h-[28px] w-[150px] rounded-[50%] bg-black/15 blur-[1px]" />
      </div>
      <div className="card-in absolute bottom-[clamp(24px,5vh,54px)] left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white py-2 pr-6 pl-2 shadow-[0_6px_14px_rgba(0,0,0,.12)]" style={{ color: m.accent }}>
        <span className="flex"><Avatar who="papa" size={40} /><Avatar who="nino" size={40} className="-ml-2" /></span>
        <span className="font-display text-[26px] leading-none font-bold">× {m.challenges.length}</span>
      </div>
      <XButton />
    </div>
  )
}

const TURN_COPY: Record<string, string> = {
  'papa-sign': 'Haz la seña frente a tu hijo',
  'papa-guess': 'Adivina la seña de tu hijo',
  'papa-write': 'Escribe lo que deletrea tu hijo',
}

/** Big round pictogram that replaces the sentence on the child's cards. */
function RolePicto({ role, color, edge }: { role: 'sign' | 'write' | 'guess' | 'teach'; color: string; edge: string }) {
  return (
    <span className="grid h-[84px] min-w-[84px] place-items-center rounded-full bg-white px-5 shadow-[0_6px_0_rgba(0,0,0,.14)]" style={{ color }}>
      {role === 'sign' && <Icon name="hand" size={52} color={color} />}
      {role === 'write' && <Icon name="pencil" size={48} color={color} />}
      {role === 'teach' && <Icon name="book" size={50} color={edge} />}
      {role === 'guess' && <span className="flex gap-2">{OPTION_META.map((o) => <Shape key={o.key} kind={o.shape} size={28} color={o.ink} />)}</span>}
    </span>
  )
}

function TurnCard() {
  const { s } = useGame()
  const intro = s.intro!
  const c = current(s)
  const teacher = intro.kind === 'teacher'
  const who = teacher ? teacherOf(s) : intro.who
  const signing = signer(c.round) === who && (s.screen === 'sign' || (s.screen === 'write' && s.write.stage === 'sign'))
  const role = signing ? 'sign' : s.screen === 'write' ? 'write' : 'guess'
  const kid = who === 'nino'
  const color = teacher ? '#E7B3FF' : ROLE_COLOR[who]
  const edge = teacher ? '#D06BFF' : who === 'nino' ? '#FF4F1A' : '#007BB9'
  const fg = teacher ? '#4A5A8C' : '#fff'
  const name = who === 'papa' ? 'padre' : 'niño'
  const subIcon = teacher ? 'cap' : role === 'sign' ? 'hand' : role === 'write' ? 'pencil' : 'eye'
  return (
    <div className="absolute inset-0 bg-white">
      <GameHeader chip={false} onWhite />
      <div className="card-in absolute top-[clamp(110px,16vh,184px)] inset-x-4 mx-auto h-[clamp(380px,52vh,480px)] max-w-[344px] rounded-[28px] shadow-[0_12px_30px_rgba(0,0,0,.14)]" style={{ background: teacher ? 'linear-gradient(180deg,#EBC2FF,#E7B3FF)' : color }}>
        {/* the child's cards carry no sentences: only avatar and pictogram */}
        {!kid && (
          <div className="flex flex-col items-center pt-[44px]" style={{ color: fg }}>
            <h1 className="font-display text-[34px] leading-[40px] font-semibold" style={{ textShadow: teacher ? undefined : `0 3px 0 ${edge}` }}>{teacher ? `Maestro ${name}` : `Turno del ${name}`}</h1>
            <p className="mt-2 flex items-center gap-2 px-4 text-center font-display text-[18px] leading-6 font-medium"><Icon name={subIcon} size={24} />{teacher ? 'El que sabe, enseña' : TURN_COPY[`papa-${role}`]}</p>
          </div>
        )}
        <div className={`absolute left-1/2 -translate-x-1/2 ${kid ? 'top-[70px]' : 'top-[169px]'}`}>
          {teacher ? <span className="hat-bounce block"><Avatar who={who} size={kid ? 210 : 186} halo cap /></span> : <Avatar who={who} size={kid ? 210 : 186} halo className="pop" />}
        </div>
        {kid && <div className="absolute bottom-[58px] left-1/2 -translate-x-1/2"><RolePicto role={teacher ? 'teach' : role} color={teacher ? '#D06BFF' : '#FF8001'} edge="#D06BFF" /></div>}
        {!kid && <div className="absolute bottom-5 left-1/2 -translate-x-1/2"><RoundChip round={c.round} className="origin-bottom scale-[.92] shadow-[0_3px_8px_rgba(0,0,0,.12)]" /></div>}
      </div>
      {intro.arrow && (
        <p className="absolute bottom-[clamp(16px,3.5vh,44px)] left-0 flex w-full items-center justify-center gap-3 font-display text-[18px] font-normal text-ink2">
          <Icon name="hand" size={26} color="#65739F" />
          <Icon name={who === 'papa' ? 'arrowLeft' : 'arrowRight'} size={26} className="turn-arrow" color="#FF8001" />
          <Avatar who={who} size={40} />
        </p>
      )}
    </div>
  )
}

/* ============================== signs ============================== */

/** Padre hace la seña: the parent sees the LSC video (placeholder) and the word; the child does not look. */
function SignParent() {
  const { s, dispatch } = useGame()
  const c = current(s)
  const m = MODULES[s.level]
  return (
    <Screen bg="#45C1FF">
      <CloudsBlue />
      <GameHeader />
      <div className="absolute top-[clamp(150px,22vh,232px)] inset-x-4 mx-auto h-[clamp(280px,38vh,342px)] max-w-[344px] rounded-[28px] bg-white shadow-[0_10px_26px_rgba(0,0,0,.14)]">
        <div className="absolute -top-[34px] left-1/2 -translate-x-1/2"><Avatar who="papa" size={68} halo /></div>
        <div className="absolute top-[50px] left-[17px] right-[17px] h-[clamp(140px,20vh,190px)] overflow-hidden rounded-[22px] bg-[#4A5A8C]">
          <img src="/assets/110ea.png" alt="" className="size-full object-cover opacity-95" draggable={false} />
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-[#4A5A8C]/80 py-1 pr-4 pl-1 font-sans text-[14px] font-extrabold text-white">
            <span className="grid size-7 place-items-center rounded-full bg-white text-[#FF8001]"><Icon name="play" size={14} /></span>
            Video LSC: {c.content}
          </span>
        </div>
        <div className="absolute right-[17px] bottom-[18px] left-[17px] grid h-[62px] place-items-center rounded-full" style={{ background: m.color }}>
          <span className="font-display leading-none font-bold" style={{ color: m.accent, fontSize: fit(c.content, 38) }}>{c.content}</span>
        </div>
      </div>
      <p className="absolute bottom-[clamp(76px,11vh,96px)] left-0 flex w-full items-center justify-center gap-2 font-display text-[18px] font-medium text-white drop-shadow-[0_2px_0_rgba(0,123,185,.55)]"><Icon name="hand" size={26} /> Haz la seña frente a tu hijo</p>
      <div className="absolute bottom-[clamp(16px,2.5vh,32px)] left-0 flex w-full justify-center"><ListoBtn onClick={() => dispatch({ type: 'SIGN_DONE' })} /></div>
    </Screen>
  )
}

/** Niño hace la seña: the child sees the content, big, with the hand icon. */
function SignKid() {
  const { s, dispatch } = useGame()
  const c = current(s)
  return (
    <Screen bg="#FF8001">
      <CloudsOrange />
      <GameHeader />
      <div className="absolute top-[clamp(150px,22vh,232px)] inset-x-4 mx-auto flex h-[clamp(280px,38vh,342px)] max-w-[344px] items-center justify-center rounded-[56px] bg-white shadow-[0_10px_26px_rgba(0,0,0,.14)]">
        <div className="absolute -top-[34px] left-1/2 -translate-x-1/2"><Avatar who="nino" size={68} halo /></div>
        <ContentBig c={c} />
      </div>
      <div className="absolute bottom-[clamp(76px,11vh,96px)] left-0 flex w-full items-center justify-center gap-3"><Icon name="hand" size={44} color="#fff" /><Icon name="arrowRight" size={34} color="#fff" /><Avatar who="papa" size={52} /></div>
      <div className="absolute bottom-[clamp(16px,2.5vh,32px)] left-0 flex w-full justify-center"><ListoBtn onClick={() => dispatch({ type: 'SIGN_DONE' })} onOrange /></div>
    </Screen>
  )
}

export function SignScreen() {
  const { s } = useGame()
  return signer(current(s).round) === 'papa' ? <SignParent /> : <SignKid />
}

/* ============================== guess ============================== */

export function GuessScreen() {
  const { s, dispatch } = useGame()
  const c = current(s)
  const who = interpreter(c.round)
  const ctl = boxControls(s)
  usePausedTimeout(() => dispatch({ type: 'CHECK' }), 850, s.selected !== null, [s.selected])
  return (
    <Screen bg="#BCEDFF">
      <SkyHills />
      <GameHeader />
      <div className="absolute top-[clamp(150px,20vh,226px)] inset-x-5 mx-auto flex max-w-[350px] flex-col gap-3.5">
        {who === 'papa' && <p className="text-center font-display text-[20px] font-medium text-white drop-shadow-[0_2px_0_rgba(0,123,185,.55)]">¿Qué señaló tu hijo?</p>}
        {c.options.map((_, k) => (
          <OptionCard key={k} index={k} c={c} selected={s.selected === k} dim={s.selected !== null && s.selected !== k} onClick={() => ctl.colors && dispatch({ type: 'COLOR', index: k })} />
        ))}
      </div>
      <div className="absolute bottom-[clamp(16px,3vh,44px)] left-0 flex w-full justify-center">
        {s.selected !== null ? <div className="rounded-full bg-[#4A5A8C]/35 px-8"><Thinking /></div> : <HelpButton label={who === 'nino' ? '' : 'No entendí'} />}
      </div>
    </Screen>
  )
}

/* ============================== ¡Bien! · ¡Casi! ============================== */

export function GoodScreen() {
  const { s, dispatch } = useGame()
  const c = current(s)
  const m = MODULES[s.level]
  const learned = s.teacherPhase === 'learned'
  usePausedTimeout(() => dispatch({ type: 'AUTO_NEXT' }), learned ? 2800 : 2000)
  return (
    <div role="button" tabIndex={0} aria-label="Seguir" onClick={() => dispatch({ type: 'AUTO_NEXT' })} onKeyDown={(e) => e.key === 'Enter' && dispatch({ type: 'AUTO_NEXT' })} className="absolute inset-0 cursor-pointer outline-none">
      <Screen bg="#BCEDFF">
        <GoodScene />
        <h1 className="pop absolute top-[clamp(140px,20vh,212px)] left-0 w-full text-center font-display leading-[72px] font-bold text-white" style={{ fontSize: learned ? 50 : 66, textShadow: `0 4px 0 ${learned ? '#D06BFF' : '#FF8001'}` }}>{learned ? '¡Aprendimos!' : '¡Bien!'}</h1>
        <div className="absolute top-[clamp(230px,33vh,318px)] left-1/2 -translate-x-1/2"><Spike stage={m.stage} mood="happy" size={232} className="max-h-[26vh]" /></div>
        {learned && (
          <>
            <div className="seal-glint absolute top-[clamp(330px,46vh,420px)] right-[48px] z-10">
              <span className="sparkle-fx absolute -top-3 -left-3 text-[#FFE44C]"><Icon name="sparkle" size={26} /></span>
              <span className="sparkle-fx absolute -right-2 bottom-1 text-white" style={{ animationDelay: '.7s' }}><Icon name="sparkle" size={20} /></span>
              <img src="/art/spike-medal.png" alt="Sello de maestro" width={92} className="drop-shadow-[0_8px_10px_rgba(0,0,0,.2)]" />
            </div>
          </>
        )}
        <div className="absolute bottom-[clamp(24px,5vh,54px)] left-0 flex w-full items-center justify-center gap-3">
          <span className="card-in flex h-[40px] min-w-[120px] items-center justify-center rounded-full bg-white px-5 font-display text-[20px] font-bold shadow-[0_3px_8px_rgba(0,0,0,.1)]" style={{ color: m.accent }}>{c.content}</span>
          {!s.replaying && (
            <span className="card-in flex h-[40px] items-center gap-1.5 rounded-full bg-[#FF8001] pr-5 pl-3 font-display text-[20px] font-bold text-white shadow-[0_4px_0_#FF4F1A]">
              <img src="/art/fx-flame.png" alt="" width={24} />+1
            </span>
          )}
          {learned && <span className="card-in flex h-[40px] items-center gap-1.5 rounded-full bg-[#E7B3FF] px-4 font-display text-[16px] font-semibold shadow-[0_4px_0_#D06BFF]"><Icon name="cap" size={20} color="#D06BFF" />Sello</span>}
        </div>
        <XButton />
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
