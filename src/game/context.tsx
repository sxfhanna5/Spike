import { createContext, useContext, type Dispatch } from 'react'
import type { Action, GameState } from './engine'

export interface GameCtx {
  s: GameState
  dispatch: Dispatch<Action>
  /** Game timers (cards, auto-checks) stop while paused. */
  paused: boolean
}

export const GameContext = createContext<GameCtx | null>(null)

export const useGame = () => {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame outside provider')
  return ctx
}
