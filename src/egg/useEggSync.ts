import { useEffect, useRef, type Dispatch } from 'react'
import { MODULES, moduleOf } from '../game/data'
import { activeCasilla, lit, type Action, type GameState } from '../game/engine'
import { EGG_MODE, egg, virtualEgg } from '.'

/**
 * The single bridge between the game and the egg. It only uses the EggDevice interface
 * (plus the simulator's shortcut for reviewer jumps), so BleEgg works without changes.
 */
export function useEggSync(s: GameState, dispatch: Dispatch<Action>) {
  // buttons and link state come from the device
  useEffect(() => {
    const offButton = egg.onButton((b) => {
      if (b === 'help') dispatch({ type: 'HELP' })
      else dispatch({ type: 'COLOR', index: b === 'circle' ? 0 : b === 'triangle' ? 1 : 2 })
    })
    const offConn = egg.onConnectionChange((connected) => dispatch({ type: 'EGG_CONNECTION', connected }))
    return () => {
      offButton()
      offConn()
    }
  }, [dispatch])

  // reviewer jumps and logout set `connected` directly: the device follows
  useEffect(() => {
    if (s.connected && !egg.connected && EGG_MODE === 'virtual') virtualEgg.forceConnected(true)
    if (!s.connected && egg.connected) void egg.disconnect()
  }, [s.connected])

  const color = MODULES[s.inLevel || s.fx.mode === 'hatch' || s.fx.mode === 'levelup' ? s.level : moduleOf(activeCasilla(s.done)).id].color
  const heat = lit(s.heat)

  // connected: show the heat with the warm fade-in and tell the egg the colour
  const wasConnected = useRef(false)
  useEffect(() => {
    if (s.connected && !wasConnected.current) {
      egg.setColor(color)
      egg.setHeat(heat)
      egg.play('CONNECT')
    }
    wasConnected.current = s.connected
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.connected])

  useEffect(() => {
    if (s.connected) egg.setColor(color)
  }, [s.connected, color])

  // game events → effects. They are sent BEFORE the new heat so the egg knows which LEDs are new.
  useEffect(() => {
    if (!s.connected) return
    if (s.screen === 'good') egg.play(s.teacherPhase === 'learned' ? 'LEARNED' : 'OK')
    else if (s.screen === 'almost') egg.play('CASI')
    else if (s.screen === 'master') egg.play('TEACH')
    else if (s.screen === 'hatch') egg.play('HATCH')
    else if (s.screen === 'map' && s.fx.mode === 'levelup') egg.play('LEVELUP')
    else if (s.screen === 'map' && s.fx.mode === 'final') egg.play('FINAL')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.fx.key])

  // start of a turn: two soft pulses in the colour of whoever starts
  const turnKey = s.intro?.kind === 'turn' ? `${s.intro.who}|${s.idx}|${s.screen}|${s.write.stage}|${s.teacherPhase}|${s.teacherLoops}` : ''
  useEffect(() => {
    if (!s.connected || !turnKey) return
    egg.play(s.intro?.who === 'nino' ? 'TURN_N' : 'TURN_P')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnKey])

  useEffect(() => {
    if (s.connected) egg.setHeat(heat)
  }, [s.connected, heat])
}
