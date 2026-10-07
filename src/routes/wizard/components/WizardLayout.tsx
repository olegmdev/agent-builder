import { cn } from "cn"
import { StepHeader } from "./StepHeader"

interface WizardLayoutProps {
  step: number
  title: React.ReactNode
  subtitle?: React.ReactNode
  aside: React.ReactNode
  footer: React.ReactNode
  /**
   * Size the aside to the main column instead of the other way round. The aside is taken out of
   * flow, so only the main column sets the row height and the aside stretches (up to its cap) to
   * match it, ending level with the column's last item.
   * Desktop only: below `lg` such an aside is decorative and hidden.
   */
  fitScreen?: boolean
  children: React.ReactNode
}

export function WizardLayout({
  step,
  title,
  subtitle,
  aside,
  footer,
  fitScreen = false,
  children,
}: WizardLayoutProps) {
  return (
    <>
      <main
        className={cn(
          "mx-auto grid w-full max-w-page flex-1 grid-cols-1 content-start gap-10 lg:grid-cols-[580fr_548fr] lg:gap-12",
          !fitScreen && "items-start",
        )}
      >
        <section className="flex min-w-0 flex-col">
          <StepHeader step={step} title={title} subtitle={subtitle} />
          {children}
        </section>
        {fitScreen ? (
          <aside className="relative max-h-159 min-w-0 max-lg:hidden">
            <div className="absolute inset-0">{aside}</div>
          </aside>
        ) : (
          <aside className="min-w-0 lg:sticky lg:top-6">{aside}</aside>
        )}
      </main>
      {footer}
    </>
  )
}
