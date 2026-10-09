# Animated robot videos + localized floating badges

## Outcome (implemented 2026-10-09)

Implemented as planned, with these changes found during implementation. Where they conflict with the plan below, these win.

- **White lift.** The masters' background is off-white (249–251, slightly tinted), which showed as a grey square on the `#fff` page; the designer's `circle` vignette only reaches the corners. The encode now lifts input ≥ 0.96 to pure white (`colorlevels`), so every clip's background is exact video white (Y 235, U/V 128) and the box edges are invisible.
- **Quality and size.** CRF is AV1 32 / x264 23 (SSIM ≈ 0.996 against the master, no visible difference at display size). Per clip: AV1 64–475 KB, H.264 84–604 KB, posters 13–16 KB. All media is 3.9 MB; a Chrome visitor to the landing page downloads ~335 KB of it.
- **`thx` crop.** The thank-you clip is cropped to its central 85% (robot, glow and shadow stay ≥ 3% from the edges for the whole loop), so the robot fills the success page like the old still did. Other clips are not cropped.
- **Goal posters.** The goal PNG doesn't match the clip's first frame (smaller robot, no glow), so swapping poster → video jumped. Posters are now the extracted first frames for every clip; the goal image is only the reduced-motion still (`LoopVideo`'s `still` prop).
- **Goal images.** `public/goals/<id>.webp` (21–32 KB, from the 1808 px PNG masters kept in `assets-src/goals/`) instead of PNG. Thumbnails are trimmed 128 px PNGs shown at 64 px.
- **Landing geometry.** On desktop the frame is at most Figma's 548 × 560 (the right grid column × `max-h-140`), so the stage is up to 548 px square. The grid centres it against the text column, and `translate-y-[6%]` nudges it down because the visible group (top badge to robot feet) ends ~12% above the stage bottom; the visible robot and badges are then centred on the text, as the static image was. Badge positions are the mockup's boxes as % of that stage. Tablet (`md`–`lg`) uses a 480 px stage instead of `h-80`, where the badges crowded the robot.
- **`LoopVideo` layout.** The size container is an absolutely positioned layer inside the frame. As an in-flow flex item (the success page) Chrome resolved `cqh` to 0 and the clip disappeared.
- **Helpers.** `AV1_TYPE` and `loopVideoSrc()` live in `src/lib/video.ts` (fast-refresh rule); `src/test/matchMedia.ts` stubs `matchMedia` for unit tests.
- **Figma badge animation (2026-10-09, revised).** The designer's interaction export is a variant switch per badge: after a 1 ms delay (treated as none), smart animate with ease-in-out over Business (black) 1.5 s, Tailored (purple) 2.5 s, 25+ skills (green) 2.3 s, All-in-One (orange) 1.7 s, Personal (blue) 1.9 s. That is one leg, so the there-and-back cycle is 2× (this replaced an interim 1.5× `SLOWDOWN`). Offsets from the designer's sheet: Business up 5 px, Tailored right 3 px, 25+ skills up 9 px and right 1 px, Personal right 3 px, All-in-One down 5 px and left 2 px. Badge sizes (32/34/40/50 px tall) and positions are measured from Figma's 548 × 560 hero frame, where the robot sits at the frame's top edge.
- **Source notes.** The `home` master is not a perfectly seamless loop (first and last frames differ by a few px); `step_1_business` is an intentional 1.6 s loop.

## Context

Landing, Step 1 (goal) and Success show static JPGs of the robot. The designer delivered looping 3D videos (`public/animation_assets/`) and asked for this treatment:

- `<video autoplay loop muted playsinline>` at z-index 1 on a white `#FFFFFF` block.
- A vignette layer over the video: `radial-gradient(circle, rgba(255,255,255,0) 85%, #ffffff 100%)` with `pointer-events: none`.
- On the landing page only, five HTML badges at z-index 2 that levitate. Their text is localized and their width is set by padding only, never a fixed width.

The levitation uses `@keyframes` with `transform: translate`, `ease-in-out`, a different path per badge, durations of 1.5–2.5 s and staggered delays.

The goal PNGs in `public/goals/` were also replaced. They are new transparent renders, and the `-small` files are currently copies of the full ones.

### Decisions (confirmed with the project owner, 2026-10-09)

- **Levitation values:** we have no Figma access, so I use draft values inside the designer's rules. They live in one config so the Dev Mode numbers can be dropped in later.
- **Video size:** I compress hard with ffmpeg (§1). Masters move out of `public/`.
- **Goal → video mapping:** a frontend map keyed by goal id. No API or schema change.
- **Goal PNGs:** I generate real `-small.png` thumbnails. The full PNG becomes the goal video's poster and its reduced-motion fallback.
- **Business clip:** `step_1_business.mp4` (1.63 s) is intentional and loops as is.
- **/quick:** stays static; `common/landing.jpg` stays.

### Measured facts this plan relies on

- **Videos:** all 2160×2160 H.264 + AAC, 13–24 Mbps, 94 MB in total (home 26 MB).
  - Durations: home 8.5 s; personal, all-in-one and thx 10.1 s; business 1.6 s.
  - Edge pixels are 248–255, near-white. The corners are the darkest, and the designer's `circle` (farthest-corner) vignette covers exactly them.
- **Largest on-screen boxes (CSS px):**
  - landing stage about 550 (up to about 620 if enlarged to match the mockup);
  - Success ≤ 480 (`sm:max-h-120`);
  - goal preview ≤ 416 (`max-h-104`).
- **Old thumbnails:** 64 px tall, tightly cropped, rendered at natural size.
- **New PNGs:** 1808×1664 RGBA, about 70% transparent.
- **Playwright:** desktop 1440×900, tablet 820, and Pixel 7, all Chromium. Playwright's Chromium cannot decode H.264, so e2e must not assert playback.

## 0. Save this plan

Copy this plan to `docs/ANIMATIONS_PLAN.md` before any implementation work, and link it from §10 of `docs/IMPLEMENTATION_PLAN.md`.

## 1. Assets and compression

1. `brew install ffmpeg`. Confirm the encoders with `ffmpeg -encoders | grep -E "libx264|libsvtav1|libwebp"`.
2. Move the masters to `assets-src/animations/*.mp4` and add `assets-src/` to `.gitignore`.
3. Inspect each master with `ffprobe` to get its fps.
   - If a master is above 30 fps, encode it at `fps=30`.
   - Compare the two side by side, and keep the original rate only if 30 fps visibly judders.
4. New `scripts/encode-videos.sh` writes everything to `public/animation_assets/` (it is reproducible when the designer re-exports). The output size is about 2× the largest CSS box, rounded to a multiple of 16:

   | master     | output size |
   | ---------- | ----------- |
   | `home`     | 1088        |
   | `thx`      | 960         |
   | `step_1_*` | 832         |

   Each master produces:
   - **AV1, primary:** `ffmpeg -y -i IN -an -vf "fps=30,scale=S:S:flags=lanczos,format=yuv420p" -c:v libsvtav1 -preset 4 -crf 38 -g 240 -movflags +faststart NAME.av1.mp4`
   - **H.264, fallback** (Safari and older devices without AV1 decode): `-c:v libx264 -preset veryslow -crf 26 -profile:v high -movflags +faststart NAME.mp4`
   - **Poster:** `ffmpeg -y -i NAME.mp4 -frames:v 1 -c:v libwebp -quality 80 NAME.webp`

   For every output:
   - **No audio.** `-an` strips the unused AAC track.
   - **Faststart,** so playback starts before the download finishes.

   Size budget per clip:
   - AV1 ≤ about 0.8 MB;
   - H.264 ≤ about 1.5 MB;
   - poster ≤ about 60 KB.

   If a clip is over budget, raise its CRF (AV1 by +2–4, x264 by +2). If the green glow bands, lower it. Check that the loop seam is still clean.

5. **Goal thumbnails.** For each of `personal`, `business` and `allinone`:
   - compute the opaque bounding box of the full PNG (alpha > 8) with a throwaway `python3 -I` script in the scratchpad;
   - crop it with `sips -c H W --cropOffset Y X`;
   - write `public/goals/<id>-small.png` with `sips --resampleHeight 128` (2× of the old 64 px).
6. **Goal posters.** Run `sips --resampleWidth 832` on `public/goals/{personal,business,allinone}.png` (about 1 MB → a few hundred KB). These are the goal `image`.
7. Update `src/api/mocks/{en,uk}/goals.json`:
   - `image` → `goals/<file>.png`, `thumbnail` → `goals/<file>-small.png`.
   - Note that `all_in_one` uses `allinone.*` (it was `custom.*`).
   - IDs stay the same.
8. Delete the now-unused `public/common/thank_you.jpg`. Keep `landing.jpg` (/quick uses it).

## 2. Shared building blocks

**`src/lib/useMediaQuery.ts`** is a `useSyncExternalStore` wrapper around `matchMedia`. It returns `false` when `matchMedia` is missing (jsdom) and on the server snapshot.

**`src/index.css`**

- Badge colour tokens sampled from `Intro screen - START.png`, in `:root` plus `@theme inline`: `--badge-purple #884bbe`, `--badge-blue #027ed1`, `--badge-orange #de883c`, `--badge-dark #181d25`. The green badge uses `brand`.
- A separate `@theme` block for the animation:
  ```css
  --animate-levitate: levitate 2s ease-in-out infinite;
  @keyframes levitate {
    0%,
    100% {
      transform: translate(0, 0);
    }
    50% {
      transform: translate(var(--levitate-x, 0px), var(--levitate-y, 0px));
    }
  }
  ```
  Tailwind v4's `translate-*` utilities use the `translate` property, so centring classes compose with this `transform`.

**`src/components/common/LoopVideo.tsx`.** This replaces `AppImage` on the three pages.

Props:

- `name`: a path without extension inside `public/`, e.g. `animation_assets/home`;
- `poster?`: defaults to `${name}.webp`;
- `className`: the frame;
- `media?`: mount the video only while this query matches, so CSS-hidden copies never download;
- `children`: overlays.

Structure:

```tsx
<div aria-hidden className={cn("flex items-center justify-center bg-white [container-type:size]", className)}>
  {/* square stage = exactly the video's box, so the vignette sits on the video edges */}
  <div className="relative isolate size-[min(100cqw,100cqh)] after:pointer-events-none after:absolute after:inset-0 after:z-1 after:bg-[radial-gradient(circle,rgb(255_255_255/0)_85%,#fff_100%)]">
    {reduceMotion ? <img src={poster} …/> : (
      <video ref={forceMuted} className="absolute inset-0 z-1 size-full object-contain" autoPlay loop muted playsInline preload="auto" poster={…}>
        <source src={`${name}.av1.mp4`} type='video/mp4; codecs="av01.0.08M.08"' />
        <source src={`${name}.mp4`} type="video/mp4" />
      </video>
    )}
    {children /* z-2 */}
  </div>
</div>
```

- **Sources:** the browser plays the first `<source>` it can decode, so AV1-capable browsers never fetch the H.264 file. Take the exact `av01.*` codec string from `ffprobe` on the encoded file.
- **Switching videos:** changing `<source>` children does not reload a `<video>`, so callers that switch videos must remount it with `key`.
- **Square stage:** `container-type: size` gives the frame no intrinsic height. That keeps today's "out of flow, takes what the text leaves" behaviour, and the stage becomes the largest square that fits.
- **Paths:** go through `assetUrl()` from `src/lib/utils.ts`.
- **Muting:** the `forceMuted` ref sets `el.defaultMuted = el.muted = true`, because React sets `muted` only as a property and iOS checks it for autoplay.
- **Reduced motion:** reads `useMediaQuery("(prefers-reduced-motion: reduce)")`. When it matches, the component renders the poster `<img>` and never downloads the video.

**`src/components/common/FloatingBadge.tsx`.** It uses `cva`, like `components/ui/button.tsx`.

- Base classes: `absolute z-2 whitespace-nowrap rounded-full text-white animate-levitate motion-reduce:animate-none`. Width comes from padding only, never a fixed `w-*`.
- `tone`: `purple | dark | brand | blue | orange`.
- `size`, from the measured mockup boxes:
  - `sm`: `text-sm leading-5 px-3.5 py-2` (36 px tall)
  - `md`: `text-base leading-6 px-4 py-2` (40)
  - `lg`: `text-xl leading-7 px-4.5 py-2.5` (48)
  - `xl`: `text-[1.375rem] leading-8 px-5.5 py-3` (56)
- `float: { x?, y?, duration, delay? }` sets `--levitate-x`, `--levitate-y`, `animationDuration` and `animationDelay` inline (cast to `CSSProperties`).
- `className` sets the absolute position. `children` is the text.

## 3. Landing (`src/routes/Landing.tsx`)

- Replace the `AppImage` with `<LoopVideo name="animation_assets/home" media="(width >= 48rem)">`.
  - Keep the frame classes `relative h-80 max-md:hidden lg:h-full lg:max-h-140 lg:min-h-96`.
  - Drop `overflow-hidden`, because badges may overhang the stage.
  - Drop the `translate-y-[11%]` nudge, which only applied to the old JPG.
- Add a `HERO_BADGES` config at the top of the file and render it as `FloatingBadge` children with `t("landing.heroBadges.<id>")`.
- **Anchoring:** left badges use `left`, right badges use `right`, and "Tailored" uses `left-1/2 -translate-x-1/2`. That way a longer Ukrainian word grows toward the robot instead of off the column.

Draft config. Positions are % of the 548 px desktop stage, derived from the mockup and scaled to the video robot. Tune them against the mockup.

| id       | tone / size | position            | path x,y (px)      | duration | delay |
| -------- | ----------- | ------------------- | ------------------ | -------- | ----- |
| tailored | purple / sm | top −1%, centred    | 0, −8 (up)         | 2.2s     | 0s    |
| skills   | brand / xl  | top 7.5%, right 0%  | −6, −10 (diagonal) | 1.8s     | 0.3s  |
| business | dark / lg   | top 11%, left 5.5%  | 0, 10 (down)       | 2.5s     | 0.6s  |
| personal | blue / sm   | top 46%, left 5.5%  | 8, −6 (diagonal)   | 1.6s     | 0.2s  |
| allInOne | orange / md | top 50%, right 3.5% | 0, −10 (up)        | 2.0s     | 0.9s  |

In the mockup the robot is about 450 px tall (head top at y≈255). In a 548 px stage the video robot is about 400 px. If the size difference shows, grow the frame past the column, for example with negative horizontal margin at `lg`. Do not scale the `<video>` inside the stage, or the vignette stops lining up with its edges.

**Tablet (768–1023 px, `h-80` stage):** check the layout and, if badges crowd the robot, shrink sizes with `lg:` variants.

## 4. Goal step

- New `src/routes/wizard/goal/goalVideos.ts` exports `GOAL_VIDEOS: Record<string, string>` (`personal` → `animation_assets/step_1_personal`, `business` → `…step_1_business`, `all_in_one` → `…step_1_all`). Add a comment that this mapping is deliberately not part of the catalog API.
- `GoalPreview.tsx`:
  - Render `<LoopVideo key={goal.id} name={GOAL_VIDEOS[goal.id]} poster={goal.image} media="(width >= 64rem)" className="max-h-104 min-h-0 w-full flex-1" />`. The `key` is required for switching sources and also restarts the clip.
  - Fall back to the current `AppImage` when no video is mapped.
- **Instant goal switching:** once the selected goal's video fires `canplaythrough`, warm the other two with `<link rel="prefetch">`, using the same `canPlayType` choice as the `<source>` list. Each is under 1 MB.
- `GoalCard.tsx` and `wizard/components/SummaryPanel.tsx`: change the thumbnail `imgClassName` from `size-auto …` to `h-16 w-auto max-h-full max-w-full`. The 2× PNG then shows at the old 64 px.
- **Known risk:** the PNG poster has no glow and a slightly different crop, so the swap to the video may visibly jump. If it does, drop the `poster` override so the extracted `step_1_*.webp` frame is used, and keep the PNG for reduced motion only.

## 5. Success (`src/routes/Success.tsx`)

Replace the `AppImage` with `<LoopVideo name="animation_assets/thx" className="relative min-h-60 w-full flex-1 sm:max-h-120" />`. This one is visible on every screen size, so there is no `media` prop.

## 6. i18n

In `src/i18n/locales/{en,uk}.json`, add `landing.heroBadges.{tailored, business, skills, personal, allInOne}`:

- en: "Tailored to you", "Business", "25+ skills", "Personal", "All-in-One"
- uk (draft): "Під ваші потреби", "Бізнес", "25+ навичок", "Особисте", "Все-в-одному"

The existing `landing.badge` (the clock pill) is unchanged.

## 7. Docs

- `docs/IMPLEMENTATION_PLAN.md`:
  - §4.1, §4.2 and §4.5: describe the videos and badges.
  - §9: add `LoopVideo`, `FloatingBadge` and `scripts/encode-videos.sh`.
  - §10: video and vignette rules, levitation rules, reduced motion, the encode pipeline, a link to `ANIMATIONS_PLAN.md`.
  - §12: levitation values are drafts pending Figma; UK badge copy is a draft.
- `CLAUDE.md`, one line under Design: the masters live in the gitignored `assets-src/animations/`, and you run `scripts/encode-videos.sh` (needs ffmpeg) to regenerate the AV1, H.264 and WebP outputs.

## 8. Tests

- **Vitest:**
  - `useMediaQuery` with a stubbed `matchMedia`, covering change events and the missing-API case.
  - `FloatingBadge`: renders its text and sets the CSS vars, duration and delay; no `w-` class.
- **Playwright** (`e2e/`):
  - Desktop:
    - The landing `video` has `autoplay`, `muted`, `loop` and `playsinline`, and has `<source>` elements for `home.av1.mp4` and `home.mp4`.
    - Five badges are visible with English text, and switching to UK shows the Ukrainian text.
    - On the goal step, picking Personal swaps the sources to `step_1_personal.*`.
    - Success has the `thx` video.
  - Mobile: the landing page has no `<video>`.
  - `page.emulateMedia({ reducedMotion: "reduce" })`: no `<video>`, the poster `<img>` is present, and badges compute `animation-name: none`.
  - Do not assert playback (no H.264 in Playwright's Chromium).

## Verification

1. Run `ls -lh public/animation_assets public/goals` and check the size budgets from §1. Record the before and after totals in the PR description (94 MB of masters → expected about 5–8 MB for all outputs).
2. Run `pnpm lint && pnpm test && pnpm build && pnpm test:e2e`.
3. In `pnpm dev`, at 1440×900:
   - Screenshot Landing, Goal (each goal) and Success, and compare them with `docs/design/*.png`: robot size and placement, badge positions and sizes, no visible seam, no banding in the glow.
   - Check that the badges move out of sync.
   - Switch EN↔UK and confirm the badges resize with the text.
   - Check 820 px (tablet) and 390 px (mobile).
4. On the Network tab:
   - In Chrome, only the `.av1.mp4` files are fetched.
   - In Safari on a device without AV1, only the `.mp4` files are fetched.
   - At mobile width, no landing or goal video is fetched.
   - On the goal step, the other two goal clips are prefetched after the first one plays.
5. In DevTools, emulate `prefers-reduced-motion`: static posters appear and no video is fetched.
6. Spot-check autoplay in Safari (desktop, and iOS if available).
