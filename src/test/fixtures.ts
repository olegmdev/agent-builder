import type { CategoryGroup, Goal } from "@/api/schemas"

export const catalog: CategoryGroup[] = [
  {
    id: "ops",
    title: "OPS",
    categories: [
      {
        id: "search",
        title: "Search",
        description: "",
        icon: "",
        skills: [
          {
            id: "research",
            title: "Research",
            availableConnectors: [
              { id: "firecrawl", name: "Firecrawl" },
              { id: "notion", name: "Notion" },
            ],
          },
          {
            id: "summaries",
            title: "Summaries",
            availableConnectors: [{ id: "notion", name: "Notion" }],
          },
        ],
      },
      {
        id: "meetings",
        title: "Meetings",
        description: "",
        icon: "",
        skills: [{ id: "prep", title: "Prep", availableConnectors: [] }],
      },
    ],
  },
]

export const goal = (id: string, defaults: Goal["defaultSelectedSkills"]): Goal => ({
  id,
  title: id,
  description: "",
  image: "",
  thumbnail: "",
  defaultSelectedSkills: defaults,
})
