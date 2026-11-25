import data from './effects.json'
import type { EffectName } from './types'

/* ============================== data types (mirror effects.json) ============================== */

export type Target = 'all' | 'lit' | 'new' | 'unlit'
export type Layer =
  | { kind: 'breathe'; color: string; target: Target; start: number; dur: number; period: number; min: number; max: number }
  | { kind: 'pulse'; color: string; target: Target; times: number[]; len: number; peak: number; peaks?: number[] }
  | { kind: 'fade'; color: string; target: Target; start: number; dur: number; from: number; to: number }
  | { kind: 'heatGain'; start: number; dur: number; from: number; to: number }
  | { kind: 'seq'; color: string; target: Target; start: number; step: number; fade: number }
  | { kind: 'sparkle'; palette: string[]; target: Target; start: number; dur: number; rate: number; life: number; peak: number }
  | { kind: 'hold'; color: string; target: Target; start: number; dur: number; level: number; fadeIn?: number }
export interface EffectDef {
  desc: string
  dur: number
  loop?: boolean
  replaceBase?: boolean
  holdAfter?: boolean
  layers: Layer[]
}

export const EFFECTS = data.effects as unknown as Record<EffectName, EffectDef>
export const LEDS = data.limits.leds
/** Hardware ceiling (of 255). The simulator shows 1.0 as this level. */
export const MAX_BRIGHTNESS = data.limits.maxBrightness
export type Rgb = [number, number, number]

/* ============================== colours ============================== */

export const hexToRgb = (hex: string): Rgb => {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
const mixRgb = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

/** Heat colours: accent → orange → yellow, one per LED (same ramp as the firmware). */
export const heatColor = (i: number): Rgb => (i < 6 ? mixRgb(hexToRgb('FF4F1A'), hexToRgb('FF8001'), i / 5) : mixRgb(hexToRgb('FF8001'), hexToRgb('FFE44C'), (i - 6) / 5))

/* ============================== state ============================== */

export interface RenderCtx {
  /** ms since the effect started (null = no effect). */
  t: number | null
  effect: EffectName | null
  /** Heat when the effect started (the LEDs from here up to `heat` are the new ones). */
  prevHeat: number
  heat: number
  module: string
  connected: boolean
  /** The last HATCH state stays until something else is sent. */
  held: boolean
}

const smooth = (x: number) => x * x * (3 - 2 * x)
const bump = (u: number) => (u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u) ** 2)
/** Deterministic pseudo-random sequence: the firmware uses exactly the same one. */
const hash = (n: number) => {
  let x = (n * 2654435761) >>> 0
  x ^= x >>> 15
  x = Math.imul(x, 2246822519) >>> 0
  x ^= x >>> 13
  return x >>> 0
}

const inTarget = (target: Target, i: number, ctx: RenderCtx) =>
  target === 'all' || (target === 'lit' && i < ctx.heat) || (target === 'unlit' && i >= ctx.heat) || (target === 'new' && i >= ctx.prevHeat && i < ctx.heat)

const colorOf = (c: string, ctx: RenderCtx, i: number): Rgb => (c === '$module' ? hexToRgb(ctx.module) : c === 'heat' ? heatColor(i) : hexToRgb(c))

/**
 * Composes the ring: heat as the base, then every layer of the active effect on top.
 * Output intensities are 0..1 where 1 is the maximum brightness of the ring.
 */
