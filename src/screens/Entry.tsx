import { useEffect, useState, type ReactNode } from 'react'
import { useGame } from '../game/context'
import { SkyHills } from '../art/SkyHills'
import { Btn, ProfileFace, Screen, Spike, usePausedTimeout } from '../components/ui'
import { Icon } from '../components/glyphs'
import { egg, virtualEgg } from '../egg'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

/* ============================== shared bits ============================== */

function MiniEgg({ color, className = '', style }: { color: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width="30" height="36" viewBox="0 0 100 116" className={className} style={style} aria-hidden>
      <path d="M50 4C74 4 94 46 94 74c0 24-19 40-44 40S6 98 6 74C6 46 26 4 50 4z" fill={color} />
      <ellipse cx="34" cy="30" rx="7" ry="11" fill="#fff" opacity=".5" transform="rotate(24 34 30)" />
    </svg>
  )
}

/** Sky + hills with a white card on top, used by login / register / connect. */
function SkyScreen({ children }: { children: ReactNode }) {
  return (
    <Screen bg="#BCEDFF">
      <SkyHills />
      {children}
    </Screen>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block px-1 font-sans text-[14px] font-bold text-ink">{label}</span>
      {children}
      {error && (
        <span className="mt-1.5 flex items-center gap-1.5 px-1 font-sans text-[14px] font-bold text-accent" role="alert">
          <Icon name="info" size={16} />
          {error}
        </span>
      )}
    </label>
  )
}
const inputCls = (err?: string) =>
  `h-14 w-full rounded-[20px] px-5 font-sans text-[16px] font-semibold text-ink transition-colors outline-none focus:bg-white focus:shadow-[0_0_0_3px_#45C1FF] ${err ? 'bg-[#FFEDE6]' : 'bg-[#F1F3F8]'}`

/* ============================== S1 · Loader ============================== */

export function Loader() {
  const { dispatch } = useGame()
  useEffect(() => {
    const t = window.setTimeout(() => dispatch({ type: 'LOADER_DONE' }), 2500)
    return () => window.clearTimeout(t)
  }, [dispatch])
  return (
    <Screen bg="#FF8001" className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden select-none">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="ray-spin absolute top-1/2 left-1/2 size-[clamp(700px,140vw,1100px)] -translate-x-1/2 -translate-y-[48%] opacity-75 mix-blend-screen"
          style={{
            background:
              'repeating-conic-gradient(from 0deg, rgba(255,255,255,.34) 0deg 12deg, rgba(255,255,255,0) 12deg 30deg)',
            maskImage: 'radial-gradient(circle, #000 12%, transparent 62%)',
            WebkitMaskImage: 'radial-gradient(circle, #000 12%, transparent 62%)',
          }}
        />
      </div>
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-8">
        <Spike stage={5} mood="happy" size={190} className="-mb-1" />
        <img
          src="/assets/spike-logo.svg"
          alt="SPIKE"
          draggable={false}
          className="mt-1 h-auto w-[clamp(210px,58vw,265px)] object-contain drop-shadow-[0_6px_0_#FF4F1A]"
        />
        <div className="relative mt-12 w-[260px] max-w-[80vw]">
          <div className="h-5 w-full rounded-full bg-white/35" />
          <div
            className="absolute top-0 left-0 h-5 rounded-full bg-white shadow-[0_4px_0_#FF4F1A]"
            style={{ animation: 'load-bar 2.4s cubic-bezier(.4,.1,.3,1) both' }}
          />
          {/* egg that warms up from grey to orange while the bar fills */}
          <div
            className="absolute -top-[14px] left-0 w-full"
            style={{ animation: 'load-bar 2.4s cubic-bezier(.4,.1,.3,1) both' }}
          >
            <div className="absolute -right-4 -top-1 size-[38px]">
              <MiniEgg color="#C9CFD8" className="absolute inset-0 drop-shadow-[0_3px_5px_rgba(0,0,0,.2)]" />
              <MiniEgg color="#FFE44C" className="absolute inset-0" style={{ animation: 'fade-in 2.4s ease-in both' }} />
            </div>
          </div>
        </div>
      </div>
    </Screen>
  )
}

/* ============================== S2 · Bienvenida ============================== */

