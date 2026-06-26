import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { AuthRequiredPrompt } from "@/components/auth-required-prompt"
import {
  getVisibleLeaderboardMatchweeks,
  getOverallLeaderboardData,
  getPrivateLeagueLeaderboardData,
} from "@/lib/db"
import LeaderboardTabs from "@/components/leaderboard-tabs"
import { LeaderboardContextSwitcher } from "@/components/leaderboard-context-switcher"
import { LeagueCompetitionTabs } from "@/components/league-competition-tabs"
import { getSessionUser } from "@/lib/auth"
import {
  getPrivateLeagueById,
  getPrivateLeaguesForUser,
  isUserInPrivateLeague,
} from "@/lib/private-leagues"
import type { CompetitionCode } from "@/lib/competition-config"
import { canUseLeagues } from "@/lib/feature-access"

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { league?: string; competition?: string }
}) {
  const user = await getSessionUser()
  if (!user) {
    return (
      <AuthRequiredPrompt
        title="Rankings"
        description="World and private league standings"
        returnTo="/leaderboard"
      />
    )
  }

  const leaguesEnabled = canUseLeagues(user)
  const leagues = leaguesEnabled ? await getPrivateLeaguesForUser(user.id) : []
  const leagueId = searchParams.league?.trim()

  if (leagueId) {
    if (!leaguesEnabled) {
      redirect("/leaderboard")
    }

    const league = await getPrivateLeagueById(leagueId)
    if (!league) notFound()

    const isMember = await isUserInPrivateLeague(user.id, league.id)
    if (!isMember) notFound()

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
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{league.name}</h1>
            <p className="text-muted-foreground">
              Private league · {league.members.length} member
              {league.members.length === 1 ? "" : "s"}
            </p>
          </div>
          <Suspense fallback={null}>
            <LeaderboardContextSwitcher leagues={leagues} currentLeagueId={league.id} />
          </Suspense>
        </div>

        <LeagueCompetitionTabs
          competitions={competitions}
          activeCompetition={activeCompetition}
          leagueId={league.id}
          context="leaderboard"
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

  const [visibleMatchweeks, overallData] = await Promise.all([
    getVisibleLeaderboardMatchweeks("PL"),
    getOverallLeaderboardData("PL", { includeAllUsers: true }),
  ])

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
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">World Rankings</h1>
          <p className="text-muted-foreground">Premier League season standings — all players</p>
        </div>
        {leaguesEnabled && leagues.length > 0 && (
          <Suspense fallback={null}>
            <LeaderboardContextSwitcher leagues={leagues} />
          </Suspense>
        )}
      </div>

      <LeaderboardTabs
        visibleMatchweeks={visibleMatchweeks}
        competition="PL"
        initialOverallData={initialOverallData}
      />
    </div>
  )
}
