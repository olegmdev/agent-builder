import confetti, { type Options } from "canvas-confetti"
import { useEffect } from "react"

/** Brand green plus the badge accents from `src/index.css`. canvas-confetti needs hex values. */
const COLORS = ["#7cb342", "#884bbe", "#027ed1", "#de883c", "#181d25"]

// Square pieces match the flat, square-cornered visual language. The library draws on its own
// full-screen canvas on <body> (pointer-events: none), so a burst survives route changes.
const BASE: Options = {
  colors: COLORS,
  shapes: ["square"],
  disableForReducedMotion: true,
  zIndex: 100,
}

const MOUNT_DELAY_MS = 300

/** A short burst from both bottom corners. */
function burstFromCorners() {
  void confetti({ ...BASE, particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.8 } })
  void confetti({ ...BASE, particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.8 } })
}

/** A bigger, layered burst from the centre. */
function celebrate() {
  const fire = (ratio: number, opts: Options) =>
    void confetti({ ...BASE, origin: { y: 0.6 }, particleCount: Math.round(200 * ratio), ...opts })

  fire(0.25, { spread: 26, startVelocity: 55 })
  fire(0.2, { spread: 60 })
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
  fire(0.1, { spread: 120, startVelocity: 45 })
}

type UseConfettiOptions = {
  /** Fire a short burst when the component mounts. Default `false`. */
  onMount?: boolean
}

/**
 * Returns `celebrate` for a big burst (e.g. after a successful submit) and, with `onMount`, fires
 * a short one when the component mounts. The mount burst waits for the page to paint and is
 * skipped if the component unmounts first: a guard redirect, or StrictMode's double effect run.
 */
export function useConfetti({ onMount = false }: UseConfettiOptions = {}) {
  useEffect(() => {
    if (!onMount) return
    const timer = setTimeout(burstFromCorners, MOUNT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [onMount])

  return { celebrate }
}
