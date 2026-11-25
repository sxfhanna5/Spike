import { useEffect, useLayoutEffect, useReducer, useRef, useState, type ReactNode, type RefObject } from 'react'
import { ALPHABET, ROUND_INFO, ROLE_COLOR } from './game/data'
import { DEMO_STEPS, SCREENS, disconnectedSheet, isPlay, loadState, reducer, reviewerHint, roundOf, saveState, type Screen as ScreenName, type ScreenId } from './game/engine'
import { GameContext } from './game/context'
import { isPaused } from './game/engine'
import { EggBox } from './components/EggBox'
import { useEggSync } from './egg/useEggSync'
import { Phone } from './components/Phone'
import { Icon, IconDefs, Shape } from './components/glyphs'
import { Avatar } from './components/ui'
import { Connect, Loader, Login, Register, Welcome } from './screens/Entry'
import { TutorialKid, TutorialParent } from './screens/Tutorials'
import { MapScreen } from './screens/MapScreen'
import { AlmostScreen, GoodScreen, GuessScreen, IntroCard, SignScreen } from './screens/Play'
import { HatchScreen, MasterScreen, WriteScreen } from './screens/Master'
import { Album, Investigator, Profile } from './screens/Hub'
import { DisconnectedSheet, ExitSheet, ModuleSheet, RetoSheet, TutorialsSheet } from './screens/Sheets'

const VIEWS: Record<ScreenName, () => ReactNode> = {
  loader: Loader, welcome: Welcome, login: Login, register: Register, connect: Connect,
  tutorialKid: TutorialKid, tutorialParent: TutorialParent, map: MapScreen, album: Album, profile: Profile, investigator: Investigator,
  sign: SignScreen, guess: GuessScreen, good: GoodScreen, almost: AlmostScreen, master: MasterScreen, write: WriteScreen, hatch: HatchScreen,
}

const STAGE_W = 950
const STAGE_H = 900

function useFit(ref: RefObject<HTMLElement | null>) {
  const [box, setBox] = useState({ w: STAGE_W, h: STAGE_H })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  const scale = Math.min(1.08, (box.w - 32) / STAGE_W, (box.h - 32) / STAGE_H)
  return { scale: Math.max(0.4, scale), ...box }
}

