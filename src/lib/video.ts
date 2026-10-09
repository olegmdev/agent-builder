import { assetUrl } from "@/lib/utils"

/** AV1 Main profile, level 4.0, 8-bit: covers every clip that scripts/encode-videos.sh writes. */
export const AV1_TYPE = 'video/mp4; codecs="av01.0.08M.08"'

let av1: boolean | undefined

/**
 * The file a browser picks for a clip: the AV1 source when it can decode it, the H.264 one
 * otherwise. Same rule as LoopVideo's `<source>` list, so a prefetch warms the right file.
 */
export function loopVideoSrc(name: string) {
  av1 ??= document.createElement("video").canPlayType(AV1_TYPE) !== ""
  return assetUrl(av1 ? `${name}.av1.mp4` : `${name}.mp4`)
}
