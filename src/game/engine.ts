import { MODULES, OPTION_META, PERSON_LABEL, ROUND_INFO, TOTAL_CASILLAS, moduleOf, plainLetters, type Challenge, type ModuleId, type Person, type Round } from './data'

/* ============================== screens ============================== */

export type Screen =
  | 'loader' | 'welcome' | 'login' | 'register' | 'connect' | 'tutorialKid' | 'tutorialParent'
  | 'map' | 'album' | 'profile' | 'investigator'
  | 'sign' | 'guess' | 'good' | 'almost' | 'master' | 'write' | 'hatch'
export type Overlay = 'tutorials' | 'reto' | 'module' | 'exit' | null

export const ENTRY_SCREENS: Screen[] = ['loader', 'welcome', 'login', 'register', 'connect']
export const TAB_SCREENS: Screen[] = ['map', 'album', 'profile']
export const PLAY_SCREENS: Screen[] = ['sign', 'guess', 'good', 'almost', 'master', 'write']

export interface Intro { kind: 'level' | 'turn' | 'teacher'; who: Person; arrow: boolean }
export type TeacherPhase = 'show' | 'retry' | 'learned'
/** wrong = picked or wrote something else · help = pressed «?» (did not understand). */
export type ErrorKind = 'wrong' | 'help'
export type FxMode = 'none' | 'teacher' | 'hatch' | 'levelup' | 'final'
export interface Fx { mode: FxMode; key: number }
export interface Account { id?: string; name: string; email: string; password?: string }
export interface MapAnim { from: number; to: number; key: number }
export interface LogRow {
  id: number
  hora: string
  modulo: string
  turno: string
  actor: 'Padre' | 'Niño'
  accion: string
  contenido: string
  correcto: 'Sí' | 'No' | '—'
  intento: number
  calor: number
}

export interface GameState {
  screen: Screen
  overlay: Overlay
  account: Account | null
  session: boolean
  authError: string | null
  facing: Person
  intro: Intro | null
  connected: boolean
  link: 'idle' | 'searching' | 'error'
  simFail: boolean
  failedOnce: boolean
  keyboard: boolean
  tutorialDone: boolean
  /** Casillas completed (0–46). Casilla done+1 is the active one. */
  done: number
  casilla: number
  selectedCasilla: number
  selectedModule: ModuleId
  replaying: boolean
  mapAnim: MapAnim | null
  inLevel: boolean
  level: ModuleId
  queue: Challenge[]
  idx: number
  heat: number
  selected: number | null
  /** Whoever needs help: 'papa' → Maestro niño, 'nino' → Maestro padre. */
  errorActor: Person | null
  errorKind: ErrorKind
  teacherPhase: TeacherPhase
  teacherLoops: number
  teacherSelected: number | null
  masterSeals: string[]
  masterCount: number
  /** Who taught in Modo maestro (counts of «¡Aprendimos!»). */
  taught: { nino: number; papa: number }
  /** Seconds played inside retos and the days (YYYY-MM-DD) with play. */
  playSeconds: number
  days: string[]
  replay: string[]
  learned: Partial<Record<ModuleId, string[]>>
  write: { stage: 'sign' | 'write'; typed: string[]; letter: number }
  log: LogRow[]
  fx: Fx
}

