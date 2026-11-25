import { BUTTON_CODE, type EffectName, type EggButton, type EggDevice } from './types'
import { EFFECTS, LEDS, renderLeds, toCss, brightnessOf, type Rgb } from './render'

/**
 * The simulator of the prototype: it behaves like the real egg (same effects, same limits) and the
 * «Caja virtual» draws its ring and buttons from it. It implements the same interface as BleEgg.
 */
export class VirtualEgg implements EggDevice {
  connected = false
  /** Set by the prototype's «Simular fallo» switch: the next connect() fails. */
  failNext = false
  heat = 0
  color = '#FF8001'
  private effect: EffectName | null = 'WAIT'
  private startedAt = performance.now()
  private prevHeat = 0
  private held = false
  private btnCbs = new Set<(b: EggButton) => void>()
  private connCbs = new Set<(c: boolean) => void>()
  private frameCbs = new Set<() => void>()
  private raf = 0
  /** Last button pressed on the virtual box (for the little press animation). */
  lastPress: { button: EggButton; at: number } | null = null
  /** Messages the app would send over Bluetooth, for the debug line under the box. */
  log: string[] = []

  /* ---- EggDevice ---- */
  connect() {
    return new Promise<void>((resolve, reject) => {
      window.setTimeout(() => {
        if (this.failNext) {
          this.failNext = false
          reject(new Error('No se encontró el huevo'))
          return
        }
        this.setConnected(true)
        resolve()
      }, 1700)
    })
  }
  async disconnect() {
    this.setConnected(false)
  }
  /** Simulator only: jumps straight to a state (reviewer shortcuts). */
  forceConnected(c: boolean) {
    this.setConnected(c)
  }
  setHeat(leds: number) {
    const n = Math.max(0, Math.min(LEDS, Math.round(leds)))
    if (n === this.heat) return
    this.heat = n
    if (this.held && this.effect !== 'HATCH') this.held = false
    this.note(`H:${n}`)
  }
  setColor(hex: string) {
    this.color = hex
    this.note(`C:${hex.replace('#', '').toUpperCase()}`)
  }
  play(effect: EffectName) {
    if (!this.connected && effect !== 'WAIT') return
    this.prevHeat = this.heat
    this.effect = effect
    this.held = false
    this.startedAt = performance.now()
    this.note(`FX:${effect}`)
  }
  onButton(cb: (b: EggButton) => void) {
    this.btnCbs.add(cb)
    return () => void this.btnCbs.delete(cb)
  }
  onConnectionChange(cb: (c: boolean) => void) {
    this.connCbs.add(cb)
    return () => void this.connCbs.delete(cb)
  }

  /* ---- simulator side ---- */
  /** A finger on the virtual button: sends B:x like the hardware and flashes the ring locally. */
  press(button: EggButton) {
    if (!this.connected) return
    this.lastPress = { button, at: performance.now() }
    this.btnCbs.forEach((cb) => cb(button))
    this.note(`B:${BUTTON_CODE[button]}`)
  }
  private setConnected(c: boolean) {
    if (c === this.connected) return
    this.connected = c
    this.effect = c ? null : 'WAIT'
    this.startedAt = performance.now()
    this.held = false
    this.note(c ? 'conectado' : 'sin conexión')
    this.connCbs.forEach((cb) => cb(c))
  }
  private note(msg: string) {
    this.log = [...this.log.slice(-5), msg]
  }

  /** Current colours of the 12 LEDs, 0..1 per channel. */
  frame(now = performance.now()): Rgb[] {
    const def = this.effect ? EFFECTS[this.effect] : null
    let t: number | null = this.effect ? now - this.startedAt : null
    if (def && t !== null && !def.loop && t >= def.dur) {
      if (def.holdAfter) this.held = true
      else {
        this.effect = this.connected ? null : 'WAIT'
        t = null
      }
    }
    const ctx = { t, effect: this.effect, prevHeat: this.prevHeat, heat: this.heat, module: this.color, connected: this.connected, held: this.held }
    const main = renderLeds(ctx)
    // the PRESS flash is local to the firmware: it is added over whatever is showing
    const pt = this.lastPress ? now - this.lastPress.at : Infinity
    if (this.connected && pt < EFFECTS.PRESS.dur) {
      const flash = renderLeds({ ...ctx, t: pt, effect: 'PRESS' })
      return main.map((c, i) => [Math.max(c[0], flash[i][0]), Math.max(c[1], flash[i][1]), Math.max(c[2], flash[i][2])] as Rgb)
    }
    return main
  }
  cssFrame() {
    return this.frame().map((c) => ({ css: toCss(c), level: brightnessOf(c) }))
  }

  /** Subscribes to ~30 fps frames for drawing. */
  subscribe(cb: () => void) {
    this.frameCbs.add(cb)
    if (this.frameCbs.size === 1) {
      let last = 0
      const loop = (now: number) => {
        if (now - last > 33) {
          last = now
          this.frameCbs.forEach((f) => f())
        }
        this.raf = requestAnimationFrame(loop)
      }
      this.raf = requestAnimationFrame(loop)
    }
    return () => {
      this.frameCbs.delete(cb)
      if (!this.frameCbs.size) cancelAnimationFrame(this.raf)
    }
  }
}
