import type { ReactNode } from 'react'

/** The phone of the prototype: 390 × 844 screen. Screens own the whole area (no status bar). */
export function Phone({ children, turning }: { children: ReactNode; turning: boolean }) {
  return (
    <div className={`relative rounded-[56px] bg-[#4A5A8C] p-3 shadow-[0_30px_60px_rgba(31,42,68,0.35)] ${turning ? 'phone-turn' : ''}`}>
      <div className="relative h-[844px] w-[390px] overflow-hidden rounded-[44px] bg-white isolate">
        {children}
      </div>
    </div>
  )
}
