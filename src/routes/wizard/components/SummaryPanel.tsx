import { cn } from "cn"
import { XIcon } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import type { CategoryGroup, Goal } from "@/api/schemas"
import { AppImage } from "@/components/common/AppImage"
import { Skeleton } from "@/components/common/Skeleton"
import { selectedByCategory, type SelectedCategory } from "@/store/selectors"
import { useWizardActions, useWizardStore } from "@/store/wizard"

interface SummaryPanelProps {
  goal: Goal | undefined
  catalog: CategoryGroup[] | undefined
  onChangeCategory: (categoryId: string) => void
  /** Locks "Change" and remove while a submit is in flight. */
  disabled?: boolean
}

export function SummaryPanel({ goal, catalog, onChangeCategory, disabled }: SummaryPanelProps) {
  const { t } = useTranslation()
  const selections = useWizardStore((s) => s.selections)
  const selected = catalog ? selectedByCategory(catalog, selections) : []

  return (
    <div
      className="flex flex-col bg-thumbnail p-5 sm:p-8 lg:min-h-159"
      aria-label={t("summary.willDo")}
    >
      {goal ? (
        <div className="flex items-start gap-4">
          <AppImage
            src={goal.thumbnail}
            className="size-14 shrink-0 sm:size-20"
            imgClassName="h-16 w-auto max-h-full max-w-full"
          />
          <div className="flex min-w-0 flex-col gap-2">
            <h2 className="text-xl leading-tight text-ink sm:text-[1.75rem]">{goal.title}</h2>
            <p className="text-base text-ink-muted">{goal.description}</p>
          </div>
        </div>
      ) : (
        <Skeleton className="h-20 w-full" />
      )}

      <h3 className="mt-4 text-xl text-ink sm:mt-7">{t("summary.willDo")}</h3>
      <ul className="mt-5 flex flex-col">
        {selected.map((item) => (
          <SummaryCategory
            key={item.category.id}
            item={item}
            onChange={() => onChangeCategory(item.category.id)}
            disabled={disabled}
          />
        ))}
      </ul>

      <p className="mt-auto pt-8 text-sm text-ink-muted sm:pt-10">{t("summary.footer")}</p>
    </div>
  )
}

function SummaryCategory({
  item,
  onChange,
  disabled,
}: {
  item: SelectedCategory
  onChange: () => void
  disabled?: boolean
}) {
  const { t } = useTranslation()
  const { clearCategory } = useWizardActions()
  const [expanded, setExpanded] = useState(true)
  const listId = `summary-${item.category.id}`
  const linkClass =
    "text-brand outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"

  return (
    <li className="border-b border-line pb-4 not-first:pt-4">
      <div className="flex items-start justify-between gap-4">
        <h4 className="text-base text-ink">{item.category.title}</h4>
        <button
          type="button"
          aria-label={t("summary.remove", { title: item.category.title })}
          onClick={() => clearCategory(item.category.id)}
          disabled={disabled}
          className="text-ink outline-none hover:text-brand focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
        >
          <XIcon className="size-5" />
        </button>
      </div>
      <div className="mt-1 flex items-center gap-2 text-sm text-ink-muted">
        <span>{t("summary.selectedCount", { count: item.skills.length })}</span>
        <button
          type="button"
          onClick={onChange}
          disabled={disabled}
          className={cn(
            linkClass,
            "disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          )}
        >
          {t("summary.change")}
        </button>
        <span aria-hidden className="h-3 w-px bg-line" />
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((v) => !v)}
          className={cn(linkClass, "cursor-pointer")}
        >
          {expanded ? t("summary.hide") : t("summary.show")}
        </button>
      </div>
      {expanded && (
        <ul id={listId} className="mt-4 flex list-disc flex-col gap-1 pl-5 text-sm text-ink">
          {item.skills.map((skill) => (
            <li key={skill.id} className="text-sm">
              {skill.title}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
