import { AuthRequiredPrompt } from "@/components/auth-required-prompt"
import { getVisibleLeaderboardMatchweeks, getOverallLeaderboardData } from "@/lib/db"
import LeaderboardTabs from "@/components/leaderboard-tabs"
import { getSessionUser } from "@/lib/auth"

const COMPETITION = "WC" as const

export default async function WorldCupLeaderboardPage() {
  const user = await getSessionUser()
  if (!user) {
    return (
      <AuthRequiredPrompt
        title="Event Leaderboard"
        description="World Cup 2026 knockout standings"
        returnTo="/events/world-cup/leaderboard"
      />
    )
  }

  const [visibleMatchweeks, overallData] = await Promise.all([
    getVisibleLeaderboardMatchweeks(COMPETITION),
    getOverallLeaderboardData(COMPETITION),
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
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Event Leaderboard</h1>
        <p className="text-green-950/70 dark:text-green-100/70">World Cup 2026 knockout standings</p>
      </div>

      <div className="wc-event-card p-4 md:p-6">
        <LeaderboardTabs
          visibleMatchweeks={visibleMatchweeks}
          competition={COMPETITION}
          initialOverallData={initialOverallData}
        />
      </div>
    </div>
  )
}