export default function App() {
  const [s, dispatch] = useReducer(reducer, undefined, loadState)
  const mainRef = useRef<HTMLElement>(null)
  const { scale, w, h } = useFit(mainRef)
  const View = VIEWS[s.screen]
  const paused = isPaused(s)
  const play = isPlay(s)
  useEggSync(s, dispatch)

  useEffect(() => saveState(s), [s])

  // Time played: counts seconds while a reto is on screen and the game is not paused.
  useEffect(() => {
    if (!play || paused) return
    const t = window.setInterval(() => dispatch({ type: 'TICK', seconds: 5 }), 5000)
    return () => window.clearInterval(t)
  }, [play, paused])

  // Deep links for reviewers: #S8 opens that screen.
  useEffect(() => {
    const apply = () => {
      const id = location.hash.slice(1).toUpperCase()
      if (SCREENS.some((x) => x.id === id)) dispatch({ type: 'JUMP', screen: id as ScreenId })
    }
    apply()
    addEventListener('hashchange', apply)
    return () => removeEventListener('hashchange', apply)
  }, [])

  // Keyboard mode: 1 2 3 = colours, 4 or ? = «No entendí», letters for Escribir. Esc = exit sheet.
  const stateRef = useRef(s)
  stateRef.current = s
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      const cur = stateRef.current
      if (e.key === 'Escape' && isPlay(cur)) {
        dispatch({ type: 'OVERLAY', overlay: cur.overlay === 'exit' ? null : 'exit' })
        return
      }
      if (!cur.keyboard) return
      if ((e.target as HTMLElement | null)?.tagName === 'INPUT') return
      const k = e.key.toUpperCase()
      if (['1', '2', '3'].includes(k)) dispatch({ type: 'COLOR', index: Number(k) - 1 })
      else if (k === '4' || k === '?') dispatch({ type: 'HELP' })
      else if (e.key === 'Backspace') dispatch({ type: 'ERASE' })
      else if (ALPHABET.includes(k)) dispatch({ type: 'TYPE', letter: k })
    }
    addEventListener('keydown', fn)
    return () => removeEventListener('keydown', fn)
  }, [])

  const round = play ? ROUND_INFO[roundOf(s)] : null
  const actor = s.intro?.who ?? s.facing
  const info = SCREENS.find((x) => x.id === currentId(s.screen))

  return (
    <GameContext.Provider value={{ s, dispatch, paused }}>
      <IconDefs />
      <div className="flex h-screen flex-col overflow-hidden bg-[#EAF6FF] text-ink">
        <header className="flex h-[68px] shrink-0 items-center gap-4 bg-white px-5 shadow-[0_4px_16px_rgba(31,42,68,.06)]">
          <div className="flex items-center gap-3">
            <img src="/spike/3-feliz.svg" alt="" className="h-10 w-10 object-contain" />
            <span className="font-display text-[28px] leading-8 font-bold tracking-wide text-brand">SPIKE</span>
            <span className="hidden font-sans text-[14px] font-bold text-ink2 xl:inline">prototipo navegable · LSC y español en familia</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {play && round && (
              <>
                <span className="flex items-center gap-2 rounded-full py-1 pr-3 pl-1 font-sans text-[14px] font-extrabold text-white" style={{ background: ROLE_COLOR[actor] }}>
                  <Avatar who={actor} size={28} /> Turno del {actor === 'papa' ? 'padre' : 'niño'}
                </span>
                <span className="hidden items-center gap-2 rounded-full bg-[#F1F3F8] px-3 py-1.5 font-sans text-[14px] font-extrabold lg:flex">
                  <Icon name="hand" size={16} /> {round.detail}
                </span>
              </>
            )}
            <span className="rounded-full bg-[#F1F3F8] px-3 py-1.5 font-sans text-[14px] font-bold"><b>{info?.id ?? ''}</b> {info?.name ?? s.screen}</span>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <Sidebar current={currentId(s.screen)} hint={reviewerHint(s)} onJump={(screen) => dispatch({ type: 'JUMP', screen })} onDemo={(step) => dispatch({ type: 'DEMO', step })} />
          <main ref={mainRef} className="relative min-w-0 flex-1 overflow-hidden">
            <div className="absolute top-0 left-0 origin-top-left" style={{ width: STAGE_W, height: STAGE_H, transform: `translate(${Math.max(0, (w - STAGE_W * scale) / 2)}px,${Math.max(12, (h - STAGE_H * scale) / 2)}px) scale(${scale})` }}>
              <div className="flex h-full items-start gap-11">
                <Phone turning={!!s.intro?.arrow}>
                  <View />
                  {s.intro && isPlay(s) && <IntroCard key={`${s.intro.kind}-${s.idx}-${s.intro.who}-${s.screen}-${s.teacherPhase}-${s.teacherLoops}`} />}
                  {s.overlay === 'tutorials' && <TutorialsSheet />}
                  {s.overlay === 'reto' && <RetoSheet />}
                  {s.overlay === 'module' && <ModuleSheet />}
                  {s.overlay === 'exit' && <ExitSheet />}
                  {disconnectedSheet(s) && <DisconnectedSheet />}
                </Phone>
                <div className="h-[868px] w-[492px]"><EggBox /></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </GameContext.Provider>
  )
}

/** Index id that best represents each internal screen. */
function currentId(screen: ScreenName): ScreenId {
  const map: Record<ScreenName, ScreenId> = {
    loader: 'S1', welcome: 'S2', login: 'S3', register: 'S4', connect: 'S5', tutorialKid: 'S6', tutorialParent: 'S7', map: 'S8',
    sign: 'S13', guess: 'S14', good: 'S17', almost: 'S18', master: 'S19', write: 'S21', hatch: 'S22', album: 'S23', profile: 'S24', investigator: 'S25',
  }
  return map[screen]
}

