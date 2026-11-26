import { useGame } from '../game/context'
import { MODULES, ROUND_INFO, ROLE_COLOR, moduleOf } from '../game/data'
import { stageOf } from '../game/engine'
import { Avatar, Btn, ModuleBadge, RoundChip, Sheet, Spike } from '../components/ui'
import { ModuleArt } from '../components/glyphs'
import { moduleState } from './MapScreen'
import { Icon } from '../components/glyphs'
import { BigEgg, useConnectFlow } from './Entry'

/** «?» on the map: two big cards. */
export function TutorialsSheet() {
  const { dispatch } = useGame()
  const close = () => dispatch({ type: 'OVERLAY', overlay: null })
  const card = (who: 'nino' | 'papa', title: string, screen: 'tutorialKid' | 'tutorialParent', icon: 'play' | 'hand') => (
    <button
      type="button"
      onClick={() => {
        dispatch({ type: 'OVERLAY', overlay: null })
        dispatch({ type: 'GOTO', screen })
      }}
      className="btn3d relative flex h-[132px] w-full items-center gap-4 overflow-hidden rounded-[28px] px-5 text-left cursor-pointer"
      style={{ '--bg': ROLE_COLOR[who], '--edge': who === 'nino' ? '#FF4F1A' : '#007BB9', '--fg': '#fff', minHeight: 132 } as React.CSSProperties}
    >
      <Avatar who={who} size={84} halo />
      <span className="flex flex-col gap-1">
        <span className="font-display text-[24px] leading-7 font-semibold">{title}</span>
        <span className="flex items-center gap-1.5 font-sans text-[14px] font-bold opacity-95"><Icon name={icon} size={18} /> {who === 'nino' ? 'Video en LSC' : 'Íconos y textos cortos'}</span>
      </span>
    </button>
  )
  return (
    <Sheet onClose={close} label="Tutoriales">
      <h2 className="mb-4 font-display text-[22px] leading-7 font-medium">Tutoriales</h2>
      <div className="flex flex-col gap-4">
        {card('nino', 'Tutorial del niño', 'tutorialKid', 'play')}
        {card('papa', 'Tutorial del padre', 'tutorialParent', 'hand')}
      </div>
    </Sheet>
  )
}

/** Tap on the active casilla → «Jugar»; on a completed one → «Jugar otra vez». */
export function RetoSheet() {
  const { s, dispatch } = useGame()
  const n = s.selectedCasilla
  const m = moduleOf(n)
  const j = n - m.first
  const round = m.challenges[j].round
  const r = ROUND_INFO[round]
  const done = n <= s.done
  const handColor = r.signer === 'papa' ? '#45C1FF' : '#FF8001'
  return (
    <Sheet onClose={() => dispatch({ type: 'OVERLAY', overlay: null })} label={`Reto ${j + 1} de ${m.challenges.length}`}>
      <div className="flex items-center gap-4">
        <ModuleBadge id={m.id} size={68} />
        <div className="flex flex-col">
          <span className="font-sans text-[14px] font-extrabold tracking-wide uppercase" style={{ color: m.accent }}>{m.name}</span>
          <h2 className="font-display text-[28px] leading-8 font-semibold">Reto {j + 1} de {m.challenges.length}</h2>
        </div>
        {done && <span className="ml-auto grid size-11 place-items-center rounded-full text-white" style={{ background: m.color }}><Icon name="check" size={24} solid /></span>}
      </div>
      <div className="mt-5 flex flex-col items-center gap-3 rounded-[24px] bg-[#F6F8FB] py-5 px-4">
        <div className="flex items-center justify-center gap-4">
          <Avatar who={r.signer} size={58} />
          <Icon name="hand" size={30} color={handColor} solid />
          <Icon name="arrowRight" size={20} color="#4A5A8C" />
          <Avatar who={r.guesser} size={58} />
        </div>
        <span className="font-sans font-bold text-[15px] sm:text-[16px] text-[#4A5A8C] text-center mt-0.5">
          {r.short.replace(' · ', ' - ')}
        </span>
      </div>
      <div className="mt-5">
        <Btn icon="play" onClick={() => dispatch({ type: 'PLAY' })}>{done ? 'Jugar otra vez' : 'Jugar'}</Btn>
      </div>
    </Sheet>
  )
}

