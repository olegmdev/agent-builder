import { Link, Navigate, type LinkProps, type NavigateProps } from "react-router"
import { useLocalePath } from "./navigation"

/** `Link`, pinned to the locale already in the URL. See `useLocalePath`. */
export function LocaleLink({ to, ...props }: LinkProps & { to: string }) {
  return <Link to={useLocalePath()(to)} {...props} />
}

/** `Navigate`, pinned to the locale already in the URL. See `useLocalePath`. */
export function LocaleNavigate({ to, ...props }: NavigateProps & { to: string }) {
  return <Navigate to={useLocalePath()(to)} {...props} />
}
