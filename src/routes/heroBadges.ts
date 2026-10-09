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
 * Positions are the badge boxes in Figma's 548 × 560 hero frame as % of the video square (the
 * `LoopVideo` in Landing.tsx, up to 548 px). The robot sits at the frame's top edge there, so
 * frame and square share their top.
 * Paths (x, y px) and durations are Figma's variant switch: smart animate, ease-in-out, 1 ms delay
 * (so none here). Figma's duration is one leg, so a there-and-back cycle takes twice as long.
 */
const FIGMA_BADGES: HeroBadge[] = [
  {
    id: "tailored",
    tone: "purple",
    size: "sm",
    className: "top-[0.4%] left-[47.9%] -translate-x-1/2",
    float: { x: 3, duration: 2.5 },
  },
  {
    id: "skills",
    tone: "brand",
    size: "xl",
    className: "top-[7.8%] right-[6.9%]",
    float: { x: 1, y: -9, duration: 2.3 },
  },
  {
    id: "business",
    tone: "dark",
    size: "lg",
    className: "top-[13.3%] left-[7.1%]",
    float: { y: -5, duration: 1.5 },
  },
  {
    id: "personal",
    tone: "blue",
    size: "sm",
    className: "top-[46.9%] left-[7.1%]",
    float: { x: 3, duration: 1.9 },
  },
  {
    id: "allInOne",
    tone: "orange",
    size: "md",
    className: "top-[50.9%] right-[7.7%]",
    float: { x: -2, y: 5, duration: 1.7 },
  },
]

export const HERO_BADGES: HeroBadge[] = FIGMA_BADGES.map((badge) => ({
  ...badge,
  float: { ...badge.float, duration: badge.float.duration * 2 },
}))
