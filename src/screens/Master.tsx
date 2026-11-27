import { useState, useRef, useEffect } from 'react'
import { useGame } from '../game/context'
import { ALPHABET, MODULES, STAGES, plainLetters, type ModuleId, type Person } from '../game/data'
import { boxControls, countTotalLearned, current, interpreter, signer, teacherMode, teacherOf, teacherPicker } from '../game/engine'
import { CloudsBlue } from '../art/CloudsBlue'
import { CloudsOrange } from '../art/CloudsOrange'
import { LevelRays } from '../art/LevelRays'
import { SkyHills } from '../art/SkyHills'
import { Avatar, BackArrowButton, Btn, Dock, GameHeader, InstructionStrip, ListoBtn, ModuleBadge, NavBar, PrimaryActionButton, ProgressBar, Screen, Sparkles, Spike, XButton, CountUp, usePausedTimeout } from '../components/ui'
import { Badge, Icon, Pictogram, hasPictogram } from '../components/glyphs'
import { ContentBig, GuessScreen, HelpButton, OptionCard } from './Play'

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

/**
 * Pantalla que aparece durante la reproducción del video en los modos Maestro y Niño.
 * Figma 817:2936 ("Padre hace seña") / Modo Niño.
 */
export function MasterVideoScreen({
  who,
  onDone,
}: {
  who: Person
  onDone?: () => void
}) {
  const { s, dispatch } = useGame()
  const c = current(s)
  const isPapa = who === 'papa'
  const m = MODULES[s.level]
  const total = m.challenges.length
  const currentIdx = Math.min(total, s.casilla - m.first + 1)

  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlayToggle = () => {
    if (videoRef.current && videoRef.current.currentSrc) {
      if (playing) {
        videoRef.current.pause()
        setPlaying(false)
      } else {
        videoRef.current
          .play()
          .then(() => setPlaying(true))
          .catch(() => setPlaying(true))
      }
    } else {
      setPlaying((prev) => !prev)
    }
  }

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden select-none bg-[#E7B3FF]">
      {/* 2. Botón de cerrar (X) en la esquina superior izquierda */}
      <XButton />

      {/* Top Header: Graduation Cap + Horizontal Segmented Progress Bar + Instruction Strip */}
      <div className="relative z-20 flex flex-col items-center pt-[calc(1.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(2rem+env(safe-area-inset-top,0px))] w-full px-4">
        {/* 3. Icono de graduación en la parte superior */}
        <div className="w-[50px] sm:w-[56px] aspect-[147/123] flex items-center justify-center drop-shadow-sm pointer-events-none select-none">
          <img
            src="/assets/teacher-cap.svg"
            alt=""
            className="size-full object-contain"
          />
        </div>

        {/* 4. Barra de progreso horizontal de exactamente 2 intentos */}
        <ProgressBar isMaster={true} masterLoops={s.teacherLoops} className="mt-2.5 sm:mt-3" />

        {/* 5. Indicador del tipo de actividad:
            - Padre maestro: "Padre hace seña - niño adivina"
            - Niño maestro: "Niño hace seña - padre adivina" */}
        <InstructionStrip
          signer={who}
          guesser={isPapa ? 'nino' : 'papa'}
          action={s.level === 5 ? 'escribe' : 'adivina'}
          className="mt-4 sm:mt-5 shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
        />
      </div>

      {/* Center: Card with perched avatar & helper text */}
      <div className="my-auto mx-auto w-full max-w-[340px] sm:max-w-[356px] px-4 pt-8 sm:pt-10 z-10 flex flex-col items-center">
        {/* 7. Tarjeta blanca con bordes redondeados */}
        <div className="relative w-full rounded-[34px] sm:rounded-[36px] bg-white px-4 pt-12 pb-5 sm:px-5 sm:pt-14 sm:pb-6 shadow-[0_16px_36px_rgba(112,40,160,0.14)] flex flex-col items-center">
          {/* 6. Avatar de los personajes sobre el borde superior */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2">
            <div
              className={`relative size-[76px] sm:size-[80px] overflow-hidden rounded-full border-[6px] border-white flex items-end justify-center shadow-[0_4px_14px_rgba(0,0,0,0.12)] ${
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

          {/* 8. Video de la seña con proporción adecuada y botón de reproducción */}
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

          {/* 9. Recuadro morado claro que muestra la letra correspondiente */}
          <div className="mt-3.5 sm:mt-4 w-full h-[52px] sm:h-[58px] rounded-[24px] sm:rounded-[26px] bg-[#E7B3FF] flex items-center justify-center shadow-[inset_0_-2px_0_rgba(191,94,235,0.25)]">
            <span
              className="font-sans font-black text-[#BF5EEB] leading-none text-[32px] sm:text-[36px]"
            >
              {c.kind === 'number' ? (c.digit ?? c.content) : c.content}
            </span>
          </div>
        </div>

        {/* 10. Texto de ayuda debajo de la tarjeta */}
        <div className="mt-4 sm:mt-5 flex items-center justify-center gap-2.5 text-white text-[17px] sm:text-[19px] font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)] select-none">
          <Icon name="hand" size={24} color="#FFFFFF" solid />
          <span>{isPapa ? 'Enséñale a tu hijo' : 'Enséñale a tu padre'}</span>
        </div>
      </div>

      {/* 11. Botón naranja inferior con el icono de check y el texto "Listo" */}
      <div className="w-full flex items-center justify-center pb-5 sm:pb-7 z-20 px-4">
        <ListoBtn onClick={onDone ?? (() => dispatch({ type: 'TEACHER_NEXT' }))} />
      </div>
    </div>
  )
}

export function MasterScreen() {
  const { s, dispatch } = useGame()
  const master = teacherOf(s)
  const mode = teacherMode(s)
  const show = s.teacherPhase === 'show'

  if (show) {
    if (mode === 'write') {
      return <WriteScreen isMasterMode={true} />
    }
    return <MasterVideoScreen who={master} onDone={() => dispatch({ type: 'TEACHER_NEXT' })} />
  }

  // teacherPhase === 'retry'
  if (mode === 'write') {
    return <WriteScreen isMasterMode={true} />
  }

  return <GuessScreen isMasterMode={true} />
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

/** Illustrated Mamá character matching Figma 659:1601 */
export function MamaCharacter({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Mamá" className="select-none pointer-events-none shrink-0">
      {/* Back wavy hair */}
      <path
        d="M26 62C22 52 24 38 34 26C42 16 52 14 60 14C68 14 78 16 86 26C96 38 98 52 94 62C91 69 95 78 90 86C86 92 80 94 76 94L44 94C40 94 34 92 30 86C25 78 29 69 26 62Z"
        fill="#8C532B"
      />
      {/* Pink Blouse */}
      <path
        d="M34 92C34 82 46 76 60 76C74 76 86 82 86 92C86 102 34 102 34 92Z"
        fill="#F46083"
      />
      {/* Neck */}
      <rect x="53" y="66" width="14" height="15" rx="7" fill="#FAD0B1" />
      {/* Head */}
      <circle cx="60" cy="50" r="21" fill="#FAD0B1" />
      {/* White Pearl Earrings */}
      <circle cx="38" cy="53" r="3.5" fill="#FFFFFF" />
      <circle cx="82" cy="53" r="3.5" fill="#FFFFFF" />
      {/* Front Hair Bangs */}
      <path
        d="M39 42C44 32 52 36 60 41C68 36 76 32 81 42C79 30 70 24 60 24C50 24 41 30 39 42Z"
        fill="#8C532B"
      />
      {/* Cheerful White Smile */}
      <path
        d="M52 54C52 60 68 60 68 54Z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

export function getLetterBank(word: string): string[] {
  const target = plainLetters(word)
  if (word === 'MAMÁ' || word === 'MAMA') {
    return ['A', 'E', 'I', 'O', 'M', 'P', 'D', 'N']
  }
  const defaultRow1 = ['A', 'E', 'I', 'O']
  const defaultRow2 = ['M', 'P', 'D', 'N']
  const unique = Array.from(new Set(target))

  // Separate unique target letters into vowels and consonants
  const targetVowels = unique.filter((l) => ['A', 'E', 'I', 'O', 'U'].includes(l))
  const targetConsonants = unique.filter((l) => !['A', 'E', 'I', 'O', 'U'].includes(l))

  // Build row 1 (vowels preferred)
  const row1 = [...targetVowels]
  for (const v of defaultRow1) {
    if (!row1.includes(v) && row1.length < 4) row1.push(v)
  }
  while (row1.length < 4) {
    const extra = ['U', 'Y'].find((l) => !row1.includes(l)) || 'A'
    row1.push(extra)
  }

  // Build row 2 (consonants)
  const row2 = [...targetConsonants]
  for (const c of defaultRow2) {
    if (!row2.includes(c) && !row1.includes(c) && row2.length < 4) row2.push(c)
  }
  const fallbackConsonants = ['S', 'L', 'R', 'T', 'B', 'C', 'G']
  for (const fc of fallbackConsonants) {
    if (row2.length >= 4) break
    if (!row2.includes(fc) && !row1.includes(fc)) row2.push(fc)
  }
  return [...row1.slice(0, 4), ...row2.slice(0, 4)]
}

/** Interactive drag-and-drop letter slots board matching Figma 659:1467 */
export function ChildWriteSlotsBoard() {
  const { s, dispatch } = useGame()
  const c = current(s)
  const targetLetters = plainLetters(c.content)
  const [slots, setSlots] = useState<(string | null)[]>(() => Array(targetLetters.length).fill(null))
  const [activeSlot, setActiveSlot] = useState(0)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const bank = getLetterBank(c.content)

  // Floating drag preview state for touch & pointer drag
  const [dragState, setDragState] = useState<{
    letter: string
    x: number
    y: number
  } | null>(null)
  const dragStartRef = useRef<{ x: number; y: number; letter: string; moved: boolean } | null>(null)

  // Reset slots when challenge content changes
  useEffect(() => {
    setSlots(Array(targetLetters.length).fill(null))
    setActiveSlot(0)
    setIsSuccess(false)
    setIsError(false)
  }, [c.content])

  const placeLetterAt = (index: number, letter: string) => {
    if (index < 0 || index >= targetLetters.length) return
    const nextSlots = [...slots]
    nextSlots[index] = letter
    setSlots(nextSlots)

    // Advance active slot to next empty slot
    const nextEmpty = nextSlots.findIndex((s, idx) => idx > index && s === null)
    if (nextEmpty !== -1) {
      setActiveSlot(nextEmpty)
    } else {
      const anyEmpty = nextSlots.findIndex((s) => s === null)
      setActiveSlot(anyEmpty !== -1 ? anyEmpty : index)
    }

    // Check completion
    if (nextSlots.every((s) => s !== null)) {
      const entered = nextSlots.join('')
      const target = targetLetters.join('')
      if (entered === target) {
        setIsSuccess(true)
        setIsError(false)
        dispatch({ type: 'SET_TYPED', typed: nextSlots as string[] })
        setTimeout(() => {
          dispatch({ type: 'CHECK' })
        }, 850)
      } else {
        setIsError(true)
        setTimeout(() => setIsError(false), 900)
      }
    }
  }

  const handleLetterTap = (letter: string) => {
    if (dragStartRef.current?.moved) return
    // Target slot: active slot if empty, or first empty slot
    let targetIdx = activeSlot
    if (targetIdx >= targetLetters.length || slots[targetIdx] !== null) {
      const firstEmpty = slots.findIndex((s) => s === null)
      if (firstEmpty !== -1) {
        targetIdx = firstEmpty
      }
    }
    placeLetterAt(targetIdx, letter)
  }

  const handleSlotTap = (index: number) => {
    if (slots[index] !== null) {
      // Remove letter from slot and make it active
      const nextSlots = [...slots]
      nextSlots[index] = null
      setSlots(nextSlots)
      setActiveSlot(index)
      setIsSuccess(false)
      setIsError(false)
    } else {
      setActiveSlot(index)
    }
  }

  const handlePointerDown = (e: React.PointerEvent, letter: string) => {
    if (e.button !== 0) return
    dragStartRef.current = { x: e.clientX, y: e.clientY, letter, moved: false }
  }

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!dragStartRef.current) return
      const dx = Math.abs(e.clientX - dragStartRef.current.x)
      const dy = Math.abs(e.clientY - dragStartRef.current.y)
      if (!dragStartRef.current.moved && (dx > 6 || dy > 6)) {
        dragStartRef.current.moved = true
      }
      if (dragStartRef.current.moved) {
        setDragState({
          letter: dragStartRef.current.letter,
          x: e.clientX,
          y: e.clientY,
        })
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (!dragStartRef.current) return
      const { moved, letter } = dragStartRef.current
      dragStartRef.current = null
      setDragState(null)

      if (moved) {
        const el = document.elementFromPoint(e.clientX, e.clientY)
        const slotEl = el?.closest('[data-slot-index]')
        if (slotEl) {
          const slotIdx = Number(slotEl.getAttribute('data-slot-index'))
          if (!isNaN(slotIdx)) {
            placeLetterAt(slotIdx, letter)
          }
        }
      }
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }
  }, [slots, activeSlot, targetLetters])

  const handleHtmlDragStart = (e: React.DragEvent, letter: string) => {
    e.dataTransfer.setData('text/plain', letter)
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleHtmlDrop = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault()
    const letter = e.dataTransfer.getData('text/plain')
    if (letter) {
      placeLetterAt(slotIdx, letter)
    }
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Top target letter slots */}
      <div className="flex justify-center items-center gap-2.5 sm:gap-3.5 mb-8 sm:mb-10 w-full" aria-label="Casillas de la palabra">
        {targetLetters.map((_, k) => {
          const isActive = activeSlot === k
          const char = slots[k]
          return (
            <button
              key={k}
              type="button"
              data-slot-index={k}
              onClick={() => handleSlotTap(k)}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'copy'
              }}
              onDrop={(e) => handleHtmlDrop(e, k)}
              aria-label={`Casilla ${k + 1}${char ? `: ${char}` : ' vacía'}`}
              className={`relative grid size-[66px] sm:size-[74px] md:size-[78px] place-items-center rounded-[20px] bg-white transition-all duration-200 cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.06)] ${
                isSuccess
                  ? 'border-[3px] border-[#73D83A] shadow-[0_0_12px_rgba(115,216,58,0.35)]'
                  : isError
                  ? 'border-[3px] border-[#FF4F1A] shadow-[0_0_12px_rgba(255,79,26,0.35)] shake'
                  : isActive
                  ? 'border-[3px] border-[#C48243]'
                  : 'border-[3px] border-transparent'
              }`}
            >
              {char ? (
                <span className="font-sans font-black text-[34px] sm:text-[38px] text-[#4E596F] leading-none select-none pop">
                  {char}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* 4x2 Letter Bank Cards (Figma 659:1467) */}
      <div className="grid grid-cols-4 gap-3 sm:gap-3.5 md:gap-4 justify-items-center w-full max-w-[340px] sm:max-w-[360px]">
        {bank.map((letter, idx) => (
          <button
            key={idx}
            type="button"
            draggable
            onDragStart={(e) => handleHtmlDragStart(e, letter)}
            onPointerDown={(e) => handlePointerDown(e, letter)}
            onClick={() => handleLetterTap(letter)}
            aria-label={`Letra ${letter}`}
            className="btn3d touch-none size-[64px] sm:size-[72px] md:size-[76px] rounded-[20px] bg-white font-sans font-black text-[32px] sm:text-[36px] text-[#4E596F] select-none cursor-pointer active:scale-95 transition-transform flex items-center justify-center shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
            style={{
              '--bg': '#FFFFFF',
              '--edge': '#E5E9F2',
              '--fg': '#4E596F',
              minHeight: 64,
              padding: 0,
            } as React.CSSProperties}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Floating Drag Preview for Touch / Pointer Dragging */}
      {dragState && (
        <div
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2 size-[68px] sm:size-[76px] rounded-[20px] bg-white shadow-2xl flex items-center justify-center font-sans font-black text-[34px] text-[#4E596F] scale-110 border-2 border-[#C48243]"
          style={{ left: dragState.x, top: dragState.y }}
        >
          {dragState.letter}
        </div>
      )}

      {/* Canonical Help Button: "No entendí" */}
      <div className="mt-7 sm:mt-9 flex justify-center">
        <HelpButton />
      </div>
    </div>
  )
}

export function WriteScreen({ isMasterMode = false }: { isMasterMode?: boolean } = {}) {
  const { s, dispatch } = useGame()
  const c = current(s)
  const isMaster = isMasterMode || s.screen === 'master'
  const isShowPhase = isMaster ? s.teacherPhase === 'show' : s.write.stage === 'sign'
  const letters = plainLetters(c.content)
  const spellBy = signer(c.round)
  const master = teacherOf(s)
  const picker = teacherPicker(s)

  // Video playback state for stage 'sign'
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlayToggle = () => {
    if (videoRef.current && videoRef.current.currentSrc) {
      if (playing) {
        videoRef.current.pause()
        setPlaying(false)
      } else {
        videoRef.current
          .play()
          .then(() => setPlaying(true))
          .catch(() => setPlaying(true))
      }
    } else {
      setPlaying((prev) => !prev)
    }
  }

  if (isShowPhase) {
    return (
      <Screen bg={isMaster ? '#E7B3FF' : '#BCEDFF'} className={`relative flex h-full w-full flex-col justify-between overflow-hidden select-none ${isMaster ? 'bg-[#E7B3FF]' : ''}`}>
        {!isMaster && (
          <>
            {/* Continuous sky gradient */}
            <div className="absolute inset-0 bg-linear-to-b from-[#0095FF] via-[#45C1FF] via-[35%] to-[#BCEDFF]" />
            {/* Standard outdoor landscape ground */}
            <SkyHills />
          </>
        )}
        {/* Top Close Button (XButton used in all screens) */}
        <XButton />

        {/* Top Header */}
        <div className="relative z-20 flex flex-col items-center pt-[calc(1.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(2rem+env(safe-area-inset-top,0px))]">
          {isMaster ? (
            <div className="w-[50px] sm:w-[56px] aspect-[147/123] flex items-center justify-center drop-shadow-sm pointer-events-none select-none">
              <img
                src="/assets/teacher-cap.svg"
                alt=""
                className="size-full object-contain"
              />
            </div>
          ) : (
            <ModuleBadge id={5} size={50} />
          )}

          {/* Segmented Progress Bar */}
          <ProgressBar isMaster={isMaster} masterLoops={s.teacherLoops} className="mt-2.5 sm:mt-3" />

          {/* Canonical Instruction Strip: Padre hace seña - niño escribe */}
          <InstructionStrip
            signer={isMaster ? master : undefined}
            guesser={isMaster ? picker : undefined}
            round={isMaster ? undefined : c.round}
            action="escribe"
            className="mt-4 sm:mt-5 shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
          />
        </div>

        {/* Central Area: White Card + Nav controls below */}
        <div className="my-auto mx-auto w-full max-w-[340px] sm:max-w-[356px] px-3 z-20 flex flex-col items-center">
          {/* Main White Card with rounded corners */}
          <div className="w-full rounded-[34px] sm:rounded-[38px] bg-white px-5 sm:px-6 pt-6 sm:pt-7 pb-6 sm:pb-7 shadow-[0_16px_36px_rgba(0,0,0,0.12)] flex flex-col items-center">
            {/* Word: Active letter in brown rounded square, others in slate bold */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5 pb-4 sm:pb-5">
              {c.content.split('').map((char, k) => {
                const isActive = k === s.write.letter
                if (isActive) {
                  return (
                    <span
                      key={k}
                      className="grid size-[54px] sm:size-[60px] place-items-center rounded-[16px] sm:rounded-[18px] bg-[#C48243] font-sans font-black text-[34px] sm:text-[38px] text-white shadow-sm leading-none"
                    >
                      {char}
                    </span>
                  )
                }
                return (
                  <span
                    key={k}
                    className="font-sans font-black text-[34px] sm:text-[38px] text-[#4E596F] px-1 sm:px-1.5 leading-none"
                  >
                    {char}
                  </span>
                )
              })}
            </div>

            {/* Horizontal Composition: Character Illustration on left + Playable Video on right */}
            <div className="flex items-center justify-between w-full gap-3 pt-1">
              {/* Left: Illustrated Character */}
              <div className="flex-1 flex items-center justify-center">
                {c.content === 'MAMÁ' ? (
                  <MamaCharacter size={128} />
                ) : hasPictogram(c.content) ? (
                  <Pictogram content={c.content} size={110} />
                ) : (
                  <Avatar who={spellBy} size={104} />
                )}
              </div>

              {/* Right: Playable Signing Video with rounded corners and play button overlay */}
              <div className="relative flex-1 aspect-[4/3] rounded-[22px] overflow-hidden bg-[#EAF1F8] shadow-inner flex items-center justify-center">
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
                    className="btn3d grid size-12 sm:size-14 place-items-center rounded-full transition-transform active:scale-95 cursor-pointer shadow-[0_6px_18px_rgba(0,0,0,0.22)]"
                    style={{ '--bg': '#fff', '--edge': '#FFD2A8', '--fg': '#FF8001', padding: 0 } as React.CSSProperties}
                  >
                    <Icon
                      name={playing ? 'pause' : 'play'}
                      size={24}
                      solid
                      color="#FF8001"
                      className={playing ? '' : 'translate-x-0.5'}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Below Card: Left arrow + Letra por letra capsule + Right arrow */}
          <div className="mt-4 sm:mt-5 flex items-center justify-center gap-3 select-none">
            <button
              type="button"
              aria-label="Letra anterior"
              disabled={s.write.letter === 0}
              onClick={() => dispatch({ type: 'LETTER_STEP', dir: -1 })}
              className="grid size-11 sm:size-12 place-items-center rounded-full bg-[#E0F2FE] text-[#0284C7] shadow-sm active:scale-95 disabled:opacity-30 cursor-pointer transition-all"
            >
              <Icon name="chevronLeft" size={22} solid color="#0284C7" />
            </button>

            <div className="flex h-11 sm:h-12 items-center gap-2 rounded-full bg-white px-5 sm:px-6 shadow-[0_4px_14px_rgba(74,90,140,0.1)] border border-[#E8ECF4]">
              <Icon name="hand" size={20} color="#4E596F" solid />
              <span className="font-sans text-[15px] sm:text-[16px] font-bold text-[#4E596F]">
                Letra por letra
              </span>
            </div>

            <button
              type="button"
              aria-label="Letra siguiente"
              disabled={s.write.letter === letters.length - 1}
              onClick={() => dispatch({ type: 'LETTER_STEP', dir: 1 })}
              className="grid size-11 sm:size-12 place-items-center rounded-full bg-[#E0F2FE] text-[#0284C7] shadow-sm active:scale-95 disabled:opacity-30 cursor-pointer transition-all"
            >
              <Icon name="chevronRight" size={22} solid color="#0284C7" />
            </button>
          </div>
        </div>

        {/* Bottom Orange Listo button */}
        <div className="w-full flex items-center justify-center pb-6 sm:pb-8 z-20 px-4">
          <ListoBtn onClick={() => dispatch(isMaster ? { type: 'TEACHER_NEXT' } : { type: 'SIGN_DONE' })} />
        </div>
      </Screen>
    )
  }

  // stage === 'write' / teacherPhase === 'retry': "El niño escribe"
  return (
    <Screen bg={isMaster ? '#E7B3FF' : '#BCEDFF'} className={`relative flex h-full w-full flex-col justify-between overflow-hidden select-none ${isMaster ? 'bg-[#E7B3FF]' : ''}`}>
      {!isMaster && (
        <>
          {/* Continuous sky gradient */}
          <div className="absolute inset-0 bg-linear-to-b from-[#0095FF] via-[#45C1FF] via-[35%] to-[#BCEDFF]" />
          {/* Standard outdoor landscape ground */}
          <SkyHills />
        </>
      )}
      {/* Top Close Button (XButton used in all screens) */}
      <XButton />

      {/* Top Header */}
      <div className="relative z-20 flex flex-col items-center pt-[calc(1.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(2rem+env(safe-area-inset-top,0px))]">
        {isMaster ? (
          <div className="w-[50px] sm:w-[56px] aspect-[147/123] flex items-center justify-center drop-shadow-sm pointer-events-none select-none">
            <img
              src="/assets/teacher-cap.svg"
              alt=""
              className="size-full object-contain"
            />
          </div>
        ) : (
          <ModuleBadge id={5} size={50} />
        )}

        {/* Segmented Progress Bar */}
        <ProgressBar isMaster={isMaster} masterLoops={s.teacherLoops} className="mt-2.5 sm:mt-3" />

        {/* Canonical Instruction Strip: Padre hace seña - niño escribe */}
        <InstructionStrip
          signer={isMaster ? master : undefined}
          guesser={isMaster ? picker : undefined}
          round={isMaster ? undefined : c.round}
          action="escribe"
          className="mt-4 sm:mt-5 shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
        />
      </div>

      {/* Main Drag-and-Drop / Interactive Letter Slots Area */}
      <div className="my-auto mx-auto w-full max-w-[356px] sm:max-w-[380px] px-3 z-20 flex flex-col items-center">
        <ChildWriteSlotsBoard />
      </div>

      {/* Bottom spacer / padding */}
      <div className="pb-6 sm:pb-8 z-10" />
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
          {/* Top Title Area: lowered and enlarged title centered with ample breathing room from top pill */}
          <div className="flex w-full flex-col items-center pt-[calc(7.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(8rem+env(safe-area-inset-top,0px))] px-4 text-center shrink-0 z-30">
            <h1 className="hatch-pop font-display text-[50px] sm:text-[58px] leading-tight font-black text-white drop-shadow-[0_3px_8px_rgba(0,0,0,.22)]">
              {final ? '¡Terminaste todo!' : '¡Eclosionó!'}
            </h1>
          </div>

          {/* Central Area: Dino resting on top of the extended pedestal, with stageName immediately above its head */}
          <div className="relative flex flex-1 items-end justify-center w-full z-30 pb-0">
            <div className="relative flex flex-col items-center -mb-12 sm:-mb-16">
              {/* Stage Name right above dino head in regular non-bold typography */}
              <span className="font-sans text-[20px] sm:text-[23px] font-normal text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.18)] mb-2 sm:mb-2.5 tracking-wide">
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
