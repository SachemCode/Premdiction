/**
 * Recalculates stored prediction points for all finished matches
 * using the current scoring formula in lib/prediction-points.ts.
 *
 * Run after changing EXACT_SCORE_POINTS or CORRECT_RESULT_POINTS:
 *   pnpm tsx scripts/recalculate-all-points.ts
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import { prisma } from "../lib/prisma-client"
import { recalculatePredictionPointsForMatch } from "../lib/predictions"

async function main() {
  const matches = await prisma.match.findMany({
    where: {
      homeScore: { not: null },
      awayScore: { not: null },
    },
    select: {
      id: true,
      homeScore: true,
      awayScore: true,
    },
  })

  console.log(`Recalculating points for ${matches.length} finished match(es)...`)

  let updated = 0
  for (const match of matches) {
    if (match.homeScore == null || match.awayScore == null) continue
    await recalculatePredictionPointsForMatch(match.id, match.homeScore, match.awayScore)
    updated++
  }

  console.log(`Done. Recalculated predictions for ${updated} match(es).`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
