#!/usr/bin/env bash
#
# Builds the web loops in public/animation_assets from the designer's 2160p masters.
#
# The masters live in assets-src/animations (gitignored, never deployed). For each one this writes:
#   NAME.av1.mp4  AV1, the primary source (much smaller; picked by browsers that decode AV1)
#   NAME.mp4      H.264, the fallback for Safari and older devices without AV1
#   NAME.webp     the first frame, used as the poster
#
# Output size is about 2x the largest box the clip is shown in, at 30 fps, without the audio track.
# The masters' backgrounds are off-white (about 249-251, slightly tinted), which shows as a grey box
# on the #fff page, so near-white is lifted to pure white before scaling.
# Needs ffmpeg (with libsvtav1 and libx264) and cwebp: `brew install ffmpeg webp`.
#
# Usage: scripts/encode-videos.sh [name ...]   (default: every master)
set -euo pipefail

SRC=assets-src/animations
OUT=public/animation_assets

# Square output size per master: 2x the largest CSS box, a multiple of 16.
size_for() {
  case "$1" in
    home) echo 1088 ;;       # landing stage, ~550 px
    thx) echo 960 ;;         # success page, max-h-120 (480 px)
    step_1_*) echo 832 ;;    # goal preview, max-h-104 (416 px)
    *) echo "No output size for '$1'; add it to size_for." >&2 && exit 1 ;;
  esac
}

# Optional crop before scaling (a square window, as fractions of the master), for clips with wide
# white margins. thx: the robot, its glow and shadow span x 26-73% / y 17-92% over the whole loop;
# the window keeps ~6% around them so the robot fills the success page like the old still did.
crop_for() {
  case "$1" in
    thx) echo "crop=iw*0.85:ih*0.85:iw*0.07:ih*0.119," ;;
    *) echo "" ;;
  esac
}

# Quality: SSIM vs the master is ~0.996 for both, visually indistinguishable at display size.
# Raise a value if a clip gets too heavy; lower it if the green glow starts to band.
AV1_CRF=32
X264_CRF=23

# Input level that becomes pure white (0.96 = 245): clears the background, keeps the robot's highlights.
WHITE=0.96

export SVT_LOG=1 # SVT-AV1 prints its config on every run otherwise
COLOR=(-colorspace bt709 -color_primaries bt709 -color_trc bt709)

names=("$@")
if [ ${#names[@]} -eq 0 ]; then
  for f in "$SRC"/*.mp4; do names+=("$(basename "$f" .mp4)"); done
fi

mkdir -p "$OUT"
for name in "${names[@]}"; do
  in="$SRC/$name.mp4"
  size=$(size_for "$name")
  vf="fps=30,$(crop_for "$name")colorlevels=rimax=$WHITE:gimax=$WHITE:bimax=$WHITE"
  vf="$vf,scale=$size:$size:flags=lanczos,format=yuv420p"
  echo "== $name ($size px)"

  ffmpeg -hide_banner -loglevel error -y -i "$in" -an -vf "$vf" "${COLOR[@]}" \
    -c:v libsvtav1 -preset 4 -crf "$AV1_CRF" -g 240 \
    -movflags +faststart "$OUT/$name.av1.mp4"

  ffmpeg -hide_banner -loglevel error -y -i "$in" -an -vf "$vf" "${COLOR[@]}" \
    -c:v libx264 -preset veryslow -crf "$X264_CRF" -profile:v high \
    -movflags +faststart "$OUT/$name.mp4"

  tmp=$(mktemp -d)
  ffmpeg -hide_banner -loglevel error -y -i "$OUT/$name.mp4" -frames:v 1 "$tmp/frame.png"
  cwebp -quiet -q 80 "$tmp/frame.png" -o "$OUT/$name.webp"
  rm -rf "$tmp"
done

ls -l "$OUT"