export type Action =
  | { type: 'LOADER_DONE' } | { type: 'GOTO'; screen: Screen } | { type: 'NAV'; screen: 'map' | 'album' | 'profile' }
  | { type: 'LOGIN'; email: string; password: string } | { type: 'REGISTER'; account: Account } | { type: 'LOGOUT' }
  | { type: 'SET_ACCOUNT'; account: Account | null; session: boolean }
  | { type: 'LOAD_PROGRESS'; progress: Partial<GameState> }
  | { type: 'SET_AUTH_ERROR'; error: string | null }
  | { type: 'SET_PASSWORD'; password: string } | { type: 'CLEAR_AUTH_ERROR' }
  | { type: 'CONNECT_START' } | { type: 'CONNECT_FAIL' } | { type: 'EGG_CONNECTION'; connected: boolean } | { type: 'CONNECT_NEXT' }
  | { type: 'OVERLAY'; overlay: Overlay } | { type: 'TUTORIAL_KID_DONE' } | { type: 'TUTORIAL_PARENT_DONE' }
  | { type: 'OPEN_RETO'; casilla: number } | { type: 'OPEN_MODULE'; module: ModuleId } | { type: 'PLAY' } | { type: 'RESTART' } | { type: 'EXIT_TO_MAP' }
  | { type: 'MAP_ANIM_DONE' } | { type: 'HATCH_CONTINUE' } | { type: 'PLAY_CASILLA'; casilla: number } | { type: 'TICK'; seconds: number }
  | { type: 'SIGN_DONE' } | { type: 'INTRO_DONE' } | { type: 'COLOR'; index: number } | { type: 'HELP' } | { type: 'CHECK' }
  | { type: 'AUTO_NEXT' } | { type: 'TEACHER_NEXT' } | { type: 'TYPE'; letter: string } | { type: 'ERASE' }
  | { type: 'LETTER_STEP'; dir: 1 | -1 }
  | { type: 'TOGGLE_KEYBOARD' } | { type: 'TOGGLE_SIMFAIL' } | { type: 'RESET' }

let key = 1
let logId = 1
const fx = (mode: FxMode): Fx => ({ mode, key: key++ })

/* ============================== queue and heat ============================== */

const PERMS: [number, number, number][] = [[1, 2, 0], [2, 0, 1], [0, 1, 2], [2, 1, 0], [1, 0, 2], [0, 2, 1]]
export const buildQueue = (level: ModuleId, random = true): Challenge[] =>
  MODULES[level].challenges.map((c, k) => {
    if (level === 5) return { ...c, correct: 0 }
    const p = random ? PERMS[Math.floor(Math.random() * PERMS.length)] : PERMS[k % PERMS.length]
    return { ...c, options: p.map((i) => c.options[i]) as [string, string, string], correct: p.indexOf(0) as 0 | 1 | 2 }
  })

/** Heat of the module in progress: one LED per reto completed in it. It never goes down while playing. */
export const heatFor = (done: number) => {
  if (done >= TOTAL_CASILLAS) return 12
  const m = moduleOf(done + 1)
  return Math.min(12, done + 1 - m.first)
}
export const modulesDone = (done: number) => ([1, 2, 3, 4, 5] as ModuleId[]).filter((id) => done >= MODULES[id].last).length
/** Spike grows with the module in progress; after the last module he stays at stage 5. */
export const stageOf = (done: number): ModuleId => (done >= TOTAL_CASILLAS ? 5 : moduleOf(done + 1).id)
/** Stage k is unlocked from the start (1) or when module k-1 is completed. */
export const stageUnlocked = (done: number, stage: number) => stage === 1 || modulesDone(done) >= stage - 1
export const activeCasilla = (done: number) => Math.min(TOTAL_CASILLAS, done + 1)
export const lit = (heat: number) => Math.min(12, Math.floor(heat))

export const initialState = (): GameState => ({
  screen: 'loader', overlay: null, account: null, session: false, authError: null, facing: 'nino', intro: null,
  connected: false, link: 'idle', simFail: false, failedOnce: false, keyboard: false, tutorialDone: false,
  done: 0, casilla: 1, selectedCasilla: 1, selectedModule: 1, replaying: false, mapAnim: null, inLevel: false, level: 1,
  queue: buildQueue(1, false), idx: 0, heat: 0, selected: null, errorActor: null, errorKind: 'wrong',
  teacherPhase: 'show', teacherLoops: 0, teacherSelected: null, masterSeals: [], masterCount: 0, taught: { nino: 0, papa: 0 }, playSeconds: 0, days: [], replay: [],
  learned: {}, write: { stage: 'sign', typed: [], letter: 0 }, log: [], fx: fx('none'),
})

