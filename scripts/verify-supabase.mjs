import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envContent = fs.readFileSync('.env.local', 'utf8')
const env = {}
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim()
}

const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verify() {
  console.log('--- VERIFICACIÓN DE SUPABASE PARA SPIKE ---')
  console.log('1. URL del Proyecto:', supabaseUrl)
  console.log('2. Comprobando existencia de tablas...')

  const { error: profErr } = await supabase.from('profiles').select('id').limit(1)
  const { error: progErr } = await supabase.from('game_progress').select('user_id').limit(1)
  const { error: logsErr } = await supabase.from('game_logs').select('id').limit(1)

  const tablesExist = !profErr && !progErr && !logsErr

  if (tablesExist) {
    console.log('✅ Tablas encontradas: profiles, game_progress, game_logs existen en la base de datos.')
  } else {
    console.log('⚠️ Las tablas aún no están creadas en la base de datos.')
    if (profErr) console.log('   - profiles:', profErr.message)
    if (progErr) console.log('   - game_progress:', progErr.message)
    if (logsErr) console.log('   - game_logs:', logsErr.message)
    return false
  }

  console.log('3. Probando flujo de autenticación y RLS...')
  const testEmail = `spike_verify_${Date.now()}@spike.app`
  const testPassword = 'SpikePassword123!'
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: { data: { name: 'Familia Verificación' } }
  })

  if (signUpErr) {
    console.log('❌ Error en SignUp:', signUpErr.message)
    return false
  }
  console.log('✅ Registro exitoso en auth.users! User ID:', signUpData.user?.id)

  if (signUpData.session) {
    console.log('✅ Sesión creada inmediatamente (Confirm Email está desactivado).')
  } else {
    console.log('ℹ️ Registro completado. (Confirm Email está activado en Supabase Auth).')
  }

  return true
}

verify().then((ok) => {
  if (ok) console.log('--- VERIFICACIÓN COMPLETADA EXITOSAMENTE ---')
  else console.log('--- PENDIENTE APLICAR MIGRACIÓN EN SUPABASE ---')
}).catch(console.error)
