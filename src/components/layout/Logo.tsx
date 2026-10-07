import { Trans, useTranslation } from "react-i18next"
import { LocaleLink } from "@/locale/links"

import logoSrc from "/logo.svg"

const FOCUS_RING = "rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"

/**
 * Two destinations in one header block: the company mark leaves for incode-group.com, the
 * product name goes to this app's own landing page. The divider belongs to neither, so it
 * stays outside both links.
 */
export function Logo() {
  const { t } = useTranslation()
  return (
    <div className="flex shrink-0 items-center gap-5">
      <a href="https://www.incode-group.com/" className={`flex shrink-0 ${FOCUS_RING}`}>
        <img src={logoSrc} alt={t("header.logoAlt")} className="h-8 sm:h-14" />
      </a>
      {/* The product name needs room the phone header doesn't have. */}
      <span aria-hidden className="h-12 w-px bg-line max-md:hidden" />
      <LocaleLink
        to="/"
        className={`flex flex-col text-base leading-6 text-ink max-md:hidden ${FOCUS_RING}`}
      >
        <span>{t("header.productLine1")}</span>
        <span>
          <Trans i18nKey="header.productLine2" components={{ strong: <strong /> }} />
        </span>
      </LocaleLink>
    </div>
  )
}
