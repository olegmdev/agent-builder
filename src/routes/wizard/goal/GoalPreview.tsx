import { useState } from "react"
import type { Goal } from "@/api/schemas"
import { AppImage } from "@/components/common/AppImage"
import { LoopVideo } from "@/components/common/LoopVideo"
import { Skeleton } from "@/components/common/Skeleton"
import { loopVideoSrc } from "@/lib/video"
import { GOAL_VIDEOS } from "./goalVideos"

export function GoalPreview({ goal }: { goal: Goal | undefined }) {
  // Once the first clip is ready, prefetch the others so switching goals starts without a gap.
  // The set is fixed by the first goal, so later switches don't churn the links.
  const [warmedBy, setWarmedBy] = useState<string>()
  const video = goal && GOAL_VIDEOS[goal.id]

  return (
    <div
      aria-live="polite"
      className="flex h-full flex-col items-center justify-center overflow-hidden px-12 py-8 text-center"
    >
      {goal ? (
        <>
          {/* Takes whatever height the text leaves, so the panel still fits the screen (see `fitScreen`). */}
          {video ? (
            // Keyed so a goal switch loads the new sources and starts the clip from the top.
            <LoopVideo
              key={goal.id}
              name={video}
              // The goal image doesn't match the clip's first frame, so it is only the still.
              still={goal.image}
              media="(width >= 64rem)"
              onReady={() => setWarmedBy((id) => id ?? goal.id)}
              className="max-h-104 min-h-0 w-full flex-1"
            />
          ) : (
            <AppImage src={goal.image} className="max-h-104 min-h-0 w-full flex-1" />
          )}
          <h2 className="mt-5 text-[2rem] leading-tight text-ink">{goal.title}</h2>
          <p className="mt-4 max-w-72 text-base text-ink-muted">{goal.description}</p>
        </>
      ) : (
        <Skeleton className="size-[min(18.75rem,30svh)]" />
      )}
      {warmedBy &&
        Object.entries(GOAL_VIDEOS)
          .filter(([id]) => id !== warmedBy)
          .map(([id, name]) => <link key={id} rel="prefetch" href={loopVideoSrc(name)} />)}
    </div>
  )
}
