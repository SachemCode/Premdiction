import { AuthRequiredPrompt } from "@/components/auth-required-prompt"
import { getVisibleLeaderboardMatchweeks, getOverallLeaderboardData } from "@/lib/db"
import LeaderboardTabs from "@/components/leaderboard-tabs"
import { getSessionUser } from "@/lib/auth"

export default async function LeaderboardPage() {
  const user = await getSessionUser()
  if (!user) {
    return (
      <AuthRequiredPrompt
        title="Leaderboard"
        description="Premier League season standings"
        returnTo="/leaderboard"
      />
    )
  }

  const [visibleMatchweeks, overallData] = await Promise.all([
    getVisibleLeaderboardMatchweeks("PL"),
    getOverallLeaderboardData("PL"),
  ])

  const initialOverallData = {
    matchweeks: overallData.matchweeks,
    leaderboards: overallData.leaderboards,
    teams: Object.fromEntries(
      Object.entries(overallData.teams).filter(([, team]) => team != null).map(([id, team]) => [
        id,
        { id: team!.id, name: team!.name, logo: team!.logo },
      ])
    ),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">Premier League season standings</p>
      </div>

      <LeaderboardTabs
        visibleMatchweeks={visibleMatchweeks}
        competition="PL"
        initialOverallData={initialOverallData}
      />
    </div>
  )
}