export function Welcome() {
  const { dispatch } = useGame()
  return (
    <Screen bg="#FF8001" className="relative flex h-full w-full flex-col justify-between overflow-hidden select-none">
      {/* Background radial rays & halo glow centered behind logo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* Soft radial white glow halo */}
        <div
          className="absolute top-[44%] left-1/2 size-[clamp(300px,90vw,440px)] -translate-x-1/2 -translate-y-1/2 mix-blend-plus-lighter"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 35%, rgba(255,255,255,0) 70%)',
          }}
        />
        {/* Sunburst rays */}
        <img
          src="/assets/69866.png"
          alt=""
          draggable={false}
          className="pointer-events-none absolute top-[44%] left-1/2 size-[clamp(750px,210vw,1100px)] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover opacity-90 mix-blend-screen"
        />
      </div>

      {/* Central protagonist: SPIKE dino head logo */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-[clamp(20px,5vh,48px)]">
        <div className="relative flex w-full max-w-[320px] items-center justify-center">
          <img
            src="/assets/spike-logo-completo.svg"
            alt="SPIKE"
            draggable={false}
            className="w-[clamp(240px,70vw,310px)] max-h-[42vh] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)] transition-transform duration-300 hover:scale-[1.02]"
          />
        </div>
      </div>

      {/* Bottom action buttons */}
      <div
        className="relative z-10 mx-auto flex w-full max-w-[340px] flex-col gap-3.5 px-6"
        style={{ paddingBottom: 'calc(clamp(1.75rem, 5vh, 3.25rem) + env(safe-area-inset-bottom, 0px))' }}
      >
        <button
          type="button"
          onClick={() => dispatch({ type: 'GOTO', screen: 'login' })}
          className="flex h-[56px] sm:h-[60px] w-full items-center justify-center rounded-full bg-white font-display text-[20px] font-bold text-[#FF8001] shadow-[inset_0px_-6px_0px_0px_#FF4F1A] transition-all duration-150 active:translate-y-1 active:shadow-[inset_0px_-2px_0px_0px_#FF4F1A] cursor-pointer"
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'GOTO', screen: 'register' })}
          className="flex h-[56px] sm:h-[60px] w-full items-center justify-center rounded-full bg-[#FF8001] font-display text-[20px] font-bold text-white shadow-[inset_0px_-6px_0px_0px_#FF4F1A] transition-all duration-150 active:translate-y-1 active:shadow-[inset_0px_-2px_0px_0px_#FF4F1A] cursor-pointer"
        >
          Registrarse
        </button>
      </div>
    </Screen>
  )
}

/* ============================== S3 · Inicio de sesión ============================== */

const validEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim())

