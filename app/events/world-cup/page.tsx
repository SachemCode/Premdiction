import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getCurrentMatchweek } from "@/lib/matchweek"
import { Trophy, Calendar, Info } from "lucide-react"
import { getKnockoutRoundName } from "@/lib/competition-config"
import { formatDateDDMMYYYY } from "@/lib/date-format"

export default async function WorldCupEventPage() {
  const currentRound = await getCurrentMatchweek("WC")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">World Cup 2026</h1>
        <p className="text-green-950/70 dark:text-green-100/70 mt-1">
          Knockout stage predictions — Round of 32 through the Final
        </p>
      </div>

      {currentRound && (
        <div className="wc-event-card p-5 flex items-start gap-3">
          <Calendar className="h-5 w-5 text-green-900 dark:text-amber-300 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{getKnockoutRoundName(currentRound)}</p>
            <p className="text-sm text-green-950/70 dark:text-green-100/70">
              {formatDateDDMMYYYY(currentRound.startDate)} –{" "}
              {formatDateDDMMYYYY(currentRound.endDate)}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="wc-btn-primary min-h-11">
          <Link href="/events/world-cup/predictions">
            <Calendar className="mr-2 h-4 w-4" />
            Make predictions
          </Link>
        </Button>
        <Button asChild variant="outline" className="wc-btn-outline min-h-11">
          <Link href="/events/world-cup/leaderboard">
            <Trophy className="mr-2 h-4 w-4" />
            Event leaderboard
          </Link>
        </Button>
        <Button asChild variant="ghost" className="min-h-11 text-green-950/80 hover:text-green-950 hover:bg-green-900/10 dark:text-green-100/80 dark:hover:text-green-50 dark:hover:bg-green-900/30">
          <Link href="/info">
            <Info className="mr-2 h-4 w-4" />
            Scoring rules
          </Link>
        </Button>
      </div>
    </div>
  )
}
