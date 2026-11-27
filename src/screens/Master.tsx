import { useState } from 'react'
import { useGame } from '../game/context'
import { ALPHABET, MODULES, STAGES, plainLetters, type ModuleId } from '../game/data'
import { boxControls, countTotalLearned, current, interpreter, signer, teacherMode, teacherOf, teacherPicker } from '../game/engine'
import { CloudsBlue } from '../art/CloudsBlue'
import { CloudsOrange } from '../art/CloudsOrange'
import { LevelRays } from '../art/LevelRays'
import { SkyHills } from '../art/SkyHills'
import { Avatar, Btn, Dock, GameHeader, ModuleBadge, NavBar, PrimaryActionButton, Screen, Sparkles, Spike, XButton, CountUp, usePausedTimeout } from '../components/ui'
import { Badge, Icon, Pictogram, hasPictogram } from '../components/glyphs'
import { ContentBig, HelpButton, OptionCard } from './Play'

/* ============================== S19 / S20 · Modo maestro ============================== */

function SealChip() {
  const { s } = useGame()
  return (
    <span className="absolute right-5 z-30 flex h-14 items-center gap-1.5 rounded-full bg-white pr-4 pl-2 shadow-[0_6px_16px_rgba(0,0,0,.14)]" style={{ top: 'calc(1.25rem + env(safe-area-inset-top, 0px))' }} aria-label={`${s.masterCount} sellos de maestro`}>
      <img src="/art/spike-medal.png" alt="" width={36} draggable={false} />
      <span className="font-display text-[22px] font-semibold">{s.masterCount}</span>
    </span>
  )
}

/** Lap indicator: two dots, the filled ones are the laps already started (max 2). */
function Laps() {
  const { s } = useGame()
  const lap = Math.min(s.teacherLoops + 1, 2)
  return (
    <span className="card-in inline-flex items-center gap-2.5 rounded-full bg-white/85 px-4 py-2 shadow-[0_3px_8px_rgba(112,40,160,.14)]" role="img" aria-label={`Vuelta ${lap} de 2`}>
      {[0, 1].map((k) => <span key={k} className="size-3.5 rounded-full transition-colors duration-300" style={{ background: k < lap ? '#D06BFF' : '#E7B3FF', boxShadow: k < lap ? '0 2px 0 #9C3FD6' : undefined }} />)}
    </span>
  )
}

