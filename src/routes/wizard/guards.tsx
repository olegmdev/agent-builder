import { LocaleNavigate } from "@/locale/links"
import { hasSelectionsForGoal } from "@/store/selectors"
import { useWizardStore } from "@/store/wizard"

export function RequireGoal({ children }: { children: React.ReactNode }) {
  const goalId = useWizardStore((s) => s.goalId)
  return goalId ? children : <LocaleNavigate to="/goal" replace />
}

/** Also covers removing the last category from the Step 3 summary (plan §13.4). */
export function RequireSkills({ children }: { children: React.ReactNode }) {
  const ok = useWizardStore(hasSelectionsForGoal)
  return ok ? children : <LocaleNavigate to="/skills" replace />
}

export interface SkillsLocationState {
  focusCategoryId?: string
}
