import { CODE_BUTTON, type EffectName, type EggButton, type EggDevice } from './types'

/* Nordic UART service: the app writes on RX (…0002…) and the egg notifies on TX (…0003…). */
const NUS_SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'
const NUS_RX = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'
const NUS_TX = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'

/** Max commands per second sent to the egg. */
const MAX_PER_SECOND = 10
/** The egg sends HB about every 2 s: more than 6 s of silence = the link is lost. */
const HEARTBEAT_TIMEOUT = 6000
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 10000]

// Web Bluetooth is not in the TypeScript DOM lib.
/* eslint-disable @typescript-eslint/no-explicit-any */
type BtDevice = any
type BtChar = any

/**
 * Real egg over Web Bluetooth (Chrome / Edge, https or localhost). Features:
 * automatic reconnection, heartbeat watchdog and a command queue (10 per second at most).
 * Protocol: see PROTOCOLO.md.
 */
export class BleEgg implements EggDevice {
  connected = false
  private device: BtDevice = null
  private rx: BtChar = null
  private tx: BtChar = null
  private wantConnected = false
  private attempt = 0
  private reconnectTimer = 0
  private watchdog = 0
  private lastRx = 0
  private buffer = ''
  private queue: string[] = []
  private pump = 0
  private heat = 0
  private color = '#FF8001'
  private btnCbs = new Set<(b: EggButton) => void>()
  private connCbs = new Set<(c: boolean) => void>()

  /* ---- EggDevice ---- */
  async connect() {
    const bt = (navigator as any).bluetooth
    if (!bt) throw new Error('Este navegador no tiene Bluetooth web')
    this.wantConnected = true
    if (!this.device) {
      this.device = await bt.requestDevice({ filters: [{ services: [NUS_SERVICE] }], optionalServices: [NUS_SERVICE] })
      this.device.addEventListener('gattserverdisconnected', () => this.lost())
    }
    await this.open()
  }
  async disconnect() {
    this.wantConnected = false
    window.clearTimeout(this.reconnectTimer)
    this.device?.gatt?.disconnect()
    this.setConnected(false)
  }
  setHeat(leds: number) {
    const n = Math.max(0, Math.min(12, Math.round(leds)))
    this.heat = n
    this.enqueue(`H:${n}`)
  }
  setColor(hex: string) {
    this.color = hex
    this.enqueue(`C:${hex.replace('#', '').toUpperCase()}`)
  }
  play(effect: EffectName) {
    this.enqueue(`FX:${effect}`)
  }
  onButton(cb: (b: EggButton) => void) {
    this.btnCbs.add(cb)
    return () => void this.btnCbs.delete(cb)
  }
  onConnectionChange(cb: (c: boolean) => void) {
    this.connCbs.add(cb)
    return () => void this.connCbs.delete(cb)
  }

  /* ---- link ---- */
  private async open() {
    const server = await this.device.gatt.connect()
    const service = await server.getPrimaryService(NUS_SERVICE)
    this.rx = await service.getCharacteristic(NUS_RX)
    this.tx = await service.getCharacteristic(NUS_TX)
    await this.tx.startNotifications()
    this.tx.addEventListener('characteristicvaluechanged', (e: any) => this.onData(e.target.value as DataView))
    this.attempt = 0
    this.lastRx = performance.now()
    this.setConnected(true)
    // after (re)connecting, bring the egg back to the current state
    this.queue = []
    this.enqueue(`C:${this.color.replace('#', '').toUpperCase()}`)
    this.enqueue(`H:${this.heat}`)
    window.clearInterval(this.watchdog)
    this.watchdog = window.setInterval(() => {
      if (this.connected && performance.now() - this.lastRx > HEARTBEAT_TIMEOUT) {
        this.device?.gatt?.disconnect()
        this.lost()
      }
    }, 1000)
  }
  /** Link dropped: tell the app and try again with growing delays. */
  private lost() {
    window.clearInterval(this.watchdog)
    this.setConnected(false)
    if (!this.wantConnected) return
    const delay = RECONNECT_DELAYS[Math.min(this.attempt, RECONNECT_DELAYS.length - 1)]
    this.attempt++
    window.clearTimeout(this.reconnectTimer)
    this.reconnectTimer = window.setTimeout(() => {
      this.open().catch(() => this.lost())
    }, delay)
  }
  private setConnected(c: boolean) {
    if (c === this.connected) return
    this.connected = c
    if (!c) {
      this.queue = []
      window.clearInterval(this.pump)
      this.pump = 0
    }
    this.connCbs.forEach((cb) => cb(c))
  }

  /* ---- incoming: B:1 B:2 B:3 B:Q HB, one per line ---- */
  private onData(v: DataView) {
    this.lastRx = performance.now()
    this.buffer += new TextDecoder().decode(v)
    let i: number
    while ((i = this.buffer.indexOf('\n')) >= 0) {
      const line = this.buffer.slice(0, i).trim()
      this.buffer = this.buffer.slice(i + 1)
      if (line.startsWith('B:')) {
        const b = CODE_BUTTON[line.slice(2)]
        if (b) this.btnCbs.forEach((cb) => cb(b))
      }
      // «HB» only refreshes lastRx
    }
  }

  /* ---- outgoing queue: at most 10 per second; the latest H / C replaces a pending one ---- */
  private enqueue(msg: string) {
    if (!this.connected) return
    const kind = msg.slice(0, msg.indexOf(':'))
    if (kind === 'H' || kind === 'C') {
      // only replace if nothing else was queued after it, so FX / H order is kept
      const last = this.queue.length - 1
      if (last >= 0 && this.queue[last].startsWith(kind + ':')) this.queue[last] = msg
      else this.queue.push(msg)
    } else this.queue.push(msg)
    if (!this.pump) {
      this.flush()
      this.pump = window.setInterval(() => this.flush(), 1000 / MAX_PER_SECOND)
    }
  }
  private flush() {
    const msg = this.queue.shift()
    if (msg === undefined) {
      window.clearInterval(this.pump)
      this.pump = 0
      return
    }
    const data = new TextEncoder().encode(msg + '\n')
    const p = this.rx.writeValueWithoutResponse ? this.rx.writeValueWithoutResponse(data) : this.rx.writeValue(data)
    Promise.resolve(p).catch(() => this.lost())
  }
}
