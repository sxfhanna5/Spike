import { useEffect, useReducer, useRef, type ReactNode } from 'react'
import { ALPHABET } from './game/data'
import { disconnectedSheet, isPaused, isPlay, loadState, reducer, saveState, type Screen as ScreenName } from './game/engine'
import { GameContext } from './game/context'
import { useEggSync } from './egg/useEggSync'
import { IconDefs } from './components/glyphs'
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

export default function App() {
  const [s, dispatch] = useReducer(reducer, undefined, loadState)
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

  return (
    <GameContext.Provider value={{ s, dispatch, paused }}>
      <IconDefs />
      <div className="relative flex h-dvh w-full justify-center overflow-hidden bg-[#EAF6FF] text-ink select-none">
        <main className="relative flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-white shadow-2xl">
          <View />
          {s.intro && isPlay(s) && (
            <IntroCard
              key={`${s.intro.kind}-${s.idx}-${s.intro.who}-${s.screen}-${s.teacherPhase}-${s.teacherLoops}`}
            />
          )}
          {s.overlay === 'tutorials' && <TutorialsSheet />}
          {s.overlay === 'reto' && <RetoSheet />}
          {s.overlay === 'module' && <ModuleSheet />}
          {s.overlay === 'exit' && <ExitSheet />}
          {disconnectedSheet(s) && <DisconnectedSheet />}
        </main>
      </div>
    </GameContext.Provider>
  )
}
