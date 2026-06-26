import { prisma } from "@/lib/prisma-client"
import { calculatePredictionPoints } from "./prediction-points"

export async function recalculatePredictionPointsForMatch(
  matchId: string,
  homeScore: number,
  awayScore: number
) {
  const related = await prisma.prediction.findMany({ where: { matchId } })
  for (const prediction of related) {
    const points = calculatePredictionPoints(
      prediction.homeScore,
      prediction.awayScore,
      homeScore,
      awayScore
    )
    await prisma.prediction.update({
      where: { id: prediction.id },
      data: { points },
    })
  }
}
