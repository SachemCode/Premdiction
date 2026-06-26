import { AuthRequiredPrompt } from "@/components/auth-required-prompt"
import { getCurrentMatchweek, getMatchweekById } from "@/lib/matchweek"
import MatchweekPredictions from "@/components/matchweek-predictions"
import { getPredictionsByUserAndMatchweek } from "@/lib/db"
import type { Team } from "@/lib/types"
import { MatchweekHeader } from "@/components/game/matchweek-header"
import { getSessionUser } from "@/lib/auth"

export default async function PredictionsPage() {
  const user = await getSessionUser()
  if (!user) {
    return (
      <AuthRequiredPrompt
        title="Predictions"
        description="Make your predictions for upcoming matches"
        returnTo="/predictions"
      />
    )
  }

  const currentMatchweek = await getCurrentMatchweek("PL")

  if (!currentMatchweek) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Predictions</h1>
          <p className="text-muted-foreground">Make your predictions for upcoming matches</p>
        </div>
        <div className="game-card p-8 text-center text-muted-foreground">
          <p className="text-lg">No upcoming fixtures</p>
          <p className="text-sm mt-2">
            The current season may be complete, or fixtures are not synced yet.
          </p>
        </div>
      </div>
    )
  }

  const matchweekWithMatches = await getMatchweekById(currentMatchweek.id)
  if (!matchweekWithMatches) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Predictions</h1>
          <p className="text-muted-foreground text-sm md:text-base">Pick scores before kickoff</p>
        </div>
        <div className="game-card p-8 text-center text-muted-foreground">Matchweek not found</div>
      </div>
    )
  }

  const userPredictions = await getPredictionsByUserAndMatchweek(user.id, currentMatchweek.id)

  const matches = matchweekWithMatches.matches.filter(
    (m): m is typeof m & { homeTeam: Team; awayTeam: Team } =>
      m.homeTeam != null && m.awayTeam != null
  )

  const matchweekData = {
    id: matchweekWithMatches.id,
    number: matchweekWithMatches.number,
    status: matchweekWithMatches.status,
    startDate: matchweekWithMatches.startDate,
    matches,
    userPredictions: userPredictions.reduce(
      (acc, pred) => {
        acc[pred.matchId] = {
          homeScore: pred.homeScore,
          awayScore: pred.awayScore,
        }
        return acc
      },
      {} as Record<string, { homeScore: number; awayScore: number }>
    ),
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Predictions</h1>
        <p className="text-muted-foreground text-sm md:text-base">Pick scores before kickoff</p>
      </div>

      <MatchweekHeader matchweek={currentMatchweek} competition="PL" />

      <MatchweekPredictions matchweekData={matchweekData} showPointers readOnly={!user.isAdmin} />
    </div>
  )
}