export function Login() {
  const { s, dispatch } = useGame()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errs, setErrs] = useState<{ email?: string; pass?: string }>({})
  const submit = async () => {
    const e: typeof errs = {}
    if (!email.trim()) e.email = 'Escribe tu correo'
    else if (!validEmail(email)) e.email = 'Revisa tu correo: falta la @'
    if (!pass) e.pass = 'Escribe tu contraseña'
    else if (pass.length < 4) e.pass = 'Usa 4 letras o más'
    setErrs(e)
    if (e.email || e.pass) return

    if (isSupabaseConfigured) {
      setLoading(true)
      dispatch({ type: 'CLEAR_AUTH_ERROR' })
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      })
      setLoading(false)
      if (error) {
        const msg = error.message.includes('Invalid login credentials')
          ? 'Correo o contraseña incorrectos'
          : error.message.includes('Email not confirmed')
          ? 'Por favor confirma tu correo electrónico'
          : error.message
        dispatch({ type: 'SET_AUTH_ERROR', error: msg })
        return
      }
      if (data.user) {
        const name = (data.user.user_metadata?.name as string) || data.user.email?.split('@')[0] || 'Familia'
        dispatch({
          type: 'SET_ACCOUNT',
          account: { id: data.user.id, name, email: data.user.email || '' },
          session: true,
        })
        dispatch({ type: 'GOTO', screen: 'connect' })
      }
    } else {
      dispatch({ type: 'LOGIN', email: email.trim(), password: pass })
    }
  }
  return (
    <SkyScreen>
      <div className="absolute left-5 z-20" style={{ top: 'calc(1.25rem + env(safe-area-inset-top, 0px))' }}>
        <button
          type="button"
          onClick={() => dispatch({ type: 'GOTO', screen: 'welcome' })}
          aria-label="Volver"
          className="btn3d grid size-14 place-items-center rounded-full"
          style={{ '--bg': '#fff', '--edge': '#FFD2A8', '--fg': '#FF8001', padding: 0, minHeight: 56 } as React.CSSProperties}
        >
          <Icon name="arrowLeft" size={24} solid color="#FF8001" />
        </button>
      </div>
      <div
        className="relative z-10 flex h-full w-full overflow-y-auto px-5 no-scrollbar"
        style={{
          paddingTop: 'calc(4.75rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(4.75rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <form
          className="card my-auto mx-auto flex w-full max-w-[350px] flex-col gap-4 p-6"
          onSubmit={(e) => { e.preventDefault(); void submit() }}
          noValidate
        >
          <h1 className="text-left font-display text-[28px] leading-8 font-semibold text-ink px-1">
            Iniciar sesión
          </h1>
          <Field label="Correo" error={errs.email}>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setErrs({ ...errs, email: undefined })
                dispatch({ type: 'CLEAR_AUTH_ERROR' })
              }}
              placeholder="tucorreo@mail.com"
              className={inputCls(errs.email)}
            />
          </Field>
          <Field label="Contraseña" error={errs.pass ?? s.authError ?? undefined}>
            <span className="relative block">
              <input
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={pass}
                onChange={(e) => {
                  setPass(e.target.value)
                  setErrs({ ...errs, pass: undefined })
                  dispatch({ type: 'CLEAR_AUTH_ERROR' })
                }}
                placeholder="••••••"
                className={`${inputCls(errs.pass ?? s.authError ?? undefined)} pr-14`}
              />
              <button
                type="button"
                aria-label={show ? 'Ocultar contraseña' : 'Ver contraseña'}
                onClick={() => setShow(!show)}
                className="absolute top-1/2 right-2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-[#9AA5B1]"
              >
                <Icon name={show ? 'eyeOff' : 'eye'} size={26} />
              </button>
            </span>
          </Field>
          <Btn type="submit" disabled={loading} className="mt-1">
            {loading ? 'Ingresando…' : 'Ingresar'}
          </Btn>
          <button
            type="button"
            onClick={() => dispatch({ type: 'GOTO', screen: 'register' })}
            className="mx-auto min-h-[44px] px-4 font-display text-[17px] font-semibold text-ink underline decoration-[#FF8001] decoration-[3px] underline-offset-4"
          >
            Crear cuenta
          </button>
        </form>
      </div>
    </SkyScreen>
  )
}

/* ============================== S4 · Registro ============================== */

