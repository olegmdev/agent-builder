import { Trans, useTranslation } from "react-i18next"

import logoSrc from "/logo.svg"

/**
 * The logo leaves the app for the company site, so it is a plain anchor rather than a
 * router link. Same tab, which means a visitor mid-wizard loses their answers.
 */
export function Logo() {
  const { t } = useTranslation()
  return (
    <a
      href="https://www.incode-group.com/"
      className="flex shrink-0 items-center gap-5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <img src={logoSrc} alt={t("header.logoAlt")} className="h-8 sm:h-14" />
      {/* The product name needs room the phone header doesn't have. */}
      <span aria-hidden className="h-12 w-px bg-line max-md:hidden" />
      <span className="flex flex-col text-base leading-6 text-ink max-md:hidden">
        <span>{t("header.productLine1")}</span>
        <span>
          <Trans i18nKey="header.productLine2" components={{ strong: <strong /> }} />
        </span>
      </span>
    </a>
  )
}
