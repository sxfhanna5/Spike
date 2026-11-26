import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useGame } from '../game/context'
import { FULL_RULES, MODULES, MODULE_IDS, STAGES, TOTAL_CASILLAS, type ModuleId } from '../game/data'
import { stageOf, stageUnlocked, toCSV } from '../game/engine'
import { moduleOf } from '../game/data'
import { SkyHills } from '../art/SkyHills'
import { activeCasilla } from '../game/engine'
import { Bar, Btn, ConnDot, CountUp, ModuleBadge, NavBar, ProfileFace, Screen, Spike } from '../components/ui'
import { Badge, Icon, type IconName } from '../components/glyphs'
import { egg } from '../egg'
import { useConnectFlow } from './Entry'
import { EggBox } from '../components/EggBox'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

function Card({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <section className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-[22px] leading-7 font-medium">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  )
}

/* ============================== S23 · Progreso ============================== */

type SectionId = 'modules' | 'stats'

/** Collapsible card: flat circle icon, title and 3D navigation-style chevron button. */
function Accordion({ id, open, onToggle, icon, color, title, children }: { id: SectionId; open: boolean; onToggle: () => void; icon: IconName; color: string; title: string; children: ReactNode }) {
  return (
    <section className="card overflow-hidden">
      <button type="button" aria-expanded={open} aria-controls={`acc-${id}`} onClick={onToggle} className="flex min-h-[64px] w-full items-center gap-3 px-4 py-2 text-left cursor-pointer">
        <span
          className="grid size-11 shrink-0 place-items-center rounded-full text-white"
          style={{ background: color }}
        >
          <Icon name={icon} size={24} solid color="#FFFFFF" />
        </span>
        <h2 className="flex-1 font-display text-[22px] leading-7 font-semibold text-ink">{title}</h2>
        <span
          className="btn3d grid size-10 shrink-0 place-items-center rounded-full"
          style={{ '--bg': '#fff', '--edge': '#FFD2A8', '--fg': '#FF8001', padding: 0, minHeight: 40 } as CSSProperties}
        >
          <span
            className="grid place-items-center transition-transform duration-300 ease-[cubic-bezier(.3,1.5,.5,1)]"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <Icon name="chevronDown" size={20} solid color="#FF8001" />
          </span>
        </span>
      </button>
      <div id={`acc-${id}`} className="grid transition-[grid-template-rows,opacity] duration-[380ms] ease-[cubic-bezier(.3,1.1,.5,1)]" style={{ gridTemplateRows: open ? '1fr' : '0fr', opacity: open ? 1 : 0 }}>
        <div className="overflow-hidden"><div className="px-4 pt-1 pb-4">{children}</div></div>
      </div>
    </section>
  )
}

function Growth() {
  const { s } = useGame()
  const cur = stageOf(s.done)
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {MODULE_IDS.map((id) => {
        const on = stageUnlocked(s.done, id)
        const m = MODULES[id]
        return (
          <div key={id} className="flex flex-col items-center gap-1.5" aria-label={`${STAGES[id - 1]}: ${on ? 'desbloqueada' : 'bloqueada'}`}>
            <span className="grid h-[72px] w-full place-items-center rounded-[18px] transition-colors" style={{ background: on ? m.soft : '#EEF1F7', boxShadow: id === cur ? `0 4px 0 ${m.color}` : undefined }}>
              <Spike stage={id} mood="calm" size={54} locked={!on} animate={false} />
            </span>
            <span className="font-sans text-[14px] leading-4 font-extrabold tracking-tight" style={{ color: on ? '#4A5A8C' : '#65739F' }}>{STAGES[id - 1]}</span>
          </div>
        )
      })}
    </div>
  )
}

