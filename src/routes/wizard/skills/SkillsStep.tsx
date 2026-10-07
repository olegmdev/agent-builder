import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router"
import { useCategories, useGoals } from "@/api/queries"
import type { CategoryGroup as CategoryGroupData } from "@/api/schemas"
import { ErrorState } from "@/components/common/ErrorState"
import { LocaleNavigate } from "@/locale/links"
import { useLocaleNavigate } from "@/locale/navigation"
import { CategoryGroup } from "./CategoryGroup"
import { Accordion } from "@/components/ui/accordion"
import { ButtonLink } from "@/components/common/ButtonLink"
import { Button } from "@/components/ui/button"
import { SummaryPanel } from "@/routes/wizard/components/SummaryPanel"
import { WizardFooter } from "@/routes/wizard/components/WizardFooter"
import { WizardLayout } from "@/routes/wizard/components/WizardLayout"
import { canContinueFromSkills } from "@/store/selectors"
import { DEFAULT_GOAL_ID, useWizardActions, useWizardStore, type WizardData } from "@/store/wizard"
import type { SkillsLocationState } from "@/routes/wizard/guards"
import { SkillsSkeleton } from "./SkillsSkeleton"

export default function SkillsStep() {
  const goalId = useWizardStore((s) => s.goalId)
  if (!goalId) return <LocaleNavigate to="/goal" replace />
  // Remount per goal so the expanded-categories state starts fresh after "Switch to All-in-One".
  return <SkillsStepContent key={goalId} goalId={goalId} />
}

function SkillsStepContent({ goalId }: { goalId: string }) {
  const { t } = useTranslation()
  const navigate = useLocaleNavigate()
  const location = useLocation()
  const focusFromState = (location.state as SkillsLocationState | null)?.focusCategoryId

  const goals = useGoals()
  const categories = useCategories(goalId)
  const goal = goals.data?.find((g) => g.id === goalId)
  const catalog = categories.data

  const selections = useWizardStore((s) => s.selections)
  const selectionsGoalId = useWizardStore((s) => s.selectionsGoalId)
  const { seedDefaults, pruneSelections, setGoal } = useWizardActions()
  const needsSeed = selectionsGoalId !== goalId

  // Plan §6.1: seed once per goal, in a single update, before paint (no empty-then-filled flicker).
  // Already-seeded selections are only re-checked against the catalog, never re-seeded.
  useLayoutEffect(() => {
    if (!goal || !catalog) return
    if (needsSeed) seedDefaults(goal, catalog)
    else pruneSelections(catalog)
  }, [needsSeed, goal, catalog, seedDefaults, pruneSelections])

  const ready = Boolean(catalog && goal && !needsSeed)

  const [expanded, setExpanded] = useState<string[] | null>(null)
  if (ready && catalog && expanded === null)
    setExpanded(initiallyExpanded(catalog, selections, focusFromState))

  // "Change" on Step 3 lands here with a category to reveal; scroll to it once the list renders.
  const focusHandled = useRef(false)
  useEffect(() => {
    if (!ready || !focusFromState || focusHandled.current) return
    focusHandled.current = true
    scrollToCategory(focusFromState)
    void navigate(".", { replace: true, state: null })
  }, [ready, focusFromState, navigate])

  const focusCategory = useCallback((categoryId: string) => {
    setExpanded((prev) => (prev?.includes(categoryId) ? prev : [...(prev ?? []), categoryId]))
    scrollToCategory(categoryId)
  }, [])

  if (goals.data && !goal) return <LocaleNavigate to="/goal" replace />

  const canContinue = ready && canContinueFromSkills(selections)

  return (
    <WizardLayout
      step={2}
      title={t("skills.title")}
      subtitle={t("skills.subtitle")}
      aside={<SummaryPanel goal={goal} catalog={catalog} onChangeCategory={focusCategory} />}
      footer={
        <WizardFooter
          back={
            <ButtonLink variant="back" size="xl" to="/goal" className="max-sm:px-4">
              <ArrowLeftIcon />
              <span className="max-sm:sr-only">{t("skills.back")}</span>
            </ButtonLink>
          }
          next={
            <Button
              size="xl"
              disabled={!canContinue}
              title={canContinue ? undefined : t("skills.nextDisabledHint")}
              onClick={() => void navigate("/contact")}
            >
              {t("skills.next")}
              <ArrowRightIcon />
            </Button>
          }
        />
      }
    >
      <div className="mt-8 lg:mt-12">
        {categories.isError || goals.isError ? (
          <ErrorState
            onRetry={() => {
              void goals.refetch()
              void categories.refetch()
            }}
          />
        ) : ready && catalog ? (
          <>
            <Accordion
              multiple
              value={expanded ?? []}
              onValueChange={(v) => setExpanded(v as string[])}
            >
              {catalog.map((group) => (
                <CategoryGroup key={group.id} group={group} />
              ))}
            </Accordion>
            {goalId !== DEFAULT_GOAL_ID && (
              <p className="mt-10 text-base text-ink">
                {t("skills.cantFind")}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setGoal(DEFAULT_GOAL_ID)
                    window.scrollTo({ top: 0 })
                  }}
                  className="text-brand outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {t("skills.switchToAllInOne")}
                </button>
              </p>
            )}
          </>
        ) : (
          <SkillsSkeleton count={4} />
        )}
      </div>
    </WizardLayout>
  )
}

function scrollToCategory(categoryId: string) {
  document.getElementById(`category-${categoryId}`)?.scrollIntoView({ behavior: "smooth" })
}

/** Categories containing selected skills, plus the one requested via "Change" on Step 3. */
function initiallyExpanded(
  catalog: CategoryGroupData[],
  selections: WizardData["selections"],
  focusCategoryId: string | undefined,
) {
  const ids = new Set(Object.values(selections).map((s) => s.categoryId))
  if (focusCategoryId) ids.add(focusCategoryId)
  return catalog.flatMap((g) => g.categories.map((c) => c.id)).filter((id) => ids.has(id))
}
