import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// No fixed width: the padding sizes the pill around whatever the translated text is.
const floatingBadgeVariants = cva(
  "absolute z-2 animate-levitate rounded-full whitespace-nowrap text-white motion-reduce:animate-none",
  {
    variants: {
      tone: {
        purple: "bg-badge-purple",
        dark: "bg-badge-dark",
        brand: "bg-brand",
        blue: "bg-badge-blue",
        orange: "bg-badge-orange",
      },
      // Heights from the 548 × 560 Figma hero frame: 32, 34, 40 and 50 px. Phones get 24, 24, 32
      // and 36 px, so the pills leave the robot room on a stage that narrow.
      size: {
        sm: "px-3 py-2 text-xs leading-4 max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.6875rem]",
        md: "px-3.5 py-1.75 text-sm leading-5 max-sm:px-3 max-sm:py-1 max-sm:text-xs max-sm:leading-4",
        lg: "px-4 py-2 text-base leading-6 max-sm:px-3 max-sm:py-1.5 max-sm:text-sm max-sm:leading-5",
        xl: "px-5 py-2.75 text-xl leading-7 max-sm:px-3.5 max-sm:py-1.5 max-sm:text-base max-sm:leading-6",
      },
    },
    defaultVariants: { size: "sm" },
  },
)

/** One levitation cycle: drift to (x, y) px and back over `duration` s, after `delay` s. */
export interface Levitation {
  x?: number
  y?: number
  duration: number
  delay?: number
}

interface FloatingBadgeProps extends VariantProps<typeof floatingBadgeVariants> {
  float: Levitation
  /** Position inside the parent (`top-*`, `left-*` / `right-*`). */
  className?: string
  children: React.ReactNode
}

/** A pill floating over an illustration. Give neighbours different paths, durations and delays. */
export function FloatingBadge({ tone, size, float, className, children }: FloatingBadgeProps) {
  const style = {
    "--levitate-x": `${float.x ?? 0}px`,
    "--levitate-y": `${float.y ?? 0}px`,
    animationDuration: `${float.duration}s`,
    animationDelay: `${float.delay ?? 0}s`,
  } as React.CSSProperties

  return (
    <span className={cn(floatingBadgeVariants({ tone, size }), className)} style={style}>
      {children}
    </span>
  )
}
