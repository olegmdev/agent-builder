import type { Levitation } from "@/components/common/FloatingBadge"

export interface HeroBadge {
  id: "tailored" | "skills" | "business" | "personal" | "allInOne"
  tone: "purple" | "brand" | "dark" | "blue" | "orange"
  size: "sm" | "md" | "lg" | "xl"
  /**
   * Position against the video square. Side badges anchor to their outer edge, so longer
   * (translated) text grows toward the robot.
   */
  className: string
  float: Levitation
}

/*
 * Positions are the mockup's badge boxes as % of the desktop stage (the `LoopVideo` in
 * Landing.tsx, up to 548 px).
 * Durations are from Figma (one full there-and-back cycle, ease-in-out), played SLOWDOWN times
 * slower. The paths (x, y) and delays are still drafts: Figma's export has no offsets or delays yet.
 */
const SLOWDOWN = 1.5

const FIGMA_BADGES: HeroBadge[] = [
  {
    id: "tailored",
    tone: "purple",
    size: "sm",
    className: "top-0 left-1/2 -translate-x-1/2",
    float: { y: -8, duration: 2.5 },
  },
  {
    id: "skills",
    tone: "brand",
    size: "xl",
    className: "top-[8.7%] right-[4.2%]",
    float: { x: -6, y: -10, duration: 2.3, delay: 0.3 },
  },
  {
    id: "business",
    tone: "dark",
    size: "lg",
    className: "top-[12.2%] left-[9.1%]",
    float: { y: 10, duration: 1.5, delay: 0.6 },
  },
  {
    id: "personal",
    tone: "blue",
    size: "sm",
    className: "top-[48.8%] left-[9.1%]",
    float: { x: 8, y: -6, duration: 1.9, delay: 0.2 },
  },
  {
    id: "allInOne",
    tone: "orange",
    size: "md",
    className: "top-[52.9%] right-[7.2%]",
    float: { y: -10, duration: 1.7, delay: 0.9 },
  },
]

export const HERO_BADGES: HeroBadge[] = FIGMA_BADGES.map((badge) => ({
  ...badge,
  float: { ...badge.float, duration: badge.float.duration * SLOWDOWN },
}))
