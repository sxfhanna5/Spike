import { Component, useEffect, useMemo, useReducer, useRef, type ErrorInfo, type ReactNode } from 'react'
import { ALPHABET } from './game/data'
import { disconnectedSheet, getUserStorageKey, isPaused, isPlay, loadState, reducer, saveState, signer, type Account, type GameState, type Screen as ScreenName } from './game/engine'
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
import { NavBar } from './components/ui'
import { fetchUserProgress, isSupabaseConfigured, saveUserProgress, supabase } from './lib/supabase'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('SPIKE ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-ink bg-[#45C1FF]">
          <div className="card max-w-[320px] p-6 flex flex-col items-center gap-4">
            <span className="font-display text-[24px] font-bold text-[#FF8001]">¡Ups! Algo ocurrió</span>
            <p className="font-sans text-[15px] text-[#4A5A8C]">
              Hemos recuperado tu partida. Presiona continuar.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false })
                window.location.reload()
              }}
              className="btn3d rounded-full px-6 py-3 font-sans font-bold text-white cursor-pointer"
              style={{ '--bg': '#FF8001', '--edge': '#D96500', '--fg': '#fff' } as React.CSSProperties}
            >
              Continuar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function reconcileProgress(
  local: Partial<GameState> | null,
  remote: any
): {
  done: number
  masterCount: number
  masterSeals: string[]
  taught: { nino: number; papa: number }
  playSeconds: number
  days: string[]
  replay: string[]
  tutorialDone: boolean
  learned: Record<string, string[]>
  hasLocalAhead: boolean
} {
  const localDone = local?.done ?? 0
  const remoteDone = remote?.done ?? 0
  const done = Math.max(localDone, remoteDone)

  const localMasterCount = local?.masterCount ?? 0
  const remoteMasterCount = remote?.master_count ?? 0
  const masterCount = Math.max(localMasterCount, remoteMasterCount)

  const localSeals = Array.isArray(local?.masterSeals) ? local.masterSeals : []
  const remoteSeals = Array.isArray(remote?.master_seals) ? remote.master_seals : []
  const masterSeals = Array.from(new Set([...localSeals, ...remoteSeals]))

  const taught = {
    nino: Math.max(local?.taught?.nino ?? 0, remote?.taught?.nino ?? 0),
    papa: Math.max(local?.taught?.papa ?? 0, remote?.taught?.papa ?? 0),
  }

  const playSeconds = Math.max(local?.playSeconds ?? 0, remote?.play_seconds ?? 0)

  const localDays = Array.isArray(local?.days) ? local.days : []
  const remoteDays = Array.isArray(remote?.days) ? remote.days : []
  const days = Array.from(new Set([...localDays, ...remoteDays]))

  const localReplay = Array.isArray(local?.replay) ? local.replay : []
  const remoteReplay = Array.isArray(remote?.replay) ? remote.replay : []
  const replay = Array.from(new Set([...localReplay, ...remoteReplay]))

  const tutorialDone = Boolean(local?.tutorialDone || remote?.tutorial_done)

  const learned: Record<string, string[]> = {}
  const allLevels = new Set([
    ...Object.keys(local?.learned || {}),
    ...Object.keys(remote?.learned || {}),
  ])
  for (const lvl of allLevels) {
    const locArr = (local?.learned as Record<string, string[]> | undefined)?.[lvl] || []
    const remArr = (remote?.learned as Record<string, string[]> | undefined)?.[lvl] || []
    learned[lvl] = Array.from(new Set([...locArr, ...remArr]))
  }

  const hasLocalAhead =
    localDone > remoteDone ||
    localMasterCount > remoteMasterCount ||
    localSeals.some((s) => !remoteSeals.includes(s)) ||
    (Boolean(local?.tutorialDone) && !remote?.tutorial_done)

  return {
    done,
    masterCount,
    masterSeals,
    taught,
    playSeconds,
    days,
    replay,
    tutorialDone,
    learned,
    hasLocalAhead,
  }
}

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
    ;(window as any).supabase = supabase
  }
  const View = VIEWS[s.screen]
  const paused = isPaused(s)
  const play = isPlay(s)
  const showNav = s.screen === 'map' || s.screen === 'album' || s.screen === 'profile'
  const sceneKey = isPlay(s)
    ? `${s.screen}-${s.casilla}-${s.screen === 'write' ? s.write.stage : ''}-${s.screen === 'master' ? s.teacherPhase : ''}`
    : s.screen
  const ctx = useMemo(() => ({ s, dispatch, paused }), [s, paused])
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

  // Supabase Auth session listener and user-isolated progress sync
  useEffect(() => {
    if (!isSupabaseConfigured) return

    const handleUserSession = async (u: { id: string; email?: string; user_metadata?: any } | null) => {
      if (!u) {
        dispatch({ type: 'LOGOUT' })
        return
      }

      const name = (u.user_metadata?.name as string) || u.email?.split('@')[0] || 'Familia'
      const account: Account = { id: u.id, name, email: u.email || '' }

      // 1. Read isolated local storage for this specific user
      const userKey = getUserStorageKey(u.id)
      let localState: Partial<GameState> | null = null
      try {
        const raw = localStorage.getItem(userKey)
        if (raw) localState = JSON.parse(raw)
      } catch { }

      // 2. Set account in state
      dispatch({ type: 'SET_ACCOUNT', account, session: true })

      // 3. Immediately load local progress if already saved on this device for this user
      if (localState) {
        dispatch({
          type: 'LOAD_PROGRESS',
          progress: {
            done: localState.done ?? 0,
            masterCount: localState.masterCount ?? 0,
            masterSeals: localState.masterSeals ?? [],
            taught: localState.taught ?? { nino: 0, papa: 0 },
            playSeconds: localState.playSeconds ?? 0,
            days: localState.days ?? [],
            replay: localState.replay ?? [],
            tutorialDone: localState.tutorialDone ?? false,
            learned: (localState.learned as any) ?? {},
          },
        })
      }

      // 4. Fetch Supabase remote progress and reconcile
      try {
        const remote = await fetchUserProgress(u.id)
        if (remote) {
          const reconciled = reconcileProgress(localState, remote)
          dispatch({
            type: 'LOAD_PROGRESS',
            progress: {
              done: reconciled.done,
              masterCount: reconciled.masterCount,
              masterSeals: reconciled.masterSeals,
              taught: reconciled.taught,
              playSeconds: reconciled.playSeconds,
              days: reconciled.days,
              replay: reconciled.replay,
              tutorialDone: reconciled.tutorialDone,
              learned: reconciled.learned as any,
            },
          })
          if (reconciled.hasLocalAhead) {
            void saveUserProgress(u.id, {
              done: reconciled.done,
              master_count: reconciled.masterCount,
              master_seals: reconciled.masterSeals,
              taught: reconciled.taught,
              play_seconds: reconciled.playSeconds,
              days: reconciled.days,
              learned: reconciled.learned,
              replay: reconciled.replay,
              tutorial_done: reconciled.tutorialDone,
            })
          }
        } else {
          // Brand new user row in Supabase
          const initDone = localState?.done ?? 0
          void saveUserProgress(u.id, {
            done: initDone,
            master_count: localState?.masterCount ?? 0,
            master_seals: localState?.masterSeals ?? [],
            taught: localState?.taught ?? { nino: 0, papa: 0 },
            play_seconds: localState?.playSeconds ?? 0,
            days: localState?.days ?? [],
            learned: (localState?.learned as Record<string, string[]>) ?? {},
            replay: localState?.replay ?? [],
            tutorial_done: localState?.tutorialDone ?? false,
          })
        }
      } catch (err) {
        console.warn('Could not fetch remote user progress:', err)
      }
    }

    void supabase.auth.getSession().then(({ data: { session } }) => {
      void handleUserSession(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void handleUserSession(session?.user ?? null)
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

  // Sync on window online or beforeunload to never lose progress
  useEffect(() => {
    const handleSync = () => {
      const cur = stateRef.current
      if (cur.account?.id && cur.session && isSupabaseConfigured) {
        void saveUserProgress(cur.account.id, {
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

    const handleBeforeUnload = () => {
      saveState(stateRef.current)
      handleSync()
    }

    window.addEventListener('online', handleSync)
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('online', handleSync)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
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
    <GameContext.Provider value={ctx}>
      <IconDefs />
      <div
        className={`relative flex h-dvh w-full justify-center overflow-hidden text-ink select-none ${screenBgClass}`}
      >
        <ErrorBoundary>
          <main
            className={`relative flex h-full w-full flex-col overflow-hidden max-w-none shadow-none sm:max-w-[440px] ${screenBgClass}`}
          >
            <div key={sceneKey} className="scene-enter relative flex h-full w-full flex-col">
              <View />
            </div>
            {showNav && <NavBar />}
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
        </ErrorBoundary>
      </div>
    </GameContext.Provider>
  )
}
