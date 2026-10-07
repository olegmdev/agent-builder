import type { Goal } from "@/api/schemas"
import { AppImage } from "@/components/common/AppImage"
import { Skeleton } from "@/components/common/Skeleton"

export function GoalPreview({ goal }: { goal: Goal | undefined }) {
  return (
    <div
      aria-live="polite"
      className="flex h-full flex-col items-center justify-center overflow-hidden px-12 py-8 text-center"
    >
      {goal ? (
        <>
          {/* Takes whatever height the text leaves, so the panel still fits the screen (see `fitScreen`). */}
          <AppImage src={goal.image} className="max-h-104 min-h-0 w-full flex-1" />
          <h2 className="mt-5 text-[2rem] leading-tight text-ink">{goal.title}</h2>
          <p className="mt-4 max-w-72 text-base text-ink-muted">{goal.description}</p>
        </>
      ) : (
        <Skeleton className="size-[min(18.75rem,30svh)]" />
      )}
    </div>
  )
}
