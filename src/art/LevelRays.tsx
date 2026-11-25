/** Soft rays (design asset "image 24") with their black background converted to transparency, so no backdrop box can ever show. */
export function LevelRays({ opacity = 0.55 }: { opacity?: number }) {
  return (
    <img
      src="/assets/rays.png"
      alt=""
      aria-hidden
      draggable={false}
      className="ray-spin pointer-events-none absolute top-[48%] left-1/2 w-[clamp(500px,140vw,720px)] max-w-none -translate-x-1/2 -translate-y-1/2"
      style={{ opacity }}
    />
  )
}
