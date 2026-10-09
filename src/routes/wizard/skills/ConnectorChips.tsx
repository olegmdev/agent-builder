import { cn } from "cn"
import { PlusIcon, XIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { Connector } from "@/api/schemas"
import { connectorIcon } from "./connectorIcons"

interface ConnectorChipsProps {
  connectors: Connector[]
  selectedIds: string[]
  onToggle: (connectorId: string) => void
}

export function ConnectorChips({ connectors, selectedIds, onToggle }: ConnectorChipsProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap gap-2">
      {connectors.map((connector) => {
        const selected = selectedIds.includes(connector.id)
        const Icon = connectorIcon(connector.id)
        return (
          <button
            key={connector.id}
            type="button"
            aria-pressed={selected}
            aria-label={t(selected ? "skills.connectorRemove" : "skills.connectorAdd", {
              name: connector.name,
            })}
            onClick={() => onToggle(connector.id)}
            className={cn(
              "flex h-8 items-center gap-2 border px-3 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              selected
                ? "border-brand bg-brand text-brand-foreground hover:bg-brand-hover"
                : "border-brand bg-background text-brand hover:bg-brand-tint",
            )}
          >
            <Icon aria-hidden className="size-4 shrink-0" />
            {connector.name}
            {selected ? <XIcon className="size-4" /> : <PlusIcon className="size-4" />}
          </button>
        )
      })}
    </div>
  )
}
