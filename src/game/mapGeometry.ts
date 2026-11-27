import { SLOTS } from './data'

/**
 * The yellow path of the Figma map is two vectors (frame 1044 × ~10046) plus a short connector.
 * We rebuild the exact same centre line so the 46 casillas can sit on it at even spacing and
 * the path can be filled with module colours as the player advances.
 */
export const FRAME_W = 1044
export const FRAME_H = 10046
export const K = 390 / FRAME_W
export const MAP_H = Math.round(FRAME_H * K)

const P1 = 'M452.5 0V288.5C452.5 343.728 407.728 388.5 352.5 388.5H142.25C95.4439 388.5 57.5 426.444 57.5 473.25C57.5 520.056 95.4439 558 142.25 558H758C813.228 558 858 602.772 858 658V802.5C858 857.728 813.228 902.5 758 902.5H552.5C497.272 902.5 452.5 947.272 452.5 1002.5V1363C452.5 1418.23 497.272 1463 552.5 1463H692.5C747.728 1463 792.5 1507.77 792.5 1563V1815V2689C792.5 2744.23 747.728 2789 692.5 2789H202.5C147.272 2789 102.5 2833.77 102.5 2889V3031C102.5 3086.23 147.272 3131 202.5 3131H385.5C440.728 3131 485.5 3175.77 485.5 3231V3553.5C485.5 3608.73 530.272 3653.5 585.5 3653.5H656.5C711.728 3653.5 756.5 3698.27 756.5 3753.5V4363'
const P2 = 'M725 57.5V2775C725 2830.23 680.228 2875 625 2875H157.5C102.272 2875 57.5 2919.77 57.5 2975V2993.5C57.5 3048.73 102.272 3093.5 157.5 3093.5H625.25C680.34 3093.5 725 3138.16 725 3193.25C725 3248.34 680.34 3293 625.25 3293H157.5C102.272 3293 57.5 3337.77 57.5 3393V4207'

/** Offsets an absolute path made of M / H / V / C commands. */
function shift(d: string, dx: number, dy: number) {
  return d.replace(/([MHVC])([^MHVC]*)/g, (_, cmd: string, args: string) => {
    const n = args.trim().split(/[\s,]+/).map(Number)
    if (cmd === 'H') return `H${n[0] + dx}`
    if (cmd === 'V') return `V${n[0] + dy}`
    return cmd + n.map((v, i) => (i % 2 === 0 ? v + dx : v + dy)).join(' ')
  })
}

// svg origin of vector 1 is (64.5, 793.5); of vector 2 (100, 5499). The connector bridges 5156.5 → 5556.5.
export const PATH_D = `${shift(P1, 64.5, 793.5)}L825 5556.5${shift(P2, 100, 5499).replace(/^M[^V]*/, '')}`

export interface MapGeometry {
  total: number
  /** Arc length (frame units) of every slot: 5 module casillas + 46 retos, in path order. */
  arcs: number[]
  pointAt: (arc: number) => { x: number; y: number }
  /** Even chord distance between neighbouring slot centres, in frame units. */
  spacing: number
}

let cache: MapGeometry | null = null
export function getGeometry(): MapGeometry {
  if (cache) return cache
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '0')
  svg.setAttribute('height', '0')
  svg.style.position = 'absolute'
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', PATH_D)
  svg.appendChild(path)
  document.body.appendChild(svg)
  const total = path.getTotalLength()
  const pointAt = (arc: number) => {
    const validArc = typeof arc === 'number' && !isNaN(arc) && isFinite(arc) ? arc : 0
    const p = path.getPointAtLength(Math.max(0, Math.min(total, validArc)))
    return { x: p.x, y: p.y }
  }
  // Dense samples of the centre line (every 4 units) so the layout maths is purely numeric and fast.
  const STEP = 4
  const pts: { x: number; y: number }[] = []
  for (let a = 0; a <= total; a += STEP) pts.push(pointAt(a))
  const dist = (i: number, j: number) => Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)
  const nearest = (x: number, y: number) => {
    let best = 0
    let bd = Infinity
    pts.forEach((p, i) => {
      const d = (p.x - x) ** 2 + (p.y - y) ** 2
      if (d < bd) { bd = d; best = i }
    })
    return best
  }
  const i0 = nearest(389, 1167)
  const i1 = nearest(160, 9300)
  const N = SLOTS.length
  /** Walks the path from i0 taking steps whose straight-line (chord) length is exactly d. */
  const walk = (d: number) => {
    const idx = [i0]
    let i = i0
    for (let k = 1; k < N; k++) {
      let j = i + 1
      while (j < pts.length - 1 && dist(i, j) < d) j++
      idx.push(j)
      i = j
    }
    return idx
  }
  // Binary search the chord length so the last slot lands on the last anchor.
  let lo = 20
  let hi = 400
  for (let it = 0; it < 40; it++) {
    const mid = (lo + hi) / 2
    const last = walk(mid)[N - 1]
    if (last < i1) lo = mid
    else hi = mid
  }
  const spacing = (lo + hi) / 2
  const arcs = walk(spacing).map((i) => i * STEP)
  cache = { total, arcs, pointAt, spacing }
  return cache
}
