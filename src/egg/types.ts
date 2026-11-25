/** The 4 buttons of the egg: ● yellow, ▲ blue, ■ purple and the white «?». */
export type EggButton = 'circle' | 'triangle' | 'square' | 'help'
export type EffectName = 'WAIT' | 'CONNECT' | 'PRESS' | 'TURN_N' | 'TURN_P' | 'OK' | 'CASI' | 'TEACH' | 'LEARNED' | 'LEVELUP' | 'HATCH' | 'FINAL'

/**
 * The only thing the rest of the app knows about the egg. Two implementations exist:
 * VirtualEgg (the simulator drawn in the prototype) and BleEgg (real hardware over Web Bluetooth).
 */
export interface EggDevice {
  readonly connected: boolean
  /** Opens the link (Bluetooth asks the user to pick the egg). Rejects if it fails. */
  connect(): Promise<void>
  /** Closes the link on purpose: no automatic reconnection afterwards. */
  disconnect(): Promise<void>
  /** Heat LEDs, 0–12. */
  setHeat(leds: number): void
  /** Base colour of the module, «#RRGGBB». */
  setColor(hex: string): void
  /** Plays a light effect on top of the heat; the ring then returns to the heat. */
  play(effect: EffectName): void
  onButton(cb: (button: EggButton) => void): () => void
  onConnectionChange(cb: (connected: boolean) => void): () => void
}

export const BUTTON_CODE: Record<EggButton, string> = { circle: '1', triangle: '2', square: '3', help: 'Q' }
export const CODE_BUTTON: Record<string, EggButton> = { '1': 'circle', '2': 'triangle', '3': 'square', Q: 'help' }
