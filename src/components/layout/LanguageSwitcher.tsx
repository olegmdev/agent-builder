import { ChevronDownIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { LOCALES, localeSchema } from "@/api/schemas"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LOCALE_LABEL } from "@/locale/routing"
import { useLocale } from "@/locale/useLocale"

export function LanguageSwitcher() {
  const { t } = useTranslation()
  const { locale, setLocale } = useLocale()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("header.language")}
        className="flex h-10 items-center gap-1.5 px-2 text-base text-ink outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {LOCALE_LABEL[locale]}
        <ChevronDownIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-40">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => setLocale(localeSchema.parse(value))}
        >
          {LOCALES.map((code) => (
            <DropdownMenuRadioItem key={code} value={code} lang={code} closeOnClick>
              <span className="w-6">{LOCALE_LABEL[code]}</span>
              {t(`languages.${code}`)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