function Sidebar({ current, hint, onJump, onDemo }: { current: ScreenId; hint: string; onJump: (s: ScreenId) => void; onDemo: (n: number) => void }) {
  const h2 = 'mb-2 px-1 font-sans text-[14px] font-black tracking-[.12em] text-ink2 uppercase'
  const groups = [...new Set(SCREENS.map((x) => x.group))]
  return (
    <aside className="flex w-[300px] shrink-0 flex-col gap-5 overflow-y-auto bg-white px-4 py-5 shadow-[4px_0_16px_rgba(31,42,68,.05)]">
      <section className="rounded-[20px] bg-[#F7E8FF] p-4">
        <div className="flex items-center gap-2 font-sans text-[14px] font-black tracking-[.1em] text-[#8A3FC4] uppercase"><Icon name="info" size={18} /> Pista del revisor</div>
        <p className="mt-1.5 font-sans text-[14px] leading-5 font-bold">{hint || 'Elige una pantalla del índice.'}</p>
      </section>

      <section>
        <h2 className={h2}>Recorrido demo</h2>
        <ol className="space-y-1.5">
          {DEMO_STEPS.map((d, k) => (
            <li key={d.title}>
              <button type="button" onClick={() => onDemo(k)} className="group flex w-full items-center gap-3 rounded-[18px] bg-[#F6F8FB] px-3 py-2 text-left transition-colors hover:bg-[#FFF1DD]">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#FFE44C] font-display text-[14px] font-bold">{k + 1}</span>
                <span className="flex flex-1 flex-col"><b className="font-sans text-[14px] leading-tight">{d.title}</b><span className="font-sans text-[14px] leading-tight font-semibold text-ink2">{d.detail}</span></span>
                <Icon name="play" size={14} className="text-ink2 group-hover:text-brand" />
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className={h2}>Índice del prototipo</h2>
        <nav className="flex flex-col gap-3">
          {groups.map((g) => (
            <div key={g}>
              <div className="mb-1 px-2 font-display text-[14px] font-semibold text-brand">{g}</div>
              <div className="flex flex-col gap-0.5">
                {SCREENS.filter((x) => x.group === g).map((sc) => (
                  <button key={sc.id} type="button" onClick={() => onJump(sc.id)} aria-current={sc.id === current ? 'page' : undefined} className={`flex items-center gap-2.5 rounded-[14px] px-2.5 py-1.5 text-left font-sans text-[14px] ${sc.id === current ? 'bg-ink text-white' : 'hover:bg-[#F1F3F8]'}`}>
                    <span className={`w-9 shrink-0 font-black ${sc.id === current ? 'text-[#FFE44C]' : 'text-ink2'}`}>{sc.id}</span>
                    <span className="leading-tight"><b>{sc.name}</b>{sc.note && <small className="block text-[14px] opacity-60">{sc.note}</small>}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </section>

      <section className="rounded-[20px] bg-[#F6F8FB] p-4">
        <h2 className={h2}>Cómo se juega</h2>
        <ul className="space-y-2.5 font-sans text-[14px] leading-5 font-bold">
          <li className="flex items-start gap-2"><span className="flex shrink-0 gap-0.5 pt-0.5"><Avatar who="papa" size={20} /><Avatar who="nino" size={20} /></span>Se turnan: «Padre hace la seña» y «Niño hace la seña».</li>
          <li className="flex items-start gap-2"><span className="flex shrink-0 gap-0.5 pt-1"><Shape kind="circle" size={14} color="#A87B00" /><Shape kind="triangle" size={14} color="#007BB9" /><Shape kind="square" size={14} color="#D06BFF" /></span>Quien adivina pulsa un color; la app comprueba sola.</li>
          <li className="flex items-start gap-2"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-ink font-display text-[14px] font-bold text-white">?</span>«?» = no entendí → Modo maestro.</li>
          <li className="flex items-start gap-2"><Icon name="eyeOff" size={20} className="shrink-0" />Cuando el padre hace la seña, el niño no mira.</li>
          <li className="flex items-start gap-2"><Icon name="bluetooth" size={20} className="shrink-0" />Sin el huevo conectado no hay juego.</li>
          <li className="flex items-start gap-2"><Icon name="flame" size={20} className="shrink-0" />El calor solo sube.</li>
        </ul>
      </section>
    </aside>
  )
}