/** X inside a reto: Seguir · Reiniciar reto · Salir al mapa. */
export function ExitSheet() {
  const { s, dispatch } = useGame()
  return (
    <Sheet onClose={() => dispatch({ type: 'OVERLAY', overlay: null })} label="Pausa">
      <div className="flex items-center gap-4">
        <Spike stage={stageOf(s.done)} mood="sleep" size={104} />
        <div>
          <h2 className="font-display text-[28px] leading-8 font-semibold">Pausa</h2>
          <p className="mt-1 font-sans text-[16px] leading-6 font-semibold text-ink2">Tu avance se guarda</p>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-4">
        <Btn icon="play" onClick={() => dispatch({ type: 'OVERLAY', overlay: null })}>Seguir</Btn>
        <Btn variant="whiteOrange" icon="refresh" onClick={() => dispatch({ type: 'RESTART' })}>Reiniciar reto</Btn>
        <Btn variant="whiteOrange" icon="map" onClick={() => dispatch({ type: 'EXIT_TO_MAP' })}>Salir al mapa</Btn>
      </div>
    </Sheet>
  )
}

/** The egg is mandatory: when it drops, the game pauses on this sheet and resumes at the same point. */
export function DisconnectedSheet() {
  const { state, start } = useConnectFlow()
  return (
    <div className="fade-in absolute inset-0 z-[60] flex items-end bg-[#4A5A8C]/50" role="alertdialog" aria-label="Huevo desconectado" aria-modal>
      <div className="sheet-up w-full rounded-t-[32px] bg-white px-5 pt-6 pb-8 shadow-[0_-12px_40px_rgba(0,0,0,0.2)]" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex flex-col items-center">
          <BigEgg state={state === 'searching' ? 'searching' : 'idle'} size={150} blue />
          <h2 className="mt-1 font-display text-[28px] leading-8 font-semibold">Huevo desconectado</h2>
          <p className="mt-1 mb-5 text-center font-sans text-[16px] leading-6 font-semibold text-ink2">
            {state === 'searching' ? 'Buscando el huevo…' : state === 'error' ? 'No lo encontramos. Acércalo y reintenta.' : 'El juego está en pausa y sigue donde lo dejaste.'}
          </p>
          {state === 'searching' ? (
            <div className="flex h-[60px] items-center gap-2" aria-hidden>{[0, 1, 2].map((k) => <span key={k} className="dot-bounce size-3.5 rounded-full bg-[#45C1FF]" style={{ animationDelay: `${k * 140}ms` }} />)}</div>
          ) : (
            <Btn icon="bluetooth" onClick={start}>{state === 'error' ? 'Reintentar' : 'Reconectar'}</Btn>
          )}
        </div>
      </div>
    </div>
  )
}

/** Small sheet of a module casilla: icon, name and progress («3/8»); a locked module only shows name and «Aún no». */
export function ModuleSheet() {
  const { s, dispatch } = useGame()
  const m = MODULES[s.selectedModule]
  const st = moduleState(m.id, s.done)
  const n = Math.max(0, Math.min(m.challenges.length, s.done - m.first + 1))
  return (
    <Sheet onClose={() => dispatch({ type: 'OVERLAY', overlay: null })} label={`Módulo ${m.name}`}>
      <div className="flex items-center gap-5 pb-2">
        <ModuleArt id={m.id} size={84} locked={st === 'locked'} />
        <div className="flex flex-col">
          <h2 className="font-display text-[32px] leading-9 font-semibold text-ink">{m.name}</h2>
          {st === 'locked' ? (
            <span className="font-display text-[24px] leading-8 font-semibold text-ink2">Aún no</span>
          ) : (
            <span className="font-display text-[28px] leading-8 font-bold" style={{ color: m.accent }}>{n}/{m.challenges.length}</span>
          )}
        </div>
      </div>
    </Sheet>
  )
}
