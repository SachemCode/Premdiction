import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { AuthRequiredPrompt } from "@/components/auth-required-prompt"
import LeaderboardTabs from "@/components/leaderboard-tabs"
import { LeagueInviteCard } from "@/components/league-invite-card"
import { LeagueCompetitionSettings } from "@/components/league-competition-settings"
import { LeagueCompetitionTabs } from "@/components/league-competition-tabs"
import { Button } from "@/components/ui/button"
import { getSessionUser } from "@/lib/auth"
import { getPrivateLeagueById } from "@/lib/private-leagues"
import { getPrivateLeagueLeaderboardData } from "@/lib/db"
import { isWcEventEnabled, type CompetitionCode } from "@/lib/competition-config"
import { isUserInPrivateLeague } from "@/lib/private-leagues"
import { ArrowLeft } from "lucide-react"

export default async function LeagueDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { competition?: string }
}) {
  const user = await getSessionUser()
  if (!user) {
    return (
      <AuthRequiredPrompt
        title="League"
        description="Sign in to view this league"
        returnTo={`/leagues/${params.id}`}
      />
    )
  }

  const league = await getPrivateLeagueById(params.id)
  if (!league) notFound()

  const isMember = await isUserInPrivateLeague(user.id, league.id)
  if (!isMember) {
    redirect(`/join/${league.inviteCode}`)
  }

  const competitions = league.competitions
    .map((c) => c.competition)
    .filter((c): c is CompetitionCode => c === "PL" || c === "WC")

  const requestedComp = searchParams.competition
  const activeCompetition: CompetitionCode =
    requestedComp === "WC" && competitions.includes("WC")
      ? "WC"
      : requestedComp === "PL" && competitions.includes("PL")
        ? "PL"
        : competitions[0] ?? "PL"

  const overallData = await getPrivateLeagueLeaderboardData(league.id, activeCompetition)
  const memberRole = league.members.find((m) => m.userId === user.id)?.role ?? "member"

  const initialOverallData = {
    matchweeks: overallData.matchweeks,
    leaderboards: overallData.leaderboards,
    teams: Object.fromEntries(
      Object.entries(overallData.teams)
        .filter(([, team]) => team != null)
        .map(([id, team]) => [id, { id: team!.id, name: team!.name, logo: team!.logo }])
    ),
  }

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="shrink-0 mt-0.5" asChild>
          <Link href="/leagues">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">{league.name}</h1>
          <p className="text-muted-foreground text-sm">
            {league.members.length} member{league.members.length === 1 ? "" : "s"} · Private league
          </p>
        </div>
      </div>

      <LeagueInviteCard inviteCode={league.inviteCode} />

      <LeagueCompetitionSettings
        leagueId={league.id}
        initialCompetitions={competitions}
        wcEventEnabled={isWcEventEnabled()}
        canEdit={memberRole === "owner" || memberRole === "admin"}
      />

      <LeagueCompetitionTabs
        competitions={competitions}
        activeCompetition={activeCompetition}
        leagueId={league.id}
      />

      <LeaderboardTabs
        visibleMatchweeks={overallData.visibleMatchweeks}
        competition={activeCompetition}
        initialOverallData={initialOverallData}
        privateLeagueId={league.id}
      />
    </div>
  )
}
