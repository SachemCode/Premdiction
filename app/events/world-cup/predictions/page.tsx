import { AuthRequiredPrompt } from "@/components/auth-required-prompt"
import { getKnockoutBracket, getCurrentMatchweek } from "@/lib/matchweek"
import WcBracketPredictions from "@/components/wc-bracket-predictions"
import { getPredictionsByUserAndCompetition } from "@/lib/db"
import { getSessionUser } from "@/lib/auth"

const COMPETITION = "WC" as const

export default async function WorldCupPredictionsPage() {
  const user = await getSessionUser()
  if (!user) {
    return (
      <AuthRequiredPrompt
        title="Knockout"
        description="Pick 90-minute scores before kickoff"
        returnTo="/events/world-cup/predictions"
      />
    )
  }

  const [rounds, currentRound] = await Promise.all([
    getKnockoutBracket(COMPETITION),
    getCurrentMatchweek(COMPETITION),
  ])

  if (rounds.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Knockout</h1>
          <p className="text-green-950/80 dark:text-green-100/80 text-sm md:text-base">
            Pick 90-minute scores before kickoff
          </p>
        </div>
        <div className="wc-event-card p-8 text-center">
          <p className="text-lg">No knockout fixtures synced yet</p>
          <p className="text-sm mt-2 text-green-100/70">Run the WC fixture sync from admin when the schedule is ready.</p>
        </div>
      </div>
    )
  }

  const userPredictions = await getPredictionsByUserAndCompetition(user.id, COMPETITION)

  const userPredictionsMap = userPredictions.reduce(
    (acc, pred) => {
      acc[pred.matchId] = {
        homeScore: pred.homeScore,
        awayScore: pred.awayScore,
      }
      return acc
    },
    {} as Record<string, { homeScore: number; awayScore: number }>
  )

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Knockout</h1>
        <p className="text-green-950/80 dark:text-green-100/80 text-sm md:text-base">
          Tap a match to set your score and pointers — swipe to explore other rounds
        </p>
      </div>

      <WcBracketPredictions
        bracketData={{
          rounds: rounds.map((round) => ({
            id: round.id,
            number: round.number,
            status: round.status,
            startDate: round.startDate,
            roundName: round.roundName,
            matches: round.matches,
          })),
          userPredictions: userPredictionsMap,
          currentRoundId: currentRound?.id ?? rounds[0]?.id ?? null,
        }}
      />
    </div>
  )
}