function Modules() {
  const { s, dispatch } = useGame()
  const [openMod, setOpenMod] = useState<ModuleId | null>(null)
  return (
    <div className="flex flex-col gap-2">
      {MODULE_IDS.map((id) => {
        const m = MODULES[id]
        const n = Math.max(0, Math.min(m.challenges.length, s.done - m.first + 1))
        const open = openMod === id
        const learned = s.learned[id] ?? []
        return (
          <div key={id} className="rounded-[20px] bg-[#F6F8FD]">
            <button type="button" aria-expanded={open} onClick={() => setOpenMod(open ? null : id)} className="flex min-h-[64px] w-full items-center gap-3 px-3 py-2 text-left">
              <ModuleBadge id={id} size={40} />
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="font-display text-[18px] leading-5 font-semibold text-ink">{m.name}</span>
                <Bar pct={(n / m.challenges.length) * 100} color={m.color} height={10} />
              </span>
              <span className="font-sans text-[16px] font-extrabold text-ink2">{n}/{m.challenges.length}</span>
              <Icon name={open ? 'chevronDown' : 'chevronRight'} size={20} color="#FF8001" />
            </button>
            {open && (
              <div className="accordion-in flex flex-wrap gap-1.5 px-3 pb-3">
                {n === 0 && <span className="px-1 font-sans text-[14px] font-bold text-ink2">Aún no</span>}
                {learned.map((x) => {
                  const again = s.replay.includes(x)
                  const casilla = m.first + m.contents.indexOf(x)
                  return again ? (
                    <span key={x} className="flex items-center gap-1.5 rounded-full bg-[#F7E8FF] py-1 pr-1 pl-3 font-sans text-[14px] font-extrabold text-ink">
                      {x}
                      <button type="button" aria-label={`Jugar otra vez ${x}`} onClick={() => dispatch({ type: 'PLAY_CASILLA', casilla })} className="btn3d grid size-8 place-items-center rounded-full" style={{ '--bg': '#FF8001', '--edge': '#FF4F1A', '--fg': '#fff', padding: 0, minHeight: 32 } as CSSProperties}>
                        <Icon name="repeat" size={16} />
                      </button>
                    </span>
                  ) : (
                    <span key={x} className="flex items-center gap-1.5 rounded-full py-1 pr-3 pl-1.5 font-sans text-[14px] font-extrabold text-ink" style={{ background: m.soft }}>
                      <span className="grid size-5 place-items-center rounded-full text-white" style={{ background: m.accent }}><Icon name="check" size={12} /></span>
                      {x}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Stats() {
  const { s } = useGame()
  const first = s.done > 0 ? Math.round((Math.max(0, s.done - Math.min(s.done, s.masterCount)) / s.done) * 100) : 0
  const mins = Math.floor(s.playSeconds / 60)
  const { nino, papa } = s.taught
  const total = nino + papa
  const cells: { icon: IconName; color: string; value: number; suffix?: string; label: string }[] = [
    { icon: 'trophy', color: '#FF8001', value: s.done, label: 'Retos completados' },
    { icon: 'star', color: '#FFC800', value: first, suffix: '%', label: 'Al primer intento' },
    { icon: 'clock', color: '#45C1FF', value: mins, suffix: ' min', label: 'Tiempo jugado' },
    { icon: 'calendar', color: '#73D83A', value: s.days.length, label: 'Días jugados' },
  ]
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2.5">
        {cells.map((c) => (
          <div key={c.label} className="card-in flex items-center gap-2.5 rounded-[20px] bg-[#F6F8FD] p-2.5">
            <span
              className="grid size-[38px] shrink-0 place-items-center rounded-full text-white"
              style={{ background: c.color }}
            >
              <Icon name={c.icon} size={22} solid color="#FFFFFF" />
            </span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="font-display text-[22px] leading-6 font-bold text-ink"><CountUp value={c.value} suffix={c.suffix} /></span>
              <span className="font-sans text-[14px] leading-4 font-bold text-ink2">{c.label}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="rounded-[20px] bg-[#F7E8FF] p-3">
        <div className="flex items-center justify-between">
          <span className="font-display text-[18px] font-semibold text-ink">Quién enseñó</span>
          <span className="flex items-center gap-1 rounded-full bg-white py-0.5 pr-3 pl-1.5 font-display text-[18px] font-semibold text-ink" aria-label={`${s.masterCount} sellos de maestro`}>
            <img src="/art/spike-medal.png" alt="" width={24} /><CountUp value={s.masterCount} />
          </span>
        </div>
        <div className="mt-2.5 flex h-4 overflow-hidden rounded-full bg-white" role="img" aria-label={`Niño ${nino}, padre ${papa}`}>
          {total > 0 && <>
            <span className="h-full" style={{ width: `${(nino / total) * 100}%`, background: '#FF8001', transition: 'width 800ms cubic-bezier(.3,1.15,.5,1)' }} />
            <span className="h-full" style={{ width: `${(papa / total) * 100}%`, background: '#45C1FF', transition: 'width 800ms cubic-bezier(.3,1.15,.5,1)' }} />
          </>}
        </div>
        <div className="mt-2 flex items-center justify-between font-sans text-[14px] font-extrabold text-ink">
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-[#FF8001]" />Niño · {nino}</span>
          <span className="flex items-center gap-1.5">Padre · {papa}<span className="size-3 rounded-full bg-[#45C1FF]" /></span>
        </div>
        <p className="mt-1.5 font-sans text-[14px] leading-5 font-bold text-ink2">{nino > 0 && papa > 0 ? '¡Los dos enseñaron!' : total > 0 ? '¡Cada sello cuenta!' : 'Los sellos aparecen cuando alguien enseña.'}</p>
      </div>
    </div>
  )
}

export function Album() {
  const { s } = useGame()
  const [openModules, setOpenModules] = useState(false)
  const [openStats, setOpenStats] = useState(false)
  const stage = stageOf(s.done)
  return (
    <Screen bg="#BCEDFF">
      <SkyHills />
      <div className="no-scrollbar absolute inset-0 overflow-y-auto px-5 pt-8 sm:pt-9 pb-[120px]">
        <h1 className="mb-4 px-1 font-display text-[34px] leading-10 font-bold text-white drop-shadow-[0_3px_0_rgba(0,123,185,.5)]">Progreso</h1>
        {/* always visible: Spike in his current stage and the overall bar */}
        <section className="card mb-3 flex items-center gap-3 p-4">
          <span className="relative grid size-[104px] shrink-0 place-items-center rounded-[24px]" style={{ background: MODULES[stage].soft }}>
            <Spike stage={stage} mood="calm" size={92} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-sans text-[14px] leading-4 font-bold text-ink2">Etapa {stage}</p>
            <p className="font-display text-[26px] leading-8 font-semibold text-ink">{STAGES[stage - 1]}</p>
            <div className="mt-2"><Bar pct={(s.done / TOTAL_CASILLAS) * 100} color="linear-gradient(90deg,#FF8001,#FFB24C)" height={12} /></div>
            <p className="mt-1.5 font-sans text-[14px] leading-4 font-extrabold text-ink"><CountUp value={s.done} /> de {TOTAL_CASILLAS} retos</p>
          </div>
        </section>
        <div className="flex flex-col gap-3">
          {/* Crecimiento: Estático, sin flecha de despliegue */}
          <section className="card p-4 overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <span
                className="grid size-11 shrink-0 place-items-center rounded-full text-white"
                style={{ background: '#73D83A' }}
              >
                <Icon name="growth" size={24} solid color="#FFFFFF" />
              </span>
              <h2 className="font-display text-[22px] leading-7 font-semibold text-ink">Crecimiento</h2>
            </div>
            <Growth />
          </section>

          {/* Mis módulos: Desplegable con animación y flecha que abre y cierra */}
          <Accordion
            id="modules"
            open={openModules}
            onToggle={() => setOpenModules((prev) => !prev)}
            icon="book"
            color="#E7B3FF"
            title="Mis módulos"
          >
            <Modules />
          </Accordion>

          {/* Estadísticas: Desplegable con animación y flecha que abre y cierra */}
          <Accordion
            id="stats"
            open={openStats}
            onToggle={() => setOpenStats((prev) => !prev)}
            icon="chart"
            color="#45C1FF"
            title="Estadísticas"
          >
            <Stats />
          </Accordion>
        </div>
      </div>
      <NavBar />
    </Screen>
  )
}

/* ============================== S24 · Perfil ============================== */

export function Profile() {
  const { s, dispatch } = useGame()
  const acc = s.account ?? { name: 'Familia Spike', email: 'familia@spike.app', password: '1234' }
  const stage = stageOf(s.done)
  const m = moduleOf(activeCasilla(s.done))
  const [editing, setEditing] = useState(false)
  const [pw, setPw] = useState('')
  const press = useRef<number>(0)
  const startPress = () => {
    press.current = window.setTimeout(() => dispatch({ type: 'GOTO', screen: 'investigator' }), 700)
  }
  const endPress = () => window.clearTimeout(press.current)
  const flow = useConnectFlow()
  const reconnect = () => {
    void egg.disconnect().then(() => flow.start())
  }
  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    dispatch({ type: 'LOGOUT' })
  }
  const handlePasswordChange = async () => {
    if (!editing) {
      setEditing(true)
      return
    }
    if (pw.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.updateUser({ password: pw })
      if (error) {
        alert(`Error actualizando contraseña: ${error.message}`)
        return
      }
      alert('¡Contraseña actualizada exitosamente!')
    } else {
      dispatch({ type: 'SET_PASSWORD', password: pw })
    }
    setPw('')
    setEditing(false)
  }
  return (
    <Screen bg="#BCEDFF">
      <SkyHills />
      <div className="no-scrollbar absolute inset-0 overflow-y-auto px-5 pt-6 pb-[120px]">
        <h1 className="mb-3 px-1 font-display text-[36px] leading-10 font-bold text-white drop-shadow-[0_3px_0_rgba(0,123,185,.5)]">Perfil</h1>
        <div className="flex flex-col items-center">
          <div className="relative grid size-[150px] place-items-center rounded-full bg-white shadow-[0_10px_26px_rgba(0,0,0,.14)]">
            <Spike stage={stage} mood="happy" size={118} />
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 font-display text-[18px] font-semibold text-white shadow-[0_4px_0_rgba(0,0,0,.18)]" style={{ background: m.accent }}>Nv {m.id}</span>
          </div>
        </div>
        <div className="mt-7 flex flex-col gap-4">
          <section className="card p-5">
            <div className="flex items-center gap-3">
              <ProfileFace size={52} />
              <div className="min-w-0">
                <p className="font-sans text-[14px] leading-4 font-bold text-ink2">Usuario</p>
                <p className="truncate font-display text-[22px] leading-7 font-semibold">{acc.name}</p>
              </div>
            </div>
            <div className="mt-4 rounded-[20px] bg-[#F6F8FB] px-4 py-3">
              <p className="font-sans text-[14px] leading-4 font-bold text-ink2">Correo</p>
              <p className="truncate font-sans text-[16px] leading-6 font-bold">{acc.email}</p>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-[20px] bg-[#F6F8FB] py-3 pr-3 pl-4">
              <div className="min-w-0 flex-1">
                <p className="font-sans text-[14px] leading-4 font-bold text-ink2">Contraseña</p>
                {editing ? (
                  <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" placeholder="Nueva contraseña" className="mt-0.5 h-8 w-full rounded-[12px] bg-white px-3 font-sans text-[16px] font-semibold outline-none" />
                ) : (
                  <p className="font-sans text-[20px] leading-6 font-bold tracking-widest">•••••••</p>
                )}
              </div>
              <button type="button" onClick={() => void handlePasswordChange()} className="btn3d inline-flex min-h-12 items-center rounded-full px-5 font-display text-[16px] font-semibold" style={{ '--bg': '#fff', '--edge': '#D9DEE7', '--fg': '#4A5A8C' } as React.CSSProperties}>{editing ? 'Guardar' : 'Cambiar'}</button>
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full text-white" style={{ background: s.connected ? '#45C1FF' : '#9AA5B1' }}><Icon name={s.connected ? 'bluetooth' : 'bluetoothOff'} size={26} /></span>
              <div className="flex-1">
                <p className="font-sans text-[14px] leading-4 font-bold text-ink2">Conexión al huevo</p>
                <p className="flex items-center gap-2 font-display text-[20px] leading-7 font-semibold"><ConnDot on={s.connected} />{s.connected ? 'Conectado' : 'Desconectado'}</p>
              </div>
            </div>
            <div className="mt-4"><Btn icon="refresh" onClick={reconnect}>Reconectar</Btn></div>
          </section>

          <Btn variant="soft" icon="exit" onClick={() => void logout()}>Cerrar sesión</Btn>
          <button
            type="button"
            onPointerDown={startPress}
            onPointerUp={endPress}
            onPointerLeave={endPress}
            onContextMenu={(e) => e.preventDefault()}
            className="mx-auto min-h-12 rounded-full px-5 font-sans text-[14px] font-bold text-ink2 select-none"
            aria-label="Versión 1.0.0. Mantén pulsado para abrir el Modo investigador"
          >
            SPIKE · versión 1.0.0
          </button>
        </div>
      </div>
      <NavBar />
    </Screen>
  )
}

/* ============================== S25 · Modo investigador ============================== */

export function Investigator() {
  const { s, dispatch } = useGame()
  const [flash, setFlash] = useState(false)
  const [showEgg, setShowEgg] = useState(false)
  const exportCSV = () => {
    const u = URL.createObjectURL(new Blob([toCSV(s.log)], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = u
    a.download = 'spike-registro.csv'
    a.click()
    URL.revokeObjectURL(u)
    setFlash(true)
  }
  const sample = [{ id: 0, hora: '10:12', modulo: 'Palabras', turno: 'Padre hace la seña', actor: 'Niño' as const, accion: 'Elige Amarillo', contenido: 'HAMBRE', correcto: 'Sí' as const, intento: 1, calor: 6 }]
  const rows = s.log.length ? s.log : sample
  const tgl = (icon: 'download' | 'keyboard' | 'bluetoothOff' | 'bluetooth' | 'refresh', label: string, on: boolean, click: () => void) => (
    <button type="button" onClick={click} className={`flex min-h-16 items-center gap-3 rounded-[20px] px-3 text-left font-display text-[16px] leading-5 font-semibold shadow-[0_4px_12px_rgba(0,0,0,.08)] transition-colors ${on ? 'bg-[#F7E8FF]' : 'bg-white'}`}>
      <span className={`grid size-10 shrink-0 place-items-center rounded-full text-white ${on ? 'bg-[#D06BFF]' : 'bg-[#9AA5B1]'}`}><Icon name={icon} size={22} /></span>
      {label}
    </button>
  )
  return (
    <Screen bg="#F1F3F8">
      <div className="no-scrollbar absolute inset-0 overflow-y-auto px-5 pt-5 pb-8">
        <div className="mb-4 flex items-center gap-3">
          <button type="button" aria-label="Volver al perfil" onClick={() => dispatch({ type: 'GOTO', screen: 'profile' })} className="btn3d grid size-14 place-items-center rounded-full" style={{ '--bg': '#fff', '--edge': '#FFD2A8', '--fg': '#FF8001', padding: 0, minHeight: 56 } as React.CSSProperties}><Icon name="arrowLeft" size={24} /></button>
          <div>
            <p className="font-sans text-[14px] leading-4 font-extrabold tracking-wide text-ink2 uppercase">Oculto</p>
            <h1 className="font-display text-[28px] leading-8 font-semibold">Modo investigador</h1>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {tgl('download', flash ? 'CSV descargado' : 'Exportar CSV', flash, exportCSV)}
          {tgl('keyboard', 'Modo teclado', s.keyboard, () => dispatch({ type: 'TOGGLE_KEYBOARD' }))}
          {tgl('bluetoothOff', 'Simular fallo al conectar', s.simFail, () => dispatch({ type: 'TOGGLE_SIMFAIL' }))}
          {tgl('bluetooth', showEgg ? 'Ocultar huevo' : 'Simulador huevo', showEgg, () => setShowEgg(!showEgg))}
          {tgl('refresh', 'Reiniciar datos', false, () => dispatch({ type: 'RESET' }))}
        </div>
        {showEgg && (
          <div className="mt-4 overflow-hidden rounded-[32px] shadow-lg">
            <EggBox />
          </div>
        )}
        <div className="mt-4"><Card title={s.log.length ? `Registro · ${s.log.length} filas` : 'Registro · ejemplo'}>
          <div className="max-h-[210px] overflow-auto rounded-[16px]">
            <table className="w-full text-left font-sans text-[14px] leading-5">
              <thead className="sticky top-0 bg-white font-extrabold text-ink2"><tr>{['Hora', 'Módulo', 'Actor', 'Acción', 'OK'].map((h) => <th key={h} className="px-2 pb-1">{h}</th>)}</tr></thead>
              <tbody>{rows.slice().reverse().map((r, i) => (
                <tr key={r.id} className={`align-top ${i % 2 ? '' : 'bg-[#F6F8FB]'}`}>
                  <td className="px-2 py-1.5">{r.hora}</td><td className="px-2 py-1.5">{r.modulo}</td><td className="px-2 py-1.5 font-bold">{r.actor}</td>
                  <td className="px-2 py-1.5">{r.accion}<b className="block">{r.contenido}</b></td><td className="px-2 py-1.5">{r.correcto}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card></div>
        <div className="mt-4"><Card title="Reglas del juego">
          <ol className="list-decimal space-y-1.5 pl-5 font-sans text-[14px] leading-5 font-semibold text-ink2">{FULL_RULES.map((r) => <li key={r}>{r}</li>)}</ol>
        </Card></div>
      </div>
    </Screen>
  )
}