export function Register() {
  const { dispatch } = useGame()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errs, setErrs] = useState<{ name?: string; email?: string; pass?: string }>({})
  const submit = async () => {
    const e: typeof errs = {}
    if (!name.trim()) e.name = 'Escribe un nombre de usuario'
    if (!email.trim()) e.email = 'Escribe tu correo'
    else if (!validEmail(email)) e.email = 'Revisa tu correo: falta la @'
    if (!pass) e.pass = 'Crea una contraseña'
    else if (pass.length < 6) e.pass = 'Usa 6 letras o más'
    setErrs(e)
    if (e.name || e.email || e.pass) return

    if (isSupabaseConfigured) {
      setLoading(true)
      dispatch({ type: 'CLEAR_AUTH_ERROR' })
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pass,
        options: {
          data: { name: name.trim() },
        },
      })
      setLoading(false)
      if (error) {
        const msg = error.message.includes('User already registered')
          ? 'Ya existe una cuenta con este correo'
          : error.message.includes('Password should be')
          ? 'La contraseña debe tener al menos 6 caracteres'
          : error.message.includes('rate limit')
          ? 'Límite de correos alcanzado en Supabase (desactiva "Confirm email" en el panel)'
          : error.message
        setErrs({ ...errs, email: msg })
        return
      }
      if (data.user) {
        dispatch({
          type: 'SET_ACCOUNT',
          account: { id: data.user.id, name: name.trim(), email: data.user.email || '' },
          session: true,
        })
        dispatch({ type: 'GOTO', screen: 'connect' })
      }
    } else {
      dispatch({ type: 'REGISTER', account: { name: name.trim(), email: email.trim(), password: pass } })
    }
  }
  return (
    <SkyScreen>
      <div className="absolute left-5 z-20" style={{ top: 'calc(1.25rem + env(safe-area-inset-top, 0px))' }}>
        <button
          type="button"
          onClick={() => dispatch({ type: 'GOTO', screen: 'welcome' })}
          aria-label="Volver"
          className="btn3d grid size-14 place-items-center rounded-full"
          style={{ '--bg': '#fff', '--edge': '#FFD2A8', '--fg': '#FF8001', padding: 0, minHeight: 56 } as React.CSSProperties}
        >
          <Icon name="arrowLeft" size={24} solid color="#FF8001" />
        </button>
      </div>
      <div
        className="relative z-10 flex h-full w-full overflow-y-auto px-5 no-scrollbar"
        style={{
          paddingTop: 'calc(4.75rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(4.75rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <form
          className="card my-auto mx-auto flex w-full max-w-[350px] flex-col gap-3 p-5"
          onSubmit={(e) => { e.preventDefault(); void submit() }}
          noValidate
        >
          <h1 className="text-left font-display text-[28px] leading-8 font-semibold text-ink px-1">
            Crea tu cuenta
          </h1>
          <Field label="Nombre de usuario" error={errs.name}>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setErrs({ ...errs, name: undefined }) }}
              autoComplete="nickname"
              placeholder="Tu nombre"
              className={inputCls(errs.name)}
            />
          </Field>
          <Field label="Correo" error={errs.email}>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrs({ ...errs, email: undefined }) }}
              placeholder="tucorreo@mail.com"
              className={inputCls(errs.email)}
            />
          </Field>
          <Field label="Contraseña" error={errs.pass}>
            <span className="relative block">
              <input
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                value={pass}
                onChange={(e) => { setPass(e.target.value); setErrs({ ...errs, pass: undefined }) }}
                placeholder="••••••"
                className={`${inputCls(errs.pass)} pr-14`}
              />
              <button
                type="button"
                aria-label={show ? 'Ocultar contraseña' : 'Ver contraseña'}
                onClick={() => setShow(!show)}
                className="absolute top-1/2 right-2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-[#9AA5B1]"
              >
                <Icon name={show ? 'eyeOff' : 'eye'} size={26} />
              </button>
            </span>
          </Field>
          <Btn type="submit" disabled={loading} className="mt-1">
            {loading ? 'Creando cuenta…' : 'Registrarme'}
          </Btn>
        </form>
      </div>
    </SkyScreen>
  )
}

/* ============================== S5 · Conectar huevo ============================== */

/** Starts the link with the egg (simulator or Bluetooth, through the EggDevice interface). Shared with the disconnected sheet. */
export function useConnectFlow() {
  const { s, dispatch } = useGame()
  const state: 'idle' | 'searching' | 'connected' | 'error' = s.connected ? 'connected' : s.link === 'searching' ? 'searching' : s.link === 'error' ? 'error' : 'idle'
  const start = () => {
    if (s.link === 'searching') return
    virtualEgg.failNext = s.simFail && !s.failedOnce
    dispatch({ type: 'CONNECT_START' })
    egg.connect().catch(() => dispatch({ type: 'CONNECT_FAIL' }))
  }
  return { state, start }
}

/** Big Spike-egg that trembles, lights up with a soft blue elevation shadow, or goes dark. */
export function BigEgg({ state, size = 220, blue }: { state: 'idle' | 'searching' | 'connected' | 'error'; size?: number; blue?: boolean }) {
  const lit = state === 'connected'
  const off = state === 'error' || blue
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size * 1.1 }}>
      {/* Subtle ambient light: soft blue diffuse shadow when connected, no intense orange glow */}
      <div
        className="absolute inset-[8%] rounded-full blur-xl transition-all duration-500"
        style={{
          background: lit
            ? 'radial-gradient(circle, rgba(69, 193, 255, 0.3) 0%, rgba(69, 193, 255, 0) 70%)'
            : blue
              ? '#45C1FF'
              : '#FF8001',
          opacity: lit ? 0.6 : blue ? 0.45 : 0,
        }}
      />
      <div
        className={`relative transition-[filter] duration-500 ${state === 'searching' ? 'egg-tremble' : ''}`}
        style={{
          filter: off
            ? 'grayscale(1) brightness(.78)'
            : lit
              ? 'drop-shadow(0 14px 22px rgba(28, 114, 184, 0.22))'
              : 'grayscale(.45) brightness(1.04)',
        }}
      >
        <Spike stage={1} mood={lit ? 'happy' : 'calm'} size={size} animate={state !== 'searching'} />
      </div>
      {blue && (
        <div
          className="absolute inset-0 rounded-full mix-blend-multiply"
          style={{ background: 'radial-gradient(circle at 50% 56%, rgba(69,193,255,.5), transparent 62%)' }}
        />
      )}
    </div>
  )
}

