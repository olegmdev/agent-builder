import type { VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Link, type LinkProps } from "react-router"
import { useLocalePath } from "@/locale/navigation"
import { buttonVariants } from "@/components/ui/button"

/**
 * A navigation link styled as a button. Base UI's `<Button render={<Link />}>` would expose the
 * link as role="button", so links keep their native semantics here.
 *
 * `disabled` keeps the link in place but inert: no navigation, out of the tab order.
 */
export function ButtonLink({
  className,
  variant,
  size,
  disabled,
  onClick,
  ...props
}: LinkProps & VariantProps<typeof buttonVariants> & { disabled?: boolean }) {
  const localePath = useLocalePath()
  return (
    <Link
      className={cn(
        buttonVariants({ variant, size }),
        "aria-disabled:pointer-events-none aria-disabled:opacity-50",
        className,
      )}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      onClick={(event) => {
        if (disabled) event.preventDefault()
        else onClick?.(event)
      }}
      {...props}
      to={typeof props.to === "string" ? localePath(props.to) : props.to}
    />
  )
}