export function MasterScreen() {
  const { s, dispatch } = useGame()
  const c = current(s)
  const master = teacherOf(s)
  const picker = teacherPicker(s)
  const mode = teacherMode(s)
  const show = s.teacherPhase === 'show'
  const ctl = boxControls(s)
  const two = [c.correct, (c.correct + 1) % 3].sort()
  const name = master === 'nino' ? 'niño' : 'padre'
  const kidTeaches = master === 'nino'
  return (
    <Screen bg="#E7B3FF">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#F3D6FF,#E7B3FF_65%)]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden"><LevelRays opacity={0.5} /></div>
      <Sparkles color="#fff" className="opacity-70" />
      <XButton />
      <SealChip />
      <div className="absolute top-[104px] left-1/2 -translate-x-1/2"><span className="hat-bounce block"><Avatar who={master} size={150} halo cap /></span></div>
      <div className="absolute top-[274px] left-0 flex w-full flex-col items-center gap-2">
        {/* the child's turn has no sentences */}
        {!kidTeaches && <h1 className="font-display text-[30px] leading-9 font-semibold text-ink">Maestro {name}</h1>}
        <Laps />
      </div>

      {show ? (
        <>
          <div className="card-in absolute top-[clamp(320px,44vh,390px)] inset-x-5 mx-auto flex h-[196px] max-w-[350px] items-center justify-center gap-4 rounded-[28px] bg-white px-4 shadow-[0_10px_26px_rgba(112,40,160,.18)]">
            <div className="relative h-[150px] w-[140px] shrink-0 overflow-hidden rounded-[20px] bg-[#4A5A8C]">
              <img src="/assets/110ea.png" alt="" className="size-full object-cover" draggable={false} />
              <span className="absolute right-2 bottom-2 left-2 truncate rounded-full bg-[#4A5A8C]/80 px-2 py-0.5 text-center font-sans text-[14px] font-extrabold text-white">Video LSC</span>
              <span className="absolute top-2 left-2 grid size-8 place-items-center rounded-full bg-white text-[#FF8001]"><Icon name="play" size={14} /></span>
            </div>
            {kidTeaches ? (
              <div className="flex flex-col items-center gap-2">
                <span className="grid size-[62px] place-items-center rounded-full bg-[#F7E8FF] shadow-[0_4px_0_#E7B3FF]"><Icon name="hand" size={34} color="#D06BFF" /></span>
                <Icon name="arrowRight" size={24} color="#D06BFF" />
                <Avatar who="papa" size={64} />
              </div>
            ) : (
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#E7B3FF] font-display text-[26px] font-bold shadow-[0_3px_0_#D06BFF]">=</span>
                <div className="flex min-w-0 flex-col items-center gap-1">
                  {hasPictogram(c.content) && <Pictogram content={c.content} size={54} />}
                  <span className="font-sans leading-none font-black" style={{ fontSize: c.content.length > 8 ? 22 : c.content.length > 4 ? 32 : 56 }}>{c.content}</span>
                </div>
              </div>
            )}
          </div>
          {!kidTeaches && (
            <p className="absolute top-[604px] left-0 flex w-full items-center justify-center gap-2 font-display text-[20px] font-medium text-ink">
              <Icon name="turtle" size={26} color="#D06BFF" />
              {mode === 'write' ? 'Letra por letra, despacio' : 'Repítela despacio'}
            </p>
          )}
          <div className="absolute top-[664px] inset-x-5 mx-auto max-w-[300px]"><PrimaryActionButton onClick={() => dispatch({ type: 'TEACHER_NEXT' })} /></div>
        </>
      ) : mode === 'write' ? (
        <div className="absolute top-[372px] inset-x-5 mx-auto max-w-[350px]"><WriteBoard compact /></div>
      ) : (
        <>
          <p className="absolute top-[378px] left-0 flex w-full items-center justify-center gap-2 font-display text-[20px] font-medium text-ink"><Avatar who={picker} size={36} />{picker === 'papa' ? 'Padre, elige otra vez' : ''}</p>
          <div className="absolute top-[428px] inset-x-5 mx-auto flex max-w-[350px] flex-col gap-3">
            {two.map((k) => <OptionCard key={k} index={k} c={c} compact onClick={() => ctl.colors && dispatch({ type: 'COLOR', index: k })} />)}
          </div>
          <div className="absolute top-[640px] left-0 flex w-full justify-center"><HelpButton /></div>
        </>
      )}
    </Screen>
  )
}

/* ============================== S21 · Escribir ============================== */

/** Empty boxes + the whole alphabet on a touch keyboard. */
function WriteBoard({ compact }: { compact?: boolean }) {
  const { s, dispatch } = useGame()
  const c = current(s)
  const letters = plainLetters(c.content)
  const full = s.write.typed.length === letters.length
  const slotW = Math.min(58, Math.floor(330 / letters.length) - 8)
  const who = s.screen === 'master' ? teacherPicker(s) : interpreter(c.round)
  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-center gap-2 pb-4" aria-label="Casillas de la palabra">
        {letters.map((_, k) => (
          <span key={k} className={`grid place-items-center rounded-[18px] font-sans font-black text-ink transition-all duration-200 ${s.write.typed[k] ? 'pop bg-white shadow-[0_5px_12px_rgba(0,0,0,.12)]' : k === s.write.typed.length ? 'bg-white/90 shadow-[inset_0_-5px_0_#FF8001]' : 'bg-white/60'}`} style={{ width: slotW, height: compact ? 62 : 72, fontSize: compact ? 34 : 40 }}>
            {s.write.typed[k] ?? ''}
          </span>
        ))}
      </div>
      {!full ? (
        <>
          <div className="grid grid-cols-7 gap-1.5">
            {ALPHABET.map((l) => (
              <button key={l} type="button" onClick={() => dispatch({ type: 'TYPE', letter: l })} className="btn3d grid h-[46px] w-[46px] place-items-center rounded-[14px] font-sans text-[22px] font-black" style={{ '--bg': '#fff', '--edge': '#D9DEE7', '--fg': '#4A5A8C', minHeight: 46, padding: 0 } as React.CSSProperties}>{l}</button>
            ))}
            <button type="button" aria-label="Borrar" onClick={() => dispatch({ type: 'ERASE' })} className="btn3d grid h-[46px] w-[46px] place-items-center rounded-[14px]" style={{ '--bg': '#fff', '--edge': '#D9DEE7', '--fg': '#4A5A8C', minHeight: 46, padding: 0 } as React.CSSProperties}><Icon name="backspace" size={26} color="#FF8001" /></button>
          </div>
          <div className="mt-4"><HelpButton /></div>
        </>
      ) : (
        <div className="flex h-[200px] items-center justify-center"><div className="rounded-full bg-[#4A5A8C]/35 px-8"><span className="flex h-[60px] items-center gap-2">{[0, 1, 2].map((k) => <span key={k} className="dot-bounce size-3.5 rounded-full bg-white" style={{ animationDelay: `${k * 140}ms` }} />)}</span></div></div>
      )}
    </div>
  )
}

