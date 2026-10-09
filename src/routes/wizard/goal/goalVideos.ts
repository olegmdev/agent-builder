/**
 * Preview clip per goal id (see LoopVideo for the files next to each name). Kept in the frontend on
 * purpose: the clips are not part of the catalog API, which only carries the static `image`.
 */
export const GOAL_VIDEOS: Record<string, string> = {
  personal: "animation_assets/step_1_personal",
  business: "animation_assets/step_1_business",
  all_in_one: "animation_assets/step_1_all",
}
