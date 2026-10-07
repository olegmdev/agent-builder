import { z } from "zod"

export const localeSchema = z.enum(["uk", "en"])
export type Locale = z.infer<typeof localeSchema>
export const LOCALES = localeSchema.options

export const connectorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
})
export type Connector = z.infer<typeof connectorSchema>

export const skillSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  availableConnectors: z.array(connectorSchema),
})
export type Skill = z.infer<typeof skillSchema>

export const categorySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  icon: z.string(),
  skills: z.array(skillSchema),
})
export type Category = z.infer<typeof categorySchema>

export const categoryGroupSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  categories: z.array(categorySchema),
})
export type CategoryGroup = z.infer<typeof categoryGroupSchema>
export const categoryGroupsSchema = z.array(categoryGroupSchema)

export const skillSelectionSchema = z.object({
  skillId: z.string().min(1),
  connectorIds: z.array(z.string()),
})
export type SkillSelection = z.infer<typeof skillSelectionSchema>

export const goalSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  image: z.string(),
  /** A small, tightly cropped version of `image` for cards and the summary panel. */
  thumbnail: z.string(),
  defaultSelectedSkills: z.array(skillSelectionSchema),
})
export type Goal = z.infer<typeof goalSchema>
export const goalsSchema = z.array(goalSchema)

export const contactSchema = z.object({
  name: z.string().trim().min(1, "validation.nameRequired"),
  email: z.email("validation.emailInvalid"),
  company: z.string().trim().optional(),
})
export type Contact = z.infer<typeof contactSchema>

export interface EstimatePayload {
  locale: Locale
  goalId: string
  skills: SkillSelection[]
  contact: Contact
}

export const quickRequestSchema = z.object({
  name: z.string().trim().min(1, "validation.nameRequired"),
  email: z.email("validation.emailInvalid"),
  agentName: z.string().trim().optional(),
  reason: z.string().trim().optional(),
})
export type QuickRequest = z.infer<typeof quickRequestSchema>

export interface QuickRequestPayload extends QuickRequest {
  locale: Locale
}