export function renderLeds(ctx: RenderCtx): Rgb[] {
  const out: Rgb[] = Array.from({ length: LEDS }, () => [0, 0, 0])
  const def = ctx.effect ? EFFECTS[ctx.effect] : null
  const t = ctx.t ?? 0
  const lt = def?.loop ? t % def.dur : t
  const active = def && ctx.t !== null && (def.loop || t < def.dur)
  const live = active || (def?.holdAfter && ctx.held)

  if (!ctx.connected && !(def && ctx.effect === 'WAIT')) return out

  // 1) base: the heat
  let gain = 1
  let hidden: boolean[] = []
  if (active && def) {
    for (const L of def.layers) {
      if (L.kind === 'heatGain') gain = L.from + (L.to - L.from) * smooth(Math.max(0, Math.min(1, (lt - L.start) / L.dur)))
      if (L.kind === 'seq') {
        // LEDs of the target appear one by one: hide them in the base until their turn
        hidden = Array.from({ length: LEDS }, (_, i) => inTarget(L.target, i, ctx))
      }
    }
  }
  if (!(def?.replaceBase && active)) {
    for (let i = 0; i < LEDS; i++) if (i < ctx.heat && !hidden[i]) out[i] = heatColor(i).map((v) => (v / 255) * gain) as Rgb
  }

  // 2) layers
  if (live && def) {
    const add = (i: number, rgb: Rgb, a: number) => {
      const k = Math.max(0, Math.min(1, a))
      out[i] = [out[i][0] + (rgb[0] / 255 - out[i][0]) * k, out[i][1] + (rgb[1] / 255 - out[i][1]) * k, out[i][2] + (rgb[2] / 255 - out[i][2]) * k]
    }
    for (const L of def.layers) {
      const tt = active ? lt : def.dur + 1
      if (L.kind === 'breathe') {
        if (tt < L.start || tt >= L.start + L.dur) continue
        const u = ((tt - L.start) % L.period) / L.period
        const a = L.min + (L.max - L.min) * (0.5 - 0.5 * Math.cos(2 * Math.PI * u))
        for (let i = 0; i < LEDS; i++) if (inTarget(L.target, i, ctx)) add(i, colorOf(L.color, ctx, i), a)
      } else if (L.kind === 'pulse') {
        let a = 0
        L.times.forEach((t0, k) => { a = Math.max(a, bump((tt - t0) / L.len) * (L.peaks?.[k] ?? L.peak)) })
        if (a > 0) for (let i = 0; i < LEDS; i++) if (inTarget(L.target, i, ctx)) add(i, colorOf(L.color, ctx, i), a)
      } else if (L.kind === 'fade') {
        if (tt < L.start || tt > L.start + L.dur) continue
        const a = L.from + (L.to - L.from) * ((tt - L.start) / L.dur)
        for (let i = 0; i < LEDS; i++) if (inTarget(L.target, i, ctx)) add(i, colorOf(L.color, ctx, i), a)
      } else if (L.kind === 'hold') {
        const end = L.dur > 0 ? L.start + L.dur : Infinity
        if (tt < L.start || tt >= end) continue
        const a = L.level * (L.fadeIn ? smooth(Math.min(1, (tt - L.start) / L.fadeIn)) : 1)
        for (let i = 0; i < LEDS; i++) if (inTarget(L.target, i, ctx)) add(i, colorOf(L.color, ctx, i), a)
      } else if (L.kind === 'seq') {
        let k = 0
        for (let i = 0; i < LEDS; i++) {
          if (!inTarget(L.target, i, ctx)) continue
          const a = Math.max(0, Math.min(1, (tt - L.start - k * L.step) / L.fade))
          if (a > 0) add(i, colorOf(L.color, ctx, i), smooth(a))
          k++
        }
      } else if (L.kind === 'sparkle') {
        if (tt < L.start || tt >= L.start + L.dur + L.life) continue
        const every = 1000 / L.rate
        const n = Math.floor((tt - L.start) / every)
        // only the last few sparks can still be alive
        for (let k = Math.max(0, n - Math.ceil(L.life / every)); k <= n; k++) {
          const born = L.start + k * every
          if (born >= L.start + L.dur) break
          const age = (tt - born) / L.life
          if (age < 0 || age > 1) continue
          const h = hash(k + 7)
          const led = h % LEDS
          if (!inTarget(L.target, led, ctx)) continue
          const col = colorOf(L.palette[(h >>> 8) % L.palette.length], ctx, led)
          add(led, col, bump(age) * L.peak)
        }
      }
    }
  }
  return out
}

export const toCss = ([r, g, b]: Rgb) => `rgb(${Math.round(Math.min(1, r) * 255)},${Math.round(Math.min(1, g) * 255)},${Math.round(Math.min(1, b) * 255)})`
export const brightnessOf = ([r, g, b]: Rgb) => Math.max(r, g, b)