const STORAGE_KEY = 'spike-estado-v1'
const PERSIST = ['account', 'session', 'tutorialDone', 'done', 'masterSeals', 'masterCount', 'taught', 'playSeconds', 'days', 'replay', 'learned', 'log', 'keyboard', 'simFail'] as const
export function loadState(): GameState {
  const base = initialState()
  try {
    const param = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('screen') : null
    const paramIntro = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('intro') : null
    const paramLevel = typeof window !== 'undefined' ? parseInt(new URLSearchParams(window.location.search).get('level') || '1', 10) : 1
    const initialIntro: Intro | null = paramIntro === 'level'
      ? { kind: 'level', who: 'papa', arrow: false }
      : paramIntro === 'turn-papa'
      ? { kind: 'turn', who: 'papa', arrow: false }
      : paramIntro === 'turn-nino'
      ? { kind: 'turn', who: 'nino', arrow: true }
      : null
    const initialFacing: Person = paramIntro === 'turn-nino' ? 'nino' : 'papa'
    const initialLevel = (paramLevel >= 1 && paramLevel <= 5 ? paramLevel : 1) as ModuleId
    const initialScreen = (param && ['welcome', 'login', 'register', 'connect', 'map', 'album', 'profile', 'tutorialKid', 'tutorialParent', 'sign', 'guess', 'write'].includes(param))
      ? (param as Screen)
      : paramIntro
      ? (paramIntro === 'turn-nino' ? 'guess' : 'sign')
      : 'loader'
    const paramOverlay = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('overlay') : null
    const initialOverlay: Overlay | null = (paramOverlay && ['tutorials', 'reto', 'module', 'exit'].includes(paramOverlay))
      ? (paramOverlay as Overlay)
      : null
    const paramCasilla = typeof window !== 'undefined' ? parseInt(new URLSearchParams(window.location.search).get('casilla') || '1', 10) : 1
    const paramConnected = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('connected') === 'true' : false
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...base, screen: initialScreen, connected: paramConnected, intro: initialIntro, facing: initialFacing, level: initialLevel, overlay: initialOverlay, selectedCasilla: paramCasilla, casilla: paramCasilla, idx: Math.max(0, paramCasilla - 1) }
    const saved = JSON.parse(raw) as Partial<GameState>
    const done = Math.max(0, Math.min(TOTAL_CASILLAS, saved.done ?? 0))
    return {
      ...base,
      ...saved,
      done,
      heat: heatFor(done),
      screen: initialScreen,
      overlay: initialOverlay,
      connected: paramConnected,
      intro: initialIntro,
      facing: paramIntro ? initialFacing : (saved.facing ?? 'nino'),
      level: paramIntro ? initialLevel : (saved.level ?? 1),
      selectedCasilla: paramCasilla,
      casilla: paramCasilla,
      idx: Math.max(0, paramCasilla - 1),
      selected: null,
      fx: fx('none'),
    }
  } catch {
    return base
  }
}
export function saveState(s: GameState) {
  try {
    const out: Record<string, unknown> = {}
    for (const k of PERSIST) {
      if (k === 'account' && s.account) {
        // Nunca guardar contraseñas en localStorage
        const { password: _p, ...safeAccount } = s.account as { password?: string; name: string; email: string; id?: string }
        out[k] = safeAccount
      } else {
        out[k] = s[k]
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(out))
  } catch {
    /* the app keeps working in memory */
  }
}

/* ============================== selectors ============================== */

export const current = (s: GameState): Challenge => s.queue[Math.min(s.idx, s.queue.length - 1)]
export const roundOf = (s: GameState): Round => current(s).round
/** Who guesses (owns the four buttons) and who signs, per round. */
export const interpreter = (r: Round): Person => ROUND_INFO[r].guesser
export const signer = (r: Round): Person => ROUND_INFO[r].signer
export const inApp = (s: GameState) => !ENTRY_SCREENS.includes(s.screen)
export const isPlay = (s: GameState) => PLAY_SCREENS.includes(s.screen)
/** Paused = exit sheet open, or the egg is disconnected inside the app. */
export const isPaused = (s: GameState) => s.overlay === 'exit' || (!s.connected && inApp(s))
export const disconnectedSheet = (s: GameState) => !s.connected && inApp(s)
const uniq = (a: string[], x: string) => (a.includes(x) ? a : [...a, x])

const addLog = (s: GameState, actor: Person, action: string, ok: LogRow['correcto'] = '—'): GameState => ({
  ...s,
  log: [
    ...s.log,
    {
      id: logId++,
      hora: new Date().toLocaleTimeString('es-CO'),
      modulo: MODULES[s.level].name,
      turno: ROUND_INFO[current(s).round].title,
      actor: PERSON_LABEL[actor] as 'Padre' | 'Niño',
      accion: action,
      contenido: current(s).content,
      correcto: ok,
      intento: s.teacherLoops + 1,
      calor: lit(s.heat),
    },
  ],
})

/** Moves the phone; when it has to face someone else, a turn card with the arrow appears. */
const face = (s: GameState, who: Person, kind: Intro['kind'] = 'turn'): GameState => ({
  ...s,
  facing: who,
  intro: { kind, who, arrow: s.facing !== who },
})

const startChallenge = (s: GameState, idx: number): GameState => {
  const c = s.queue[idx]
  const base: GameState = {
    ...s, idx, screen: s.level === 5 ? 'write' : 'sign', selected: null, errorActor: null, teacherPhase: 'show',
    teacherLoops: 0, teacherSelected: null, write: { stage: 'sign', typed: [], letter: 0 },
  }
  return face(base, signer(c.round))
}

/** Opens one casilla: level card (first reto of a module), then the turn card. */
export const startReto = (s: GameState, casilla: number, opts: { fixed?: boolean; showLevel?: boolean } = {}): GameState => {
  const m = moduleOf(casilla)
  const j = casilla - m.first
  const replaying = casilla <= s.done
  const queue = buildQueue(m.id, !opts.fixed)
  const today = new Date().toISOString().slice(0, 10)
  const first: GameState = {
    ...s, days: uniq(s.days, today), level: m.id, casilla, selectedCasilla: casilla, replaying, queue, idx: j, inLevel: true, overlay: null, mapAnim: null,
    heat: replaying ? s.heat : j, facing: signer(queue[j].round),
  }
  const n = startChallenge(first, j)
  return (opts.showLevel ?? j === 0) ? { ...n, intro: { kind: 'level', who: n.facing, arrow: false } } : n
}

/** A reto counts as completed when it is guessed or when Modo maestro ends. Heat only goes up. */
const complete = (s: GameState, mastered = false, replay = false): GameState => {
  const c = current(s)
  return {
    ...s,
    screen: 'good',
    intro: null,
    heat: s.replaying ? s.heat : Math.min(12, s.heat + 1),
    selected: null,
    teacherPhase: mastered ? 'learned' : s.teacherPhase,
    masterSeals: mastered ? uniq(s.masterSeals, c.content) : s.masterSeals,
    masterCount: mastered ? s.masterCount + 1 : s.masterCount,
    taught: mastered ? { ...s.taught, [teacherOf(s)]: s.taught[teacherOf(s)] + 1 } : s.taught,
    replay: replay ? uniq(s.replay, c.content) : mastered ? s.replay : s.replay.filter((x) => x !== c.content),
    learned: { ...s.learned, [s.level]: uniq(s.learned[s.level] ?? [], c.content) },
    fx: fx('none'),
  }
}
const fail = (s: GameState, who: Person, kind: ErrorKind): GameState => ({
  ...s, screen: 'almost', errorActor: who, errorKind: kind, selected: null, teacherPhase: 'show', fx: fx('teacher'),
})
const hatch = (s: GameState): GameState => ({
  ...s, screen: 'hatch', facing: 'nino', intro: null, inLevel: false, heat: 12, done: Math.max(s.done, s.casilla), fx: fx('hatch'),
})

/** Second try in Modo maestro: choose again between 2 cards, or (Escribir) write again. */
export const teacherMode = (s: GameState): 'pick' | 'write' => (s.level === 5 ? 'write' : 'pick')
/** Who presses the buttons in the second try: the same person who guesses in this round. */
export const teacherPicker = (s: GameState): Person => interpreter(current(s).round)
/** Maestro niño when the parent needs help; Maestro padre when the child does. */
export const teacherOf = (s: GameState): Person => (s.errorActor === 'papa' ? 'nino' : 'papa')

const teacherLoop = (s: GameState): GameState => {
  const loops = s.teacherLoops + 1
  // After 2 rounds of Modo maestro the game moves on: sign + word together, marked "para jugar otra vez".
  if (loops >= 2) return complete({ ...s, teacherLoops: loops }, true, true)
  return face({ ...s, teacherLoops: loops, teacherPhase: 'show', teacherSelected: null, write: { ...s.write, typed: [] } }, 'nino', 'teacher')
}

/**
 * The box has a single "Elegir" area with 4 buttons for whoever guesses:
 * 3 colours (the app checks) and «?» = "no entendí, otra vez".
 */
export const boxControls = (s: GameState) => {
  const none = { colors: false, help: false, owner: 'nino' as Person, colorIndexes: [0, 1, 2] }
  if (s.intro || isPaused(s) || s.overlay) return none
  if (!isPlay(s)) return none
  const c = current(s)
  const max = plainLetters(c.content).length
  const retry = s.screen === 'master' && s.teacherPhase === 'retry'
  const pickRetry = retry && teacherMode(s) === 'pick' && s.teacherSelected === null
  const writeRetry = retry && teacherMode(s) === 'write' && s.write.typed.length < max
  const guessing = s.screen === 'guess' && s.selected === null
  const writing = s.screen === 'write' && s.write.stage === 'write' && s.write.typed.length < max
  const colors = guessing || pickRetry
  const help = guessing || pickRetry || writing || writeRetry
  const owner: Person = interpreter(c.round)
  const colorIndexes = pickRetry ? [c.correct, (c.correct + 1) % 3].sort() : [0, 1, 2]
  return { colors, help, owner, colorIndexes }
}

const afterConnect = (s: GameState): GameState => ({ ...s, screen: s.tutorialDone ? 'map' : 'tutorialKid', link: 'idle', facing: 'nino' })

/* ============================== reducer ============================== */

export function reducer(s: GameState, a: Action): GameState {
  switch (a.type) {
    case 'LOADER_DONE':
      return s.screen === 'loader' ? { ...s, screen: s.session && s.account ? 'connect' : 'welcome' } : s
    case 'GOTO':
      return { ...s, screen: a.screen, overlay: null, authError: null, intro: null }
    case 'NAV':
      return { ...s, screen: a.screen, overlay: null, intro: null, inLevel: false, facing: 'nino' }

    case 'LOGIN': {
      const acc = s.account
      if (acc && acc.password && (acc.email.toLowerCase() !== a.email.toLowerCase() || acc.password !== a.password)) return { ...s, authError: 'Ese correo o contraseña no coincide' }
      const account: Account = acc ?? { name: a.email.split('@')[0], email: a.email }
      return { ...s, account, session: true, authError: null, screen: 'connect' }
    }
    case 'REGISTER':
      return { ...s, account: a.account, session: true, authError: null, screen: 'connect', tutorialDone: false }
    case 'SET_ACCOUNT':
      return { ...s, account: a.account, session: a.session, authError: null }
    case 'LOAD_PROGRESS': {
      const done = Math.max(0, Math.min(TOTAL_CASILLAS, a.progress.done ?? s.done))
      return { ...s, ...a.progress, done, heat: heatFor(done) }
    }
    case 'SET_AUTH_ERROR':
      return { ...s, authError: a.error }
    case 'LOGOUT':
      return { ...s, account: null, session: false, screen: 'welcome', overlay: null, connected: false, intro: null, inLevel: false }
    case 'SET_PASSWORD':
      return s.account ? { ...s, account: { ...s.account, password: a.password } } : s
    case 'CLEAR_AUTH_ERROR':
      return { ...s, authError: null }

    case 'CONNECT_START':
      return s.link === 'searching' ? s : { ...s, link: 'searching' }
    case 'CONNECT_FAIL':
      return s.link === 'searching' ? { ...s, link: 'error', failedOnce: true } : s
    case 'EGG_CONNECTION':
      return a.connected === s.connected ? s : { ...s, connected: a.connected, link: 'idle' }
    case 'CONNECT_NEXT':
      return s.screen === 'connect' && s.connected ? afterConnect(s) : s

    case 'OVERLAY':
      return { ...s, overlay: a.overlay }
    case 'TUTORIAL_KID_DONE':
      return s.tutorialDone ? { ...s, screen: 'map', overlay: null } : { ...s, screen: 'tutorialParent' }
    case 'TUTORIAL_PARENT_DONE':
      return { ...s, screen: 'map', tutorialDone: true, overlay: null }

    case 'OPEN_RETO':
      return { ...s, overlay: 'reto', selectedCasilla: a.casilla }
    case 'OPEN_MODULE':
      return { ...s, overlay: 'module', selectedModule: a.module }
    case 'PLAY':
      return startReto(s, s.selectedCasilla)
    case 'PLAY_CASILLA':
      return startReto({ ...s, overlay: null }, a.casilla)
    case 'TICK':
      return { ...s, playSeconds: s.playSeconds + a.seconds }
    case 'RESTART':
      return startReto({ ...s, overlay: null }, s.casilla, { showLevel: false })
    case 'EXIT_TO_MAP':
      return { ...s, screen: 'map', overlay: null, intro: null, inLevel: false, facing: 'nino', mapAnim: null }
    case 'MAP_ANIM_DONE':
      return { ...s, mapAnim: null }
    case 'HATCH_CONTINUE': {
      const next = s.casilla + 1
      const end = next > TOTAL_CASILLAS
      // New module: the heat starts again from 0 (inside a module it never goes down).
      return { ...s, screen: 'map', inLevel: false, heat: heatFor(s.done), fx: fx(end ? 'final' : 'levelup'), mapAnim: !end ? { from: s.casilla, to: next, key: key++ } : null }
    }

    case 'SIGN_DONE': {
      if (isPaused(s) || !['sign', 'write'].includes(s.screen) || (s.screen === 'write' && s.write.stage !== 'sign')) return s
      const c = current(s)
      const logged = addLog(s, signer(c.round), s.level === 5 ? 'Deletrea' : 'Hace la seña')
      const next: GameState = s.screen === 'write' ? { ...logged, write: { ...s.write, stage: 'write', typed: [] } } : { ...logged, screen: 'guess' }
      return face(next, interpreter(c.round))
    }
    case 'INTRO_DONE':
      if (!s.intro || isPaused(s)) return s
      // The level card is followed by the card of whoever starts.
      return s.intro.kind === 'level' ? { ...s, intro: { kind: 'turn', who: s.facing, arrow: false } } : { ...s, intro: null }

    case 'COLOR': {
      const ctl = boxControls(s)
      if (!ctl.colors || !ctl.colorIndexes.includes(a.index)) return s
      const ok = a.index === current(s).correct
      if (s.screen === 'master') {
        const logged = addLog({ ...s, teacherSelected: a.index }, ctl.owner, 'Elige de nuevo', ok ? 'Sí' : 'No')
        return ok ? complete(logged, true) : teacherLoop(logged)
      }
      // guess: the card lights up and the app checks it a moment later (CHECK).
      return addLog({ ...s, selected: a.index }, ctl.owner, `Elige ${OPTION_META[a.index].label}`, ok ? 'Sí' : 'No')
    }
    case 'HELP': {
      const ctl = boxControls(s)
      if (!ctl.help) return s
      const logged = addLog(s, ctl.owner, '? No entendí', 'No')
      if (s.screen === 'master') return teacherLoop(logged)
      // «?» = the sign was not understood → the parent needs help (the child is the LSC expert) → Maestro niño.
      return fail(logged, 'papa', 'help')
    }
    case 'CHECK': {
      if (isPaused(s)) return s
      const c = current(s)
      const guesser = interpreter(c.round)
      if (s.screen === 'guess' && s.selected !== null) {
        return s.selected === c.correct ? complete(s) : fail(s, guesser, 'wrong')
      }
      if (s.screen === 'write' && s.write.stage === 'write' && s.write.typed.length === plainLetters(c.content).length) {
        const ok = s.write.typed.join('') === plainLetters(c.content).join('')
        const logged = addLog(s, guesser, `Escribe ${s.write.typed.join('')}`, ok ? 'Sí' : 'No')
        return ok ? complete(logged) : fail(logged, guesser, 'wrong')
      }
      return s
    }
    case 'AUTO_NEXT': {
      if (isPaused(s)) return s
      if (s.screen === 'good') {
        if (s.replaying) return { ...s, screen: 'map', inLevel: false, intro: null, facing: 'nino', mapAnim: null }
        const done = Math.max(s.done, s.casilla)
        if (s.casilla === MODULES[s.level].last) return hatch({ ...s, done })
        return { ...s, done, screen: 'map', inLevel: false, intro: null, facing: 'nino', mapAnim: { from: s.casilla, to: s.casilla + 1, key: key++ } }
      }
      // Modo maestro always starts facing the child: he is the teacher or he sees the sign with the word.
      if (s.screen === 'almost') return face({ ...s, screen: 'master', teacherPhase: 'show', write: { ...s.write, typed: [] }, fx: fx('teacher') }, 'nino', 'teacher')
      return s
    }
    case 'TEACHER_NEXT':
      if (s.screen !== 'master' || s.teacherPhase !== 'show' || isPaused(s)) return s
      return face({ ...s, teacherPhase: 'retry', selected: null, teacherSelected: null, write: { ...s.write, typed: [] } }, teacherPicker(s))

    case 'TYPE': {
      const teacherWrite = s.screen === 'master' && s.level === 5 && s.teacherPhase === 'retry'
      if (!teacherWrite && (s.screen !== 'write' || s.write.stage !== 'write')) return s
      if (s.intro || isPaused(s)) return s
      const target = plainLetters(current(s).content)
      if (s.write.typed.length >= target.length) return s
      const typed = [...s.write.typed, a.letter]
      const next = { ...s, write: { ...s.write, typed } }
      if (teacherWrite && typed.length === target.length) {
        const ok = typed.join('') === target.join('')
        const logged = addLog(next, teacherPicker(s), 'Escribe de nuevo', ok ? 'Sí' : 'No')
        return ok ? complete(logged, true) : teacherLoop(logged)
      }
      return next
    }
    case 'ERASE':
      if (!['master', 'write'].includes(s.screen)) return s
      return { ...s, write: { ...s.write, typed: s.write.typed.slice(0, -1) } }
    case 'LETTER_STEP': {
      const max = plainLetters(current(s).content).length
      return { ...s, write: { ...s.write, letter: Math.max(0, Math.min(max - 1, s.write.letter + a.dir)) } }
    }

    case 'TOGGLE_KEYBOARD':
      return { ...s, keyboard: !s.keyboard }
    case 'TOGGLE_SIMFAIL':
      return { ...s, simFail: !s.simFail, failedOnce: false, link: 'idle' }
    case 'RESET':
      return { ...initialState(), screen: 'investigator', connected: s.connected, account: s.account, session: s.session }
  }
}

export const toCSV = (rows: LogRow[]) => {
  const h = ['hora', 'modulo', 'turno', 'actor', 'accion', 'contenido', 'correcto', 'intento', 'calor'] as const
  return [h.join(','), ...rows.map((r) => h.map((k) => `"${String(r[k]).replace(/"/g, '""')}"`).join(','))].join('\n')
}