export function Connect() {
  const { s, dispatch } = useGame()
  const { state, start } = useConnectFlow()
  usePausedTimeout(() => dispatch({ type: 'CONNECT_NEXT' }), 1500, state === 'connected')
  const copy = {
    idle: { t: 'Conecta el huevo', d: 'Enciéndelo y ponlo cerca del celular.' },
    searching: { t: 'Buscando…', d: 'El huevo tiembla cuando te encuentra.' },
    connected: { t: '¡Conectado!', d: 'Spike despierta. Vamos…' },
    error: { t: 'No lo encontramos', d: 'Acércalo y vuelve a intentar.' },
  }[state]

  const userName = s.account?.name || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('screen') === 'connect' ? 'Sebas' : null)

  return (
    <SkyScreen>
      {/* Top bar: back button + user indicator with original profile avatar */}
      <div
        className="absolute right-5 left-5 z-20 flex items-center justify-between"
        style={{ top: 'calc(1.25rem + env(safe-area-inset-top, 0px))' }}
      >
        <button
          type="button"
          onClick={() => dispatch({ type: 'LOGOUT' })}
          aria-label="Cerrar sesión"
          className="btn3d grid size-14 place-items-center rounded-full"
          style={{ '--bg': '#fff', '--edge': '#FFD2A8', '--fg': '#FF8001', padding: 0, minHeight: 56 } as React.CSSProperties}
        >
          <Icon name="arrowLeft" size={24} solid color="#FF8001" />
        </button>
        {userName && (
          <span className="flex items-center rounded-full bg-white/90 py-1.5 pr-4 pl-1.5 font-display text-[16px] font-semibold shadow-[0_3px_8px_rgba(0,0,0,.1)]">
            <span className="mr-2 inline-grid size-8 place-items-center align-middle overflow-hidden">
              <ProfileFace size={32} />
            </span>
            {userName}
          </span>
        )}
      </div>

      {/* Centered card and egg */}
      <div
        className="relative z-10 flex h-full w-full overflow-y-auto px-5 no-scrollbar"
        style={{
          paddingTop: 'calc(4.75rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="my-auto mx-auto flex w-full max-w-[340px] flex-col items-center">
          <BigEgg state={state} size={265} />
          <div className="card mt-4 flex w-full flex-col items-center gap-1.5 px-6 pt-5 pb-6 text-center" aria-live="polite">
            <h1 className="font-display text-[28px] leading-8 font-semibold text-ink">{copy.t}</h1>
            <p className="min-h-6 text-center font-sans text-[16px] leading-6 font-semibold text-ink2">{copy.d}</p>
            <div className="mt-4 w-full">
              {state === 'idle' && <Btn icon="bluetooth" onClick={start}>Conectar huevo</Btn>}
              {state === 'searching' && (
                <div className="flex h-[60px] items-center justify-center gap-2" aria-hidden>
                  {[0, 1, 2].map((k) => (
                    <span
                      key={k}
                      className="dot-bounce size-3.5 rounded-full bg-[#FF8001]"
                      style={{ animationDelay: `${k * 140}ms` }}
                    />
                  ))}
                </div>
              )}
              {state === 'connected' && (
                <div className="pop flex h-[60px] w-full items-center justify-center gap-2 rounded-full bg-[#369C00] font-display text-[20px] font-bold text-white shadow-[0_4px_14px_rgba(54,156,0,0.35)]">
                  <Icon name="check" size={24} solid color="#FFFFFF" />
                  <span>Listo</span>
                </div>
              )}
              {state === 'error' && <Btn icon="refresh" onClick={start}>Reintentar</Btn>}
            </div>
          </div>
        </div>
      </div>
    </SkyScreen>
  )
}

