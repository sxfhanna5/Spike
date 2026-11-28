export type ModuleId = 1 | 2 | 3 | 4 | 5
export type Round = 'directa' | 'inversa'
export type Person = 'papa' | 'nino'
export type ContentKind = 'letter' | 'color' | 'number' | 'word' | 'write'

export interface ChallengeDef {
  content: string
  round: Round
  options: [string, string, string]
  kind: ContentKind
  digit?: number
}
export interface Challenge extends ChallengeDef {
  correct: 0 | 1 | 2
}

export interface ModuleDef {
  id: ModuleId
  name: string
  /** Big title of the level card. */
  title: string
  color: string
  accent: string
  /** Soft tint for backgrounds of chips. */
  soft: string
  /** Stage of Spike while this module is in progress (1 huevo … 5 adulto). */
  stage: ModuleId
  contents: string[]
  challenges: ChallengeDef[]
  /** Global casilla numbers (1–46). */
  first: number
  last: number
}

export const TOTAL_CASILLAS = 46

/** Spike grows one step per module. */
export const STAGES = ['Huevo', 'Bebé', 'Pequeño', 'Joven', 'Adulto'] as const

/** Round names: they alternate one by one. */
export const ROUND_INFO: Record<Round, { title: string; detail: string; short: string; signer: Person; guesser: Person }> = {
  directa: { title: 'Padre hace la seña', detail: 'Padre hace la seña · niño adivina', short: 'Padre hace seña · niño adivina', signer: 'papa', guesser: 'nino' },
  inversa: { title: 'Niño hace la seña', detail: 'Niño hace la seña · padre adivina', short: 'Niño hace seña · padre adivina', signer: 'nino', guesser: 'papa' },
}

export const PERSON_LABEL: Record<Person, string> = { papa: 'Padre', nino: 'Niño' }
export const ROLE_COLOR: Record<Person, string> = { nino: '#FF8001', papa: '#45C1FF' }

/** The three colour buttons of the box: ● ▲ ■ (same on cards and on the physical egg). */
export const OPTION_META = [
  { key: 'amarillo', label: 'Amarillo', shape: 'circle', color: '#FFE44C', ink: '#A87B00', hotkey: '1' },
  { key: 'azul', label: 'Azul', shape: 'triangle', color: '#45C1FF', ink: '#007BB9', hotkey: '2' },
  { key: 'morado', label: 'Morado', shape: 'square', color: '#E7B3FF', ink: '#D06BFF', hotkey: '3' },
] as const

const C = (content: string, kind: ContentKind, a: string, b: string, digit?: number): ChallengeDef => ({
  content,
  kind,
  round: 'directa',
  options: [content, a, b],
  digit,
})

/** One by one: Padre hace la seña, Niño hace la seña, … (the phone turns once per turn). */
const alternate = (list: ChallengeDef[]): ChallengeDef[] => list.map((c, k) => ({ ...c, round: k % 2 === 0 ? 'directa' : 'inversa' }))

const letters = alternate([
  C('A', 'letter', 'E', 'O'), C('E', 'letter', 'I', 'A'), C('I', 'letter', 'O', 'E'),
  C('O', 'letter', 'A', 'E'), C('M', 'letter', 'N', 'P'), C('P', 'letter', 'D', 'M'),
  C('D', 'letter', 'P', 'N'), C('N', 'letter', 'M', 'D'),
])

export const COLOR_HEX: Record<string, string> = {
  ROJO: '#E8453C', AZUL: '#2F80ED', AMARILLO: '#FFC800', VERDE: '#3DB54A', NARANJA: '#FF8A00', MORADO: '#9B51E0', ROSADO: '#FF8FB1',
}
const colors = alternate([
  C('ROJO', 'color', 'AZUL', 'VERDE'), C('AZUL', 'color', 'AMARILLO', 'ROJO'), C('AMARILLO', 'color', 'VERDE', 'AZUL'),
  C('VERDE', 'color', 'ROJO', 'NARANJA'), C('NARANJA', 'color', 'MORADO', 'AMARILLO'),
  C('MORADO', 'color', 'ROSADO', 'AZUL'), C('ROSADO', 'color', 'NARANJA', 'MORADO'),
])

export const NUMBER_NAMES = ['UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE', 'DIEZ']
const numbers = alternate(NUMBER_NAMES.map((w, k) => C(w, 'number', NUMBER_NAMES[(k + 1) % 10], NUMBER_NAMES[(k + 3) % 10], k + 1)))

