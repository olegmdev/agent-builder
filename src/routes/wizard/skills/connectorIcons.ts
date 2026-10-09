import { PlugIcon } from "lucide-react"
import type { ComponentType, SVGProps } from "react"
import FirecrawlIcon from "~icons/logos/firecrawl-icon"
import GitHubIcon from "~icons/logos/github-icon"
import GitLabIcon from "~icons/logos/gitlab"
import GmailIcon from "~icons/logos/google-gmail"
import GoogleCalendarIcon from "~icons/logos/google-calendar"
import GoogleDriveIcon from "~icons/logos/google-drive"
import NotionIcon from "~icons/logos/notion-icon"
import OutlookIcon from "~icons/vscode-icons/file-type-outlook"
import PdfIcon from "~icons/vscode-icons/file-type-pdf2"

type Icon = ComponentType<SVGProps<SVGSVGElement>>

/** Brand logos by connector ID. Connectors come from the API, so IDs without a logo fall back. */
const ICONS: Record<string, Icon> = {
  firecrawl: FirecrawlIcon,
  github: GitHubIcon,
  gitlab: GitLabIcon,
  gmail: GmailIcon,
  google_calendar: GoogleCalendarIcon,
  google_drive: GoogleDriveIcon,
  google_sheets: GoogleDriveIcon,
  notion: NotionIcon,
  outlook: OutlookIcon,
  pdf: PdfIcon,
}

export const connectorIcon = (connectorId: string): Icon => ICONS[connectorId] ?? PlugIcon
