import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder')
)

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] Faltan las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. ' +
    'Configúralas en .env.local para habilitar la base de datos y autenticación real.'
  )
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

export interface DbGameProgress {
  user_id: string
  done: number
  master_count: number
  master_seals: string[]
  taught: { nino: number; papa: number }
  play_seconds: number
  days: string[]
  learned: Record<string, string[]>
  replay: string[]
  tutorial_done: boolean
  updated_at?: string
}

export async function fetchUserProgress(userId: string): Promise<DbGameProgress | null> {
  if (!isSupabaseConfigured) return null
  try {
    const { data, error } = await supabase
      .from('game_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('[Supabase] Error cargando progreso:', error.message)
      return null
    }
    return data as DbGameProgress | null
  } catch (err) {
    console.error('[Supabase] Excepción en fetchUserProgress:', err)
    return null
  }
}

export async function saveUserProgress(userId: string, progress: Omit<DbGameProgress, 'user_id' | 'updated_at'>): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  try {
    const { error } = await supabase
      .from('game_progress')
      .upsert({
        user_id: userId,
        done: progress.done,
        master_count: progress.master_count,
        master_seals: progress.master_seals,
        taught: progress.taught,
        play_seconds: progress.play_seconds,
        days: progress.days,
        learned: progress.learned,
        replay: progress.replay,
        tutorial_done: progress.tutorial_done,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      console.error('[Supabase] Error guardando progreso:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('[Supabase] Excepción en saveUserProgress:', err)
    return false
  }
}

export async function insertGameLog(userId: string, row: {
  hora: string
  modulo: string
  turno: string
  actor: string
  accion: string
  contenido: string
  correcto: string
  intento: number
  calor: number
}): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  try {
    const { error } = await supabase
      .from('game_logs')
      .insert({
        user_id: userId,
        hora: row.hora,
        modulo: row.modulo,
        turno: row.turno,
        actor: row.actor,
        accion: row.accion,
        contenido: row.contenido,
        correcto: row.correcto,
        intento: row.intento,
        calor: row.calor,
      })

    if (error) {
      console.error('[Supabase] Error insertando log:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('[Supabase] Excepción en insertGameLog:', err)
    return false
  }
}
