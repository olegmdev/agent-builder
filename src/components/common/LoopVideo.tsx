import { cn } from "cn"
import { useMediaQuery } from "@/lib/useMediaQuery"
import { assetUrl } from "@/lib/utils"
import { AV1_TYPE } from "@/lib/video"

// React sets `muted` only as a property; iOS checks it before allowing a muted autoplay.
function forceMuted(video: HTMLVideoElement | null) {
  if (video) video.defaultMuted = video.muted = true
}

interface LoopVideoProps {
  /** Path inside `public/` without extension; `.av1.mp4`, `.mp4` and `.webp` sit next to it. */
  name: string
  /** Shown until the video plays. Defaults to `<name>.webp`, the clip's first frame. */
  poster?: string
  /** Shown instead of the clip under reduced motion. Defaults to the poster. */
  still?: string
  /** Mount the video only while this media query matches, so a CSS-hidden copy never downloads. */
  media?: string
  /** The frame. The video is the largest square that fits inside it. */
  className?: string
  /** Fires once the clip can play to the end without stalling. */
  onReady?: () => void
  /** Overlays above the video and its vignette, positioned against the square. */
  children?: React.ReactNode
}

/**
 * A decorative looping clip of the robot. The clips are encoded on pure white (see
 * scripts/encode-videos.sh) and a vignette over them softens what is left of their edges.
 */
export function LoopVideo({
  name,
  poster = `${name}.webp`,
  still = poster,
  media,
  className,
  onReady,
  children,
}: LoopVideoProps) {
  const matches = useMediaQuery(media ?? "all")
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const visible = !media || matches

  return (
    <div aria-hidden className={cn("relative bg-white", className)}>
      {/*
       * Out of flow, so the frame takes the space its parent gives it, and its final size is known
       * here even when it comes from flex growth (cqh resolves to 0 on an in-flow flex container).
       */}
      <div className="absolute inset-0 flex items-center justify-center @container-size">
        {/* The square the clip fills; the vignette sits on its edges. */}
        <div className="relative isolate size-[min(100cqw,100cqh)] after:pointer-events-none after:absolute after:inset-0 after:z-1 after:bg-[radial-gradient(circle,rgb(255_255_255/0)_85%,#fff_100%)]">
          {visible &&
            (reduceMotion ? (
              <img
                src={assetUrl(still)}
                alt=""
                decoding="async"
                className="absolute inset-0 z-1 size-full object-contain"
              />
            ) : (
              <video
                ref={forceMuted}
                className="absolute inset-0 z-1 size-full object-contain"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster={assetUrl(poster)}
                onCanPlayThrough={onReady}
              >
                <source src={assetUrl(`${name}.av1.mp4`)} type={AV1_TYPE} />
                <source src={assetUrl(`${name}.mp4`)} type="video/mp4" />
              </video>
            ))}
          {children}
        </div>
      </div>
    </div>
  )
}
