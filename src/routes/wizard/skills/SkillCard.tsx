import { cn } from "cn"
import { InfoIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { Skill } from "@/api/schemas"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useWizardActions, useWizardStore } from "@/store/wizard"
import { ConnectorChips } from "./ConnectorChips"

export function SkillCard({ skill, categoryId }: { skill: Skill; categoryId: string }) {
  const { t } = useTranslation()
  const selection = useWizardStore((s) => s.selections[skill.id])
  const { toggleSkill, toggleConnector } = useWizardActions()
  const checked = Boolean(selection)

  return (
    <li
      className={cn(
        "border px-4 py-4 transition-colors",
        checked
          ? "border-2 border-brand bg-brand-tint px-[15px] py-[15px]"
          : "border-line hover:border-brand",
      )}
    >
      <label className="flex cursor-pointer items-start gap-3 text-base text-ink">
        <Checkbox
          checked={checked}
          onCheckedChange={() => toggleSkill(skill, categoryId)}
          className="mt-0.5 size-4.5 border-2 border-border-grey bg-background data-checked:border-brand data-checked:bg-background data-checked:text-brand"
        />
        <span>{skill.title}</span>
      </label>

      {checked && skill.availableConnectors.length > 0 && (
        <div className="mt-2 flex flex-col gap-3 pl-7">
          <div className="flex items-center gap-1.5 text-sm text-ink-muted">
            {t("skills.connectTo")}
            <Tooltip>
              <TooltipTrigger
                aria-label={t("skills.connectToInfo")}
                className="text-brand outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <InfoIcon className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" alignOffset={-16} sideOffset={8}>
                {t("skills.connectToInfo")}
              </TooltipContent>
            </Tooltip>
          </div>
          <ConnectorChips
            connectors={skill.availableConnectors}
            selectedIds={selection?.connectorIds ?? []}
            onToggle={(connectorId) => toggleConnector(skill.id, connectorId)}
          />
        </div>
      )}
    </li>
  )
}
