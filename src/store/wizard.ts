import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { Category, CategoryGroup, Contact, Goal, Skill } from "@/api/schemas"

export const DEFAULT_GOAL_ID = "all_in_one"
export const PERSIST_KEY = "scope-builder-wizard"
const PERSIST_VERSION = 2

export interface SkillSelectionState {
  categoryId: string
  connectorIds: string[]
}

export interface WizardData {
  goalId: string | null
  /** Goal the current selections were seeded for (see plan §6.1). */
  selectionsGoalId: string | null
  /** Keyed by skill ID. IDs only: labels always come from the current-locale catalog. */
  selections: Record<string, SkillSelectionState>
  contact: Contact
}

export interface WizardActions {
  setGoal: (goalId: string) => void
  seedDefaults: (goal: Goal, catalog: CategoryGroup[]) => void
  pruneSelections: (catalog: CategoryGroup[]) => void
  toggleSkill: (skill: Skill, categoryId: string) => void
  toggleConnector: (skillId: string, connectorId: string) => void
  selectAllInCategory: (category: Category) => void
  clearCategory: (categoryId: string) => void
  setContact: (contact: Partial<Contact>) => void
  resetWizard: () => void
}

export type WizardState = WizardData & { actions: WizardActions }

const initialData = (): WizardData => ({
  goalId: DEFAULT_GOAL_ID,
  selectionsGoalId: null,
  selections: {},
  contact: { name: "", email: "", company: "" },
})

type CatalogIndex = Map<string, { categoryId: string; connectorIds: Set<string> }>

function indexCatalog(catalog: CategoryGroup[]): CatalogIndex {
  const index: CatalogIndex = new Map()
  for (const group of catalog)
    for (const category of group.categories)
      for (const skill of category.skills)
        index.set(skill.id, {
          categoryId: category.id,
          connectorIds: new Set(skill.availableConnectors.map((c) => c.id)),
        })
  return index
}

/** The skill's default connectors, limited to the ones it actually offers. */
const defaultConnectorIds = (skill: Skill) =>
  [...new Set(skill.defaultConnectorIds)].filter((id) =>
    skill.availableConnectors.some((c) => c.id === id),
  )

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      ...initialData(),

      actions: {
        setGoal: (goalId) => set({ goalId }),

        seedDefaults: (goal, catalog) => {
          const skillIndex = indexCatalog(catalog)
          const selections: WizardData["selections"] = {}
          for (const { skillId, connectorIds } of goal.defaultSelectedSkills) {
            const known = skillIndex.get(skillId)
            if (!known) continue
            selections[skillId] = {
              categoryId: known.categoryId,
              connectorIds: [...new Set(connectorIds)].filter((id) => known.connectorIds.has(id)),
            }
          }
          set({ selections, selectionsGoalId: goal.id })
        },

        // Persisted selections may outlive the catalog (a skill or connector removed by the API).
        // Drops what no longer exists and leaves the state untouched when nothing changed.
        pruneSelections: (catalog) => {
          const skillIndex = indexCatalog(catalog)
          const current = get().selections
          const next: WizardData["selections"] = {}
          let changed = false
          for (const [skillId, selection] of Object.entries(current)) {
            const known = skillIndex.get(skillId)
            if (!known) {
              changed = true
              continue
            }
            const connectorIds = selection.connectorIds.filter((id) => known.connectorIds.has(id))
            if (
              known.categoryId !== selection.categoryId ||
              connectorIds.length !== selection.connectorIds.length
            ) {
              changed = true
              next[skillId] = { categoryId: known.categoryId, connectorIds }
            } else next[skillId] = selection
          }
          if (changed) set({ selections: next })
        },

        toggleSkill: (skill, categoryId) =>
          set(({ selections }) => {
            const next = { ...selections }
            if (next[skill.id]) delete next[skill.id]
            else next[skill.id] = { categoryId, connectorIds: defaultConnectorIds(skill) }
            return { selections: next }
          }),

        toggleConnector: (skillId, connectorId) =>
          set(({ selections }) => {
            const current = selections[skillId]
            if (!current) return {}
            const connectorIds = current.connectorIds.includes(connectorId)
              ? current.connectorIds.filter((id) => id !== connectorId)
              : [...current.connectorIds, connectorId]
            return { selections: { ...selections, [skillId]: { ...current, connectorIds } } }
          }),

        selectAllInCategory: (category) =>
          set(({ selections }) => {
            const next = { ...selections }
            for (const skill of category.skills)
              next[skill.id] ??= {
                categoryId: category.id,
                connectorIds: defaultConnectorIds(skill),
              }
            return { selections: next }
          }),

        clearCategory: (categoryId) =>
          set(({ selections }) => ({
            selections: Object.fromEntries(
              Object.entries(selections).filter(([, s]) => s.categoryId !== categoryId),
            ),
          })),

        setContact: (contact) => set((s) => ({ contact: { ...s.contact, ...contact } })),

        resetWizard: () => set(initialData()),
      },
    }),
    {
      name: PERSIST_KEY,
      version: PERSIST_VERSION,
      storage: createJSONStorage(() => localStorage),
      // Keep `actions` out of storage: it would be saved as `{}` and the shallow merge on rehydrate
      // would replace the real actions with it.
      partialize: ({ goalId, selectionsGoalId, selections, contact }): WizardData => ({
        goalId,
        selectionsGoalId,
        selections,
        contact,
      }),
      // Zustand calls `migrate` only when the stored version differs from PERSIST_VERSION.
      // v1 also held the locale (now in LocaleProvider): drop it and keep the progress. Any other
      // version falls back to a fresh wizard. Same-version data is merged as-is; selections are
      // re-checked against the catalog by `pruneSelections`.
      migrate: (persisted, version) => {
        if (version !== 1 || !persisted || typeof persisted !== "object") return initialData()
        const { goalId, selectionsGoalId, selections, contact } = persisted as WizardData
        return { ...initialData(), goalId, selectionsGoalId, selections, contact }
      },
    },
  ),
)

/** Stable reference: safe to destructure, never triggers a re-render. */
export const useWizardActions = () => useWizardStore((s) => s.actions)