// GRACIAS + PERDÓN form one paired content so the module keeps its 15 retos.
const words = alternate([
  C('FELIZ', 'word', 'TRISTE', 'MIEDO'), C('TRISTE', 'word', 'ENOJADO', 'CANSADO'),
  C('ENOJADO', 'word', 'MIEDO', 'FELIZ'), C('MIEDO', 'word', 'FELIZ', 'ABRAZO'),
  C('ABRAZO', 'word', 'GRACIAS / PERDÓN', 'TRISTE'), C('CANSADO', 'word', 'SUEÑO', 'ENOJADO'),
  C('GRACIAS / PERDÓN', 'word', 'ABRAZO', 'AYUDA'), C('MAMÁ', 'word', 'PAPÁ', 'AYUDA'),
  C('HAMBRE', 'word', 'SED', 'SUEÑO'), C('PAPÁ', 'word', 'MAMÁ', 'HAMBRE'),
  C('SED', 'word', 'HAMBRE', 'BAÑO'), C('SUEÑO', 'word', 'CANSADO', 'JUGAR'),
  C('BAÑO', 'word', 'AYUDA', 'SED'), C('AYUDA', 'word', 'MAMÁ', 'JUGAR'),
  C('JUGAR', 'word', 'SUEÑO', 'ABRAZO'),
])

// Escribir also alternates: one spells and the other writes.
export const WRITE_WORDS = ['MAMÁ', 'PAPÁ', 'AYUDA', 'AMO', 'GRACIAS', 'DIME']
const writes = alternate(WRITE_WORDS.map((w) => C(w, 'write', w, w)))

const mk = (id: ModuleId, name: string, title: string, color: string, accent: string, soft: string, list: ChallengeDef[], first: number): ModuleDef => ({
  id, name, title, color, accent, soft, stage: id, contents: list.map((c) => c.content), challenges: list, first, last: first + list.length - 1,
})

export const MODULES: Record<ModuleId, ModuleDef> = {
  1: mk(1, 'Letras', 'Abecedario', '#E7B3FF', '#D06BFF', '#F7E8FF', letters, 1),
  2: mk(2, 'Colores', 'Colores', '#FF8001', '#FF4F1A', '#FFE7CF', colors, 9),
  3: mk(3, 'Números', 'Números', '#45C1FF', '#007BB9', '#DDF3FF', numbers, 16),
  4: mk(4, 'Palabras', 'Palabras', '#73D83A', '#369C00', '#E5F8D8', words, 26),
  5: mk(5, 'Escribir', 'Escribir', '#C48243', '#884E17', '#F2E3D2', writes, 41),
}
export const MODULE_IDS: ModuleId[] = [1, 2, 3, 4, 5]

export const moduleOf = (casilla: number): ModuleDef => MODULE_IDS.map((i) => MODULES[i]).find((m) => casilla >= m.first && casilla <= m.last) ?? MODULES[5]
export type ModuleState = 'locked' | 'active' | 'done'
export const moduleState = (id: ModuleId, done: number): ModuleState => (done >= MODULES[id].last ? 'done' : done >= MODULES[id].first - 1 ? 'active' : 'locked')
export const plainLetters = (word: string) => word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-ZÑ]/gi, '').toUpperCase().split('')
export const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('')

export const FULL_RULES = [
  'Juegan juntos: o los dos calientan el huevo, o no eclosiona.',
  'Las rondas se turnan: «Padre hace la seña · niño adivina» y «Niño hace la seña · padre adivina».',
  'Cuando el padre hace la seña, el niño no mira esa pantalla.',
  'Quien adivina tiene 4 botones: 3 colores para elegir y «?» si no entendió.',
  'La app comprueba sola; nadie tiene que confirmar.',
  'Cada error muestra «¡Casi!» y lleva al Modo maestro: el que sabe, enseña (máximo 2 vueltas).',
  'Se comunican con señas, gestos o dibujos; no se usa la voz.',
  'El calor solo sube. Con 12 LEDs, el huevo eclosiona y Spike crece.',
  'El huevo tiene que estar conectado: sin huevo no hay juego.',
]

/** Casillas on the path in order: a module casilla right before the first reto of each module (it is not a reto). */
export type Slot = { kind: 'module'; id: ModuleId } | { kind: 'reto'; n: number }
export const SLOTS: Slot[] = MODULE_IDS.flatMap((id) => [
  { kind: 'module', id } as Slot,
  ...Array.from({ length: MODULES[id].last - MODULES[id].first + 1 }, (_, k) => ({ kind: 'reto', n: MODULES[id].first + k }) as Slot),
])
export const slotOfReto = (n: number) => SLOTS.findIndex((x) => x.kind === 'reto' && x.n === n)
export const slotOfModule = (id: ModuleId) => SLOTS.findIndex((x) => x.kind === 'module' && x.id === id)
