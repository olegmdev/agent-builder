import { AlarmClockIcon, ArrowRightIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { ButtonLink } from "@/components/common/ButtonLink"
import { FloatingBadge } from "@/components/common/FloatingBadge"
import { LoopVideo } from "@/components/common/LoopVideo"
import { HERO_BADGES } from "./heroBadges"

export default function Landing() {
  const { t } = useTranslation()
  return (
    /*
     * On desktop the hero grows to its full height first; spare height then goes to the spacer
     * below it, so on tall viewports it stays near the header instead of sinking below centre.
     * Without spare height the spacer is 0 and the hero shrinks.
     */
    <main className="mx-auto flex w-full max-w-page flex-1 flex-col pb-12 lg:after:grow lg:after:content-['']">
      <div className="grid grid-cols-1 gap-10 lg:max-h-140 lg:flex-[1000_1_0%] lg:grid-cols-[580fr_548fr] lg:items-center lg:gap-12">
        <section className="flex flex-col items-start justify-center">
          <p className="flex items-center gap-2.5 bg-brand-tint px-4 py-3 text-sm text-brand sm:text-base">
            <AlarmClockIcon className="size-5 shrink-0" />
            {t("landing.badge")}
          </p>
          <h1 className="mt-8 text-[2rem] leading-[1.1] tracking-tight text-ink sm:mt-10 sm:text-[2.75rem]">
            <span className="text-brand">{t("landing.titleAccent")}</span>
            {t("landing.titleRest")}
          </h1>
          <p className="mt-6 max-w-[29rem] text-base text-ink-muted">{t("landing.subtitle")}</p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <ButtonLink size="xl" to="/goal">
              {t("landing.getEstimate")}
              <ArrowRightIcon />
            </ButtonLink>
            <ButtonLink variant="brand" size="xl" to="/quick">
              {t("landing.quickRequest")}
            </ButtonLink>
          </div>
        </section>
        {/*
         * Takes the height the text column sets (see LoopVideo); hidden on phones. On desktop the
         * frame is at most Figma's 548 × 560 (the hero's max height) and centred against the text
         * column by the grid. The badges start at the stage's top edge but the robot's feet end
         * ~12% above its bottom, so nudge it down 10% to centre what is visible.
         */}
        <LoopVideo
          name="animation_assets/home"
          media="(width >= 48rem)"
          className="h-120 max-md:hidden lg:h-full lg:min-h-96 lg:translate-y-[10%]"
        >
          {HERO_BADGES.map((badge) => (
            <FloatingBadge
              key={badge.id}
              tone={badge.tone}
              size={badge.size}
              float={badge.float}
              className={badge.className}
            >
              {t(`landing.heroBadges.${badge.id}`)}
            </FloatingBadge>
          ))}
        </LoopVideo>
      </div>
    </main>
  )
}
