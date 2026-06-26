import { getMatchweeks, getMatches } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, AlertTriangle } from "lucide-react"
import MatchweekLauncher from "@/components/MatchweekLauncher"
import { SyncFixturesButton } from "@/components/admin/sync-fixtures-button"
import { getSeasonSyncExpectations } from "@/lib/competition"
import {
  getCompetitionDisplayName,
  isKnockoutCompetition,
  type CompetitionCode,
} from "@/lib/competition-config"
import { cn } from "@/lib/utils"

function parseCompetition(value?: string): CompetitionCode {
  return value === "WC" ? "WC" : "PL"
}

export default async function MatchweeksPage({
  searchParams,
}: {
  searchParams: Promise<{ competition?: string }>
}) {
  const params = await searchParams
  const competition = parseCompetition(params.competition)

  const matchweeks = await getMatchweeks(competition)
  const allMatches = await getMatches(competition)
  const { matchweeks: expectedMatchweeks, matches: expectedMatches } =
    getSeasonSyncExpectations(competition)
  const isKnockout = isKnockoutCompetition(competition)
  const competitionName = getCompetitionDisplayName(competition)
  const roundUnit = isKnockout ? "rounds" : "matchweeks"
  const firstMatchweekId = matchweeks[0]?.id || null
  const firstMatchweekMatches = firstMatchweekId
    ? allMatches.filter((m) => m.matchweekId === firstMatchweekId)
    : []

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          asChild
          variant={competition === "PL" ? "default" : "outline"}
          size="sm"
          className={cn(competition === "PL" && "bg-pl-purple hover:bg-pl-purple/90")}
        >
          <Link href="/admin/matchweeks?competition=PL">Premier League</Link>
        </Button>
        <Button
          asChild
          variant={competition === "WC" ? "default" : "outline"}
          size="sm"
          className={cn(competition === "WC" && "bg-pl-cyan hover:bg-pl-cyan/90")}
        >
          <Link href="/admin/matchweeks?competition=WC">World Cup event</Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isKnockout ? "Manage WC Rounds" : "Manage Matchweeks"}
          </h1>
          <p className="text-muted-foreground">
            {competitionName}: {matchweeks.length} / {expectedMatchweeks} {roundUnit} ·{" "}
            {allMatches.length} / {expectedMatches} matches synced
          </p>
          {(matchweeks.length !== expectedMatchweeks || allMatches.length !== expectedMatches) && (
            <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Re-run fixture sync when the full {competitionName} schedule is on football-data.org.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <SyncFixturesButton competition={competition} />
          <Button asChild className="bg-pl-purple hover:bg-pl-purple/90 text-white">
            <Link href="/admin/matchweeks/new">
              <Plus className="mr-2 h-4 w-4" />
              {isKnockout ? "Add Round" : "Add Matchweek"}
            </Link>
          </Button>
        </div>
      </div>

      {matchweeks.length > 0 && (
        <MatchweekLauncher
          matchweeks={matchweeks}
          initialMatches={firstMatchweekMatches}
          competition={competition}
        />
      )}

      <div className="grid gap-4">
        {matchweeks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>
                No {roundUnit} yet. Sync {competitionName} fixtures to import the schedule.
              </p>
            </CardContent>
          </Card>
        ) : (
          matchweeks.map((matchweek) => {
            const mwMatches = allMatches.filter((m) => m.matchweekId === matchweek.id)
            const title =
              isKnockout && matchweek.label
                ? matchweek.label
                : `Matchweek ${matchweek.number}`
            return (
              <Card key={matchweek.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {title}
                    </CardTitle>
                    <CardDescription>
                      {new Date(matchweek.startDate).toLocaleDateString()} -{" "}
                      {new Date(matchweek.endDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      matchweek.status === "active"
                        ? "default"
                        : matchweek.status === "completed"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {matchweek.status.charAt(0).toUpperCase() + matchweek.status.slice(1)}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{mwMatches.length} matches</p>
                      <p className="text-sm text-muted-foreground">
                        {mwMatches.filter((m) => m.status === "completed").length} completed,{" "}
                        {mwMatches.filter((m) => m.status === "scheduled").length} upcoming
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/matches?matchweek=${matchweek.id}`}>View Matches</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
