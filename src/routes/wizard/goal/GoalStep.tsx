import { useQueryClient } from "@tanstack/react-query"
import { ArrowRightIcon } from "lucide-react"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { categoriesQuery, useGoals } from "@/api/queries"
import { ErrorState } from "@/components/common/ErrorState"
import { Skeleton } from "@/components/common/Skeleton"
import { GoalCard } from "./GoalCard"
import { GoalPreview } from "./GoalPreview"
import { ButtonLink } from "@/components/common/ButtonLink"
import { WizardFooter } from "@/routes/wizard/components/WizardFooter"
import { WizardLayout } from "@/routes/wizard/components/WizardLayout"
import { useLocale } from "@/locale/useLocale"
import { useWizardActions, useWizardStore } from "@/store/wizard"

export default function GoalStep() {
  const { t } = useTranslation()
  const goals = useGoals()
  const goalId = useWizardStore((s) => s.goalId)
  const { locale } = useLocale()
  const { setGoal } = useWizardActions()
  const queryClient = useQueryClient()
  const selectedGoal = goals.data?.find((g) => g.id === goalId)

  // Warm Step 2's catalog so the skeleton there is rarely seen.
  useEffect(() => {
    if (goalId) void queryClient.prefetchQuery(categoriesQuery(goalId, locale))
  }, [goalId, locale, queryClient])

  return (
    <WizardLayout
      step={1}
      fitScreen
      title={t("goal.title")}
      subtitle={t("goal.subtitle")}
      aside={<GoalPreview goal={selectedGoal} />}
      footer={
        <WizardFooter
          next={
            <ButtonLink size="xl" to="/skills">
              {t("goal.next")}
              <ArrowRightIcon />
            </ButtonLink>
          }
        />
      }
    >
      <div
        role="radiogroup"
        aria-label={t("goal.title")}
        className="mt-8 flex flex-col gap-4 sm:gap-6 lg:mt-14 short:mt-12 short:gap-4"
      >
        {goals.isError ? (
          <ErrorState onRetry={() => void goals.refetch()} />
        ) : goals.data ? (
          goals.data.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              checked={goal.id === goalId}
              onSelect={() => setGoal(goal.id)}
            />
          ))
        ) : (
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full" />)
        )}
      </div>
    </WizardLayout>
  )
}
