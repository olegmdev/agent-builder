import { ArrowRightIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { AppImage } from "@/components/common/AppImage"
import { ButtonLink } from "@/components/common/ButtonLink"

export default function Success() {
  const { t } = useTranslation()
  return (
    <main className="flex flex-1 flex-col items-center pt-8 pb-24 text-center sm:pt-6">
      {/* Out of flow, so the image takes only the height the text leaves (up to its cap). */}
      <AppImage
        src="common/thank_you.jpg"
        className="relative min-h-60 w-full flex-1 sm:max-h-120"
        imgClassName="absolute inset-0"
      />
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
