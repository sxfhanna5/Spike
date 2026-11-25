import { BleEgg } from './BleEgg'
import { VirtualEgg } from './VirtualEgg'
import type { EggDevice } from './types'

/**
 * Switch between the simulator and the real egg here. Everything else in the app talks to `egg`
 * through the EggDevice interface and never knows which one it is.
 */
export const EGG_MODE = 'virtual' as 'virtual' | 'ble'

export const virtualEgg = new VirtualEgg()
export const egg: EggDevice = EGG_MODE === 'ble' ? new BleEgg() : virtualEgg

export type { EggButton, EggDevice, EffectName } from './types'