export function WriteScreen() {
  const { s, dispatch } = useGame()
  const c = current(s)
  const letters = plainLetters(c.content)
  const spellBy = signer(c.round)
  const writer = interpreter(c.round)
  const full = s.write.typed.length === letters.length
  usePausedTimeout(() => dispatch({ type: 'CHECK' }), 850, s.write.stage === 'write' && full, [s.write.typed.length])

  if (s.write.stage === 'sign') {
    const papa = spellBy === 'papa'
    return (
      <Screen bg={papa ? '#45C1FF' : '#FF8001'} className="relative flex h-full w-full flex-col justify-between overflow-hidden select-none">
        {papa ? <CloudsBlue /> : <CloudsOrange />}
        <GameHeader />

        {/* Unified card & controls centered vertically */}
        <div className="my-auto mx-auto w-full max-w-[340px] sm:max-w-[354px] px-4 pt-7 sm:pt-9 z-10 flex flex-col items-center">
          {/* Centered white card */}
          <div className="relative w-full rounded-[36px] bg-white px-4 pt-12 pb-5 sm:px-5 sm:pt-14 sm:pb-6 shadow-[0_16px_36px_rgba(0,0,0,0.14)] flex flex-col items-center">
            {/* Top perched Avatar with white border */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2">
              <div className={`relative size-[76px] overflow-hidden rounded-full border-[6px] border-white flex items-end justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] ${papa ? 'bg-[#45C1FF]' : 'bg-[#FF8001]'}`}>
                {papa ? (
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

            {/* Letter-by-letter carousel */}
            <div className="flex items-start justify-center gap-1.5 py-2">
              {c.content.split('').map((ch, k) => {
                const L = letters[Math.min(k, letters.length - 1)]
                const now = k === s.write.letter
                return (
                  <div key={k} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${now ? 'scale-110' : 'opacity-70'}`}>
                    <span className={`rounded-xl px-1 font-sans leading-[1.05] font-black ${now ? 'bg-[#FFE44C]' : ''}`} style={{ fontSize: letters.length > 5 ? 42 : 52 }}>{ch}</span>
                    <span title={`Foto mano: ${L}`} aria-label={`Foto mano: ${L}`} className={`grid h-[52px] w-[42px] place-items-center rounded-[14px] ${now ? 'bg-[#FFF4C2] shadow-[0_3px_0_#FFE44C]' : 'bg-[#EEF1FA]'}`}>
                      <Icon name="hand" size={22} color={spellBy === 'papa' ? '#45C1FF' : '#FF8001'} solid />
                      <span className="-mt-1 font-sans text-[14px] leading-none font-black">{L}</span>
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Current letter indicator / purple rectangle */}
            <div className="mt-3.5 w-full h-[52px] rounded-[26px] bg-[#E7B3FF] flex items-center justify-center gap-2 shadow-[inset_0_-2px_0_rgba(191,94,235,0.25)]">
              <span className="font-sans font-bold text-[16px] text-[#BF5EEB]">Foto mano:</span>
              <span className="font-sans font-black text-[26px] text-[#BF5EEB] leading-none">{letters[s.write.letter]}</span>
            </div>

            {hasPictogram(c.content) && (
              <div className="mt-3">
                <span className="grid size-[58px] place-items-center rounded-[18px] bg-[#F6F8FB]">
                  <Pictogram content={c.content} size={42} />
                </span>
              </div>
            )}
          </div>

          {/* Steppers & instruction below card */}
          <div className="mt-4 flex items-center justify-center gap-3 select-none">
            <button
              type="button"
              aria-label="Letra anterior"
              disabled={s.write.letter === 0}
              onClick={() => dispatch({ type: 'LETTER_STEP', dir: -1 })}
              className="btn3d grid size-12 place-items-center rounded-full disabled:opacity-40"
              style={{ '--bg': '#fff', '--edge': '#FFD2A8', '--fg': '#FF8001', padding: 0, minHeight: 48 } as React.CSSProperties}
            >
              <Icon name="arrowLeft" size={22} />
            </button>
            <div className="flex items-center gap-2 text-white font-medium text-[16px] sm:text-[18px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
              <Icon name="hand" size={22} color="#fff" solid />
              <span>{papa ? 'Haz la seña letra por letra' : 'Haz la seña frente a papá'}</span>
            </div>
            <button
              type="button"
              aria-label="Letra siguiente"
              disabled={s.write.letter === letters.length - 1}
              onClick={() => dispatch({ type: 'LETTER_STEP', dir: 1 })}
              className="btn3d grid size-12 place-items-center rounded-full disabled:opacity-40"
              style={{ '--bg': '#fff', '--edge': '#FFD2A8', '--fg': '#FF8001', padding: 0, minHeight: 48 } as React.CSSProperties}
            >
              <Icon name="arrowRight" size={22} />
            </button>
          </div>
        </div>

        {/* Bottom Listo button */}
        <div className="w-full flex items-center justify-center pb-5 sm:pb-7 z-20 px-4">
          <PrimaryActionButton onClick={() => dispatch({ type: 'SIGN_DONE' })} />
        </div>
      </Screen>
    )
  }
  return (
    <Screen bg="#BCEDFF">
      <SkyHills />
      <GameHeader />
      <div className="absolute top-[212px] left-5 w-[350px]">
        {writer === 'papa' && <p className="mb-3 text-center font-display text-[18px] font-medium text-white drop-shadow-[0_2px_0_rgba(0,123,185,.55)]">Escribe lo que deletrea tu hijo</p>}
        {writer === 'nino' && <p className="mb-3 flex justify-center"><Avatar who="nino" size={44} halo /></p>}
        <WriteBoard />
      </div>
    </Screen>
  )
}

/* ============================== S22 · Eclosión / crecimiento ============================== */

function CategoryIcon({ id, size = 22 }: { id: ModuleId; size?: number }) {
  if (id === 1) {
    return <span className="font-display text-[18px] sm:text-[20px] font-black leading-none text-[#8A3FC4]">Aa</span>
  }
  if (id === 2) {
    return <Icon name="drop" size={size} color="#FFFFFF" solid />
  }
  if (id === 3) {
    return <span className="font-display text-[22px] sm:text-[24px] font-black leading-none text-white">1</span>
  }
  if (id === 4) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden>
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2z" />
      </svg>
    )
  }
  if (id === 5) {
    return <Icon name="pencil" size={size} color="#FFFFFF" solid />
  }
  return null
}

function getCategoryPillColors(id: ModuleId) {
  switch (id) {
    case 1:
      return { circleBg: '#E7B3FF', titleColor: '#D06BFF' }
    case 2:
      return { circleBg: '#FF4F1A', titleColor: '#FF4F1A' }
    case 3:
      return { circleBg: '#38B6FF', titleColor: '#38B6FF' }
    case 4:
      return { circleBg: '#73D83A', titleColor: '#369C00' }
    case 5:
      return { circleBg: '#C48243', titleColor: '#884E17' }
    default:
      return { circleBg: '#38B6FF', titleColor: '#38B6FF' }
  }
}

export function HatchScreen() {
  const { s, dispatch } = useGame()
  const m = MODULES[s.level]
  const final = m.id === 5
  const next = Math.min(5, m.stage + 1)
  const [phase, setPhase] = useState<'crack' | 'reveal'>('crack')
  usePausedTimeout(() => setPhase('reveal'), 2800, phase === 'crack', [s.fx.key])

  // Master seals obtained in the current completed category
  const levelMasterCount = s.masterSeals && s.masterSeals.length > 0
    ? s.masterSeals.filter((item) => m.contents.includes(item)).length
    : s.masterCount
  // Learned count in the current completed category
  const levelLearnedCount = (s.learned[m.id] ?? []).length > 0
    ? (s.learned[m.id] ?? []).length
    : Math.max(1, (s.learned[s.level] ?? []).length)
  // Hatch screen is ALWAYS vibrant orange with reddish-orange base pedestal across ALL levels
  const bgColor = '#FF8001'
  const baseColor = '#FF4F1A'
  const stageName = final ? 'Spike llegó a ser adulto' : (STAGES[next - 1] ?? 'Bebé')
  const pillColors = getCategoryPillColors(m.id)

  return (
    <Screen bg={bgColor} className="relative flex h-full w-full flex-col justify-between overflow-hidden select-none">
      {/* Sunburst rays behind egg */}
      <div className="pointer-events-none absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden" aria-hidden>
        <img
          src="/assets/rays.png"
          alt=""
          draggable={false}
          className="size-[850px] max-w-none object-cover opacity-35 mix-blend-screen pointer-events-none"
        />
      </div>

      {/* Close button X (top-left circular white button, dispatches HATCH_CONTINUE) */}
      <button
        type="button"
        aria-label="Cerrar y continuar"
        onClick={() => dispatch({ type: 'HATCH_CONTINUE' })}
        className="btn3d absolute left-4 sm:left-5 z-50 grid size-[46px] sm:size-[48px] place-items-center rounded-full"
        style={{
          '--bg': '#FFFFFF',
          '--edge': '#FFD2A8',
          '--fg': '#FF8001',
          padding: 0,
          minHeight: 46,
          top: 'calc(1.35rem + env(safe-area-inset-top, 0px))',
        } as React.CSSProperties}
      >
        <Icon name="close" size={22} solid color="#FF8001" />
      </button>

      {/* Top Level Complete Pill with category icon (Figma 610:4850 & Reference Image 1) */}
      <div
        className="card-in absolute top-[calc(2.25rem+env(safe-area-inset-top,0px))] sm:top-[calc(2.5rem+env(safe-area-inset-top,0px))] left-1/2 -translate-x-1/2 z-40 flex h-[54px] sm:h-[58px] items-center gap-3 sm:gap-3.5 rounded-full bg-white pl-2 pr-6 sm:pl-2.5 sm:pr-7 shadow-[0_4px_16px_rgba(0,0,0,0.12)] select-none"
      >
        <div
          data-category-icon
          className="category-disc grid size-10 sm:size-11 place-items-center rounded-full shrink-0 shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
          style={{ backgroundColor: pillColors.circleBg }}
        >
          <CategoryIcon id={m.id} size={22} />
        </div>
        <div className="flex flex-col justify-center leading-none">
          <span
            className="font-display text-[18px] sm:text-[21px] font-black leading-tight tracking-tight"
            style={{ color: pillColors.titleColor }}
          >
            Nivel {m.id}
          </span>
          <span className="font-sans text-[12px] sm:text-[13px] font-medium text-[#737373] mt-0.5 leading-none">
            Completo
          </span>
        </div>
      </div>

      {phase === 'crack' ? (
        <div className="relative z-20 flex h-full w-full flex-col items-center justify-center pt-16">
          <h1 className="font-display text-[44px] sm:text-[50px] leading-[52px] font-bold text-white drop-shadow-[0_4px_0_rgba(0,0,0,.14)] text-center">
            {final ? '¡Último reto!' : '¡Casi sale!'}
          </h1>
          <div className="relative mt-8 egg-tremble" style={{ filter: 'drop-shadow(0 0 24px rgba(255,255,255,0.75))' }}>
            <Spike stage={m.stage} mood="restless" size={260} animate={false} />
          </div>
        </div>
      ) : (
        <div className="relative z-20 flex flex-col h-full w-full justify-between items-center">
          {/* Top Title Area: enlarged title centered */}
          <div className="flex w-full flex-col items-center pt-[calc(5.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(6rem+env(safe-area-inset-top,0px))] px-4 text-center shrink-0 z-30">
            <h1 className="hatch-pop font-display text-[46px] sm:text-[54px] leading-tight font-black text-white drop-shadow-[0_3px_8px_rgba(0,0,0,.22)]">
              {final ? '¡Terminaste todo!' : '¡Eclosionó!'}
            </h1>
          </div>

          {/* Central Area: Dino resting on top of the extended pedestal, with stageName immediately above its head */}
          <div className="relative flex flex-1 items-end justify-center w-full z-30 pb-0">
            <div className="relative flex flex-col items-center -mb-12 sm:-mb-16">
              {/* Stage Name right above dino head */}
              <span className="font-sans text-[20px] sm:text-[23px] font-bold text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.18)] mb-2 sm:mb-2.5 tracking-wide">
                {stageName}
              </span>

              {/* Pedestal shadow directly beneath the dino */}
              <div
                className="absolute bottom-2 w-[180px] sm:w-[210px] h-[22px] rounded-[50%] bg-black/20 blur-[3px] z-0 pointer-events-none"
                aria-hidden
              />
              <Spike
                stage={next}
                mood="happy"
                size={270}
                className="hatch-pop relative z-10 filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.22)] select-none pointer-events-none max-h-[38vh]"
              />
            </div>
          </div>

          {/* Bottom Pedestal Base (#FF4F1A, ref 691 × 825) - Taller, extends higher behind Dino */}
          <div
            className="relative z-20 w-[88%] max-w-[348px] sm:max-w-[364px] mx-auto flex flex-col items-center rounded-t-[32px] sm:rounded-t-[36px] pt-16 sm:pt-20 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] px-3 sm:px-3.5 shadow-[0_-8px_32px_rgba(0,0,0,0.2)] shrink-0 bg-[#FF4F1A] min-h-[40vh] sm:min-h-[44vh]"
            style={{ backgroundColor: baseColor }}
          >
            <div className="flex w-full gap-2.5 sm:gap-3 items-center justify-center">
              {/* Sellos de maestro card (ref: 257 × 216) with enlarged numbers and icons */}
              <div
                className="flex flex-1 flex-col items-center justify-center rounded-[24px] sm:rounded-[28px] bg-[#FDFDFE] border-[2.5px] border-[#FF8001] py-4 sm:py-5 px-2 sm:px-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)] aspect-[257/216]"
              >
                <div className="flex items-center justify-center gap-2 font-display text-[42px] sm:text-[48px] leading-none font-black text-[#4A5A8C]">
                  <CountUp value={levelMasterCount} />
                  <img src="/art/spike-medal.png" alt="" className="size-9 sm:size-11 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.14)]" />
                </div>
                <span className="font-sans text-[12px] sm:text-[13px] font-black text-[#6A7187] mt-1.5 text-center leading-tight tracking-tight">
                  Sellos de maestro
                </span>
              </div>

              {/* Aprendidos card with unified flame icon (ref: 257 × 216) with enlarged numbers and icons */}
              <div
                className="flex flex-1 flex-col items-center justify-center rounded-[24px] sm:rounded-[28px] bg-[#FDFDFE] border-[2.5px] border-[#FF8001] py-4 sm:py-5 px-2 sm:px-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)] aspect-[257/216]"
              >
                <div className="flex items-center justify-center gap-2 font-display text-[42px] sm:text-[48px] leading-none font-black text-[#4A5A8C]">
                  <CountUp value={levelLearnedCount} />
                  <span className="text-[36px] sm:text-[42px] leading-none select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.14)]" aria-hidden="true">🔥</span>
                </div>
                <span className="font-sans text-[12px] sm:text-[13px] font-black text-[#6A7187] mt-1.5 text-center leading-tight tracking-tight">
                  Aprendidos
                </span>
              </div>
            </div>
          </div>

          {/* Floating Navigation Bar */}
          <NavBar />
        </div>
      )}
    </Screen>
  )
}
