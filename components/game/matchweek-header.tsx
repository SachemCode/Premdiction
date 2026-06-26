import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import type { Matchweek } from "@/lib/types"
import { formatDateDDMMYYYY } from "@/lib/date-format"
import { getKnockoutRoundName, isKnockoutCompetition, type CompetitionCode } from "@/lib/competition-config"

type MatchweekHeaderProps = {
  matchweek: Pick<Matchweek, "number" | "startDate" | "endDate" | "status" | "label">
  subtitle?: string
  competition?: CompetitionCode
}

export function MatchweekHeader({ matchweek, subtitle, competition = "PL" }: MatchweekHeaderProps) {
  const statusLabel =
    matchweek.status === "active"
      ? "Live"
      : matchweek.status === "completed"
        ? "Completed"
        : "Upcoming"

  const isKnockout = isKnockoutCompetition(competition)
  const title = isKnockout
    ? getKnockoutRoundName(matchweek)
    : `Matchweek ${matchweek.number}`

  return (
    <div className="game-surface rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-pl-purple/10 flex items-center justify-center shrink-0">
          <Calendar className="h-5 w-5 text-pl-purple" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {formatDateDDMMYYYY(matchweek.startDate)} –{" "}
            {formatDateDDMMYYYY(matchweek.endDate)}
          </p>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
      <Badge
        variant={
          matchweek.status === "active"
            ? "default"
            : matchweek.status === "completed"
              ? "secondary"
              : "outline"
        }
        className="w-fit capitalize"
      >
        {statusLabel}
      </Badge>
    </div>
  )
}
