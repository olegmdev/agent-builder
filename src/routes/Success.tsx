import { ArrowRightIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { ButtonLink } from "@/components/common/ButtonLink"
import { LoopVideo } from "@/components/common/LoopVideo"

export default function Success() {
  const { t } = useTranslation()
  return (
    <main className="flex flex-1 flex-col items-center pt-8 pb-24 text-center sm:pt-6">
      {/* Takes only the height the text leaves (up to its cap); see LoopVideo. */}
      <LoopVideo name="animation_assets/thx" className="min-h-60 w-full flex-1 sm:max-h-120" />
      <h1 className="mt-9 text-[1.75rem] text-ink sm:text-[2rem]">{t("success.title")}</h1>
      <p className="mt-2 max-w-sm text-base text-ink-muted">{t("success.subtitle")}</p>
      {/* The wizard store is already reset by the time we land here, so /goal starts clean. */}
      <ButtonLink className="mt-8" size="xl" to="/goal">
        {t("success.buildAnother")}
        <ArrowRightIcon />
      </ButtonLink>
    </main>
  )
}
