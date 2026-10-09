import { beforeEach, describe, expect, it } from "vitest"
import { catalog, goal } from "@/test/fixtures"
import { canContinueFromSkills, selectedByCategory } from "./selectors"
import { PERSIST_KEY, useWizardStore } from "./wizard"

const store = () => useWizardStore.getState()
const skill = (id: string) =>
  catalog.flatMap((g) => g.categories.flatMap((c) => c.skills)).find((s) => s.id === id)!
const actions = () => store().actions

const allInOne = goal("all_in_one", [
  { skillId: "research", connectorIds: ["firecrawl"] },
  { skillId: "summaries", connectorIds: ["notion"] },
])
const personal = goal("personal", [{ skillId: "prep", connectorIds: [] }])

/** What SkillsStep does on mount (plan §6.1). */
const visitSkills = (g = allInOne) => {
  if (store().selectionsGoalId !== store().goalId) actions().seedDefaults(g, catalog)
}

beforeEach(() => {
  localStorage.clear()
  useWizardStore.setState(useWizardStore.getInitialState(), true)
  actions().setGoal("all_in_one")
})

describe("default seeding", () => {
  it("seeds the goal's defaults (skills and connectors) on the first visit", () => {
    visitSkills()
    expect(store().selections).toEqual({
      research: { categoryId: "search", connectorIds: ["firecrawl"] },
      summaries: { categoryId: "search", connectorIds: ["notion"] },
    })
    expect(store().selectionsGoalId).toBe("all_in_one")
    expect(canContinueFromSkills(store().selections)).toBe(true)
  })

  it("seeds only once per goal", () => {
    visitSkills()
    actions().toggleConnector("research", "notion")
    visitSkills()
    expect(store().selections.research.connectorIds).toEqual(["firecrawl", "notion"])
  })

  it("keeps a fully deselected state after a reload (no re-seed)", async () => {
    visitSkills()
    actions().clearCategory("search")
    expect(canContinueFromSkills(store().selections)).toBe(false)

    const persisted = localStorage.getItem(PERSIST_KEY)
    useWizardStore.setState(useWizardStore.getInitialState(), true)
    localStorage.setItem(PERSIST_KEY, persisted!)
    await useWizardStore.persist.rehydrate()

    visitSkills()
    expect(store().selections).toEqual({})
    expect(canContinueFromSkills(store().selections)).toBe(false)
  })

  it("re-seeds when the goal changes", () => {
    visitSkills()
    actions().setGoal("personal")
    visitSkills(personal)
    expect(Object.keys(store().selections)).toEqual(["prep"])
    expect(store().selectionsGoalId).toBe("personal")
  })

  it("filters out unknown skill and connector IDs", () => {
    actions().seedDefaults(
      goal("all_in_one", [
        { skillId: "research", connectorIds: ["firecrawl", "slack"] },
        { skillId: "does_not_exist", connectorIds: [] },
      ]),
      catalog,
    )
    expect(store().selections).toEqual({
      research: { categoryId: "search", connectorIds: ["firecrawl"] },
    })
  })
})

describe("selection actions", () => {
  it("switches on the skill's default connectors when it is checked", () => {
    actions().toggleSkill(skill("research"), "search")
    expect(store().selections.research).toEqual({
      categoryId: "search",
      connectorIds: ["firecrawl"],
    })
  })

  it("ignores default connectors the skill does not offer", () => {
    actions().toggleSkill(
      { ...skill("summaries"), defaultConnectorIds: ["notion", "slack"] },
      "search",
    )
    expect(store().selections.summaries.connectorIds).toEqual(["notion"])
  })

  it("resets a skill's connectors to its defaults when it is unchecked and checked again", () => {
    visitSkills()
    actions().toggleConnector("research", "notion")
    actions().toggleSkill(skill("research"), "search")
    actions().toggleSkill(skill("research"), "search")
    expect(store().selections.research.connectorIds).toEqual(["firecrawl"])
  })

  it("clears only the given category", () => {
    visitSkills()
    actions().toggleSkill(skill("prep"), "meetings")
    actions().clearCategory("search")
    expect(Object.keys(store().selections)).toEqual(["prep"])
  })

  it("selects all skills in a category without touching existing connectors", () => {
    visitSkills()
    actions().toggleConnector("research", "notion")
    actions().selectAllInCategory(catalog[0].categories[0])
    expect(store().selections.research.connectorIds).toEqual(["firecrawl", "notion"])
  })

  it("switches on default connectors for the skills that select-all adds", () => {
    actions().selectAllInCategory(catalog[0].categories[0])
    expect(store().selections).toEqual({
      research: { categoryId: "search", connectorIds: ["firecrawl"] },
      summaries: { categoryId: "search", connectorIds: ["notion"] },
    })
  })

  it("groups the summary by category in catalog order", () => {
    actions().toggleSkill(skill("prep"), "meetings")
    actions().toggleSkill(skill("summaries"), "search")
    const summary = selectedByCategory(catalog, store().selections)
    expect(summary.map((s) => [s.category.id, s.skills.map((k) => k.id)])).toEqual([
      ["search", ["summaries"]],
      ["meetings", ["prep"]],
    ])
  })
})

describe("pruneSelections", () => {
  it("drops skills and connectors the catalog no longer has", () => {
    visitSkills()
    actions().toggleSkill({ ...skill("prep"), id: "removed_skill" }, "search")
    actions().toggleConnector("research", "removed_connector")
    actions().pruneSelections(catalog)
    expect(store().selections).toEqual({
      research: { categoryId: "search", connectorIds: ["firecrawl"] },
      summaries: { categoryId: "search", connectorIds: ["notion"] },
    })
  })

  it("keeps the same selections object when nothing changed", () => {
    visitSkills()
    const before = store().selections
    actions().pruneSelections(catalog)
    expect(store().selections).toBe(before)
  })
})

describe("resetWizard", () => {
  it("clears everything", () => {
    visitSkills()
    actions().setContact({ name: "Ann", email: "ann@example.com" })
    actions().resetWizard()
    expect(store()).toMatchObject({
      goalId: "all_in_one",
      selectionsGoalId: null,
      selections: {},
      contact: { name: "", email: "", company: "" },
    })
  })
})

describe("persist migration", () => {
  const rehydrateFrom = async (state: object, version: number) => {
    localStorage.setItem(PERSIST_KEY, JSON.stringify({ state, version }))
    await useWizardStore.persist.rehydrate()
  }

  it("keeps v1 progress and drops the locale (now owned by LocaleProvider)", async () => {
    const selections = { research: { categoryId: "search", connectorIds: ["firecrawl"] } }
    const contact = { name: "Ann", email: "ann@example.com", company: "" }
    await rehydrateFrom(
      { locale: "en", goalId: "personal", selectionsGoalId: "personal", selections, contact },
      1,
    )
    expect(store()).toMatchObject({
      goalId: "personal",
      selectionsGoalId: "personal",
      selections,
      contact,
    })
    expect(store()).not.toHaveProperty("locale")
    expect(JSON.parse(localStorage.getItem(PERSIST_KEY)!).state).not.toHaveProperty("locale")
  })

  it("starts a fresh wizard from an unknown version", async () => {
    await rehydrateFrom({ goalId: "personal", selectionsGoalId: "personal" }, 0)
    expect(store()).toMatchObject({ goalId: "all_in_one", selectionsGoalId: null, selections: {} })
  })
})
