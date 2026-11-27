import { useEffect, useReducer, useRef, type ReactNode } from 'react'
import { ALPHABET } from './game/data'
import { disconnectedSheet, isPaused, isPlay, loadState, reducer, saveState, signer, type Account, type Screen as ScreenName } from './game/engine'
import { GameContext } from './game/context'
import { useEggSync } from './egg/useEggSync'
import { IconDefs } from './components/glyphs'
import { getGeometry } from './game/mapGeometry'
import { Connect, Loader, Login, Register, Welcome } from './screens/Entry'
import { TutorialKid, TutorialParent } from './screens/Tutorials'
import { MapScreen } from './screens/MapScreen'
import { AlmostScreen, GoodScreen, GuessScreen, IntroCard, SignScreen } from './screens/Play'
import { HatchScreen, MasterScreen, WriteScreen } from './screens/Master'
import { Album, Investigator, Profile } from './screens/Hub'
import { DisconnectedSheet, ExitSheet, ModuleSheet, RetoSheet, TutorialsSheet } from './screens/Sheets'
import { fetchUserProgress, isSupabaseConfigured, saveUserProgress, supabase } from './lib/supabase'

const VIEWS: Record<ScreenName, () => ReactNode> = {
  loader: Loader, welcome: Welcome, login: Login, register: Register, connect: Connect,
  tutorialKid: TutorialKid, tutorialParent: TutorialParent, map: MapScreen, album: Album, profile: Profile, investigator: Investigator,
  sign: SignScreen, guess: GuessScreen, good: GoodScreen, almost: AlmostScreen, master: MasterScreen, write: WriteScreen, hatch: HatchScreen,
}

export default function App() {
  const [s, dispatch] = useReducer(reducer, undefined, loadState)
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    ;(window as any).__SPIKE_DISPATCH__ = dispatch
    ;(window as any).__SPIKE_STATE__ = s
  }
  const View = VIEWS[s.screen]
  const paused = isPaused(s)
  const play = isPlay(s)
  useEggSync(s, dispatch)

  useEffect(() => saveState(s), [s])

  // Pre-warm map geometry during idle time so navigating to map is instant
  useEffect(() => {
    const fn = () => { try { getGeometry() } catch { } }
    const timer = setTimeout(fn, 300)
    return () => clearTimeout(timer)
  }, [])

  // Time played: counts seconds while a reto is on screen and the game is not paused.
  useEffect(() => {
    if (!play || paused) return
    const t = window.setInterval(() => dispatch({ type: 'TICK', seconds: 5 }), 5000)
    return () => window.clearInterval(t)
  }, [play, paused])

  // Supabase Auth session listener and initial progress fetch
  useEffect(() => {
    if (!isSupabaseConfigured) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user
        const name = (u.user_metadata?.name as string) || u.email?.split('@')[0] || 'Familia'
        const account: Account = { id: u.id, name, email: u.email || '' }
        dispatch({ type: 'SET_ACCOUNT', account, session: true })

        fetchUserProgress(u.id).then((remote) => {
          if (remote) {
            dispatch({
              type: 'LOAD_PROGRESS',
              progress: {
                done: remote.done,
                masterCount: remote.master_count,
                masterSeals: remote.master_seals || [],
                taught: remote.taught || { nino: 0, papa: 0 },
                playSeconds: remote.play_seconds || 0,
                days: remote.days || [],
                replay: remote.replay || [],
                tutorialDone: remote.tutorial_done,
                learned: (remote.learned as any) || {},
              },
            })
          } else {
            // First time: migrate local progress to Supabase
            const cur = stateRef.current
            if (cur.done > 0 || cur.masterCount > 0) {
              void saveUserProgress(u.id, {
                done: cur.done,
                master_count: cur.masterCount,
                master_seals: cur.masterSeals,
                taught: cur.taught,
                play_seconds: cur.playSeconds,
                days: cur.days,
                learned: cur.learned as Record<string, string[]>,
                replay: cur.replay,
                tutorial_done: cur.tutorialDone,
              })
            }
          }
        })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user
        const name = (u.user_metadata?.name as string) || u.email?.split('@')[0] || 'Familia'
        dispatch({ type: 'SET_ACCOUNT', account: { id: u.id, name, email: u.email || '' }, session: true })
      } else {
        dispatch({ type: 'SET_ACCOUNT', account: null, session: false })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Sync game progress to Supabase (debounced 1s) when progress changes and user is logged in
  useEffect(() => {
    if (!isSupabaseConfigured || !s.account?.id || !s.session) return
    const t = window.setTimeout(() => {
      void saveUserProgress(s.account!.id!, {
        done: s.done,
        master_count: s.masterCount,
        master_seals: s.masterSeals,
        taught: s.taught,
        play_seconds: s.playSeconds,
        days: s.days,
        learned: s.learned as Record<string, string[]>,
        replay: s.replay,
        tutorial_done: s.tutorialDone,
      })
    }, 1000)
    return () => window.clearTimeout(t)
  }, [s.done, s.masterCount, s.masterSeals, s.taught, s.playSeconds, s.days, s.learned, s.replay, s.tutorialDone, s.session, s.account?.id])

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

  const isFullOrange = s.screen === 'welcome' || s.screen === 'loader' || s.screen === 'tutorialKid'
  const isSkyScreen = s.screen === 'login' || s.screen === 'register' || s.screen === 'connect'
  const isBlueTutorial = s.screen === 'tutorialParent'
  const isMapScreen = s.screen === 'map'
  const isHubScreen = s.screen === 'album' || s.screen === 'profile' || s.screen === 'investigator'

  const currentChallenge = s.queue[Math.min(s.idx, Math.max(0, s.queue.length - 1))]
  const isPapaSigner = currentChallenge ? signer(currentChallenge.round) === 'papa' : true

  const screenBgClass = isFullOrange
    ? 'bg-[#FF8001]'
    : isBlueTutorial || isMapScreen
      ? 'bg-[#45C1FF]'
      : isSkyScreen || isHubScreen
        ? 'bg-linear-to-b from-[#0095ff] via-[#45c1ff] via-[35%] to-[#bcedff]'
        : s.screen === 'sign'
          ? isPapaSigner ? 'bg-[#45C1FF]' : 'bg-[#FF8001]'
          : s.screen === 'guess' || s.screen === 'good' || s.screen === 'almost'
            ? 'bg-[#BCEDFF]'
            : s.screen === 'write'
              ? 'bg-linear-to-b from-[#0095ff] via-[#45c1ff] via-[35%] to-[#bcedff]'
              : s.screen === 'master' || s.screen === 'hatch'
                ? 'bg-[#E7B3FF]'
                : 'bg-[#45C1FF]'

  return (
    <GameContext.Provider value={{ s, dispatch, paused }}>
      <IconDefs />
      <div
        className={`relative flex h-dvh w-full justify-center overflow-hidden text-ink select-none ${screenBgClass}`}
      >
        <main
          className={`relative flex h-full w-full flex-col overflow-hidden max-w-none shadow-none sm:max-w-[440px] ${screenBgClass}`}
        >
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
          {disconnectedSheet(s) && s.screen !== 'tutorialKid' && s.screen !== 'tutorialParent' && <DisconnectedSheet />}
        </main>
      </div>
    </GameContext.Provider>
  )
}
