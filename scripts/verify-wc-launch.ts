/**
 * Verifies WC launch prerequisites: schema and prediction persistence.
 * Run after: pnpm prisma migrate deploy
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import { prisma } from "../lib/prisma-client"
import { COMPETITIONS } from "../lib/competition-config"
import { calculatePredictionPoints, EXACT_SCORE_POINTS } from "../lib/prediction-points"

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}`
}

async function main() {
  const code: "WC" = "WC"
  console.log(`Active competition: ${code}`)

  await prisma.prediction.count()
  console.log("Predictions table accessible")

  const stageColumn = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'matches' AND column_name = 'stage'
  `
  if (stageColumn.length === 0) {
    throw new Error("matches.stage column missing — run: pnpm prisma migrate deploy")
  }

  const points = calculatePredictionPoints(2, 1, 2, 1)
  if (points !== EXACT_SCORE_POINTS) throw new Error("Scoring logic failed")
  console.log("Scoring logic OK")

  const testUserId = "verify_user_wc"
  const match = await prisma.match.findFirst({
    where: { matchweek: { competition: code } },
    orderBy: { kickoff: "asc" },
  })

  if (!match) {
    console.warn("No matches for active competition — run sync after setting WC env vars")
    return
  }

  const row = await prisma.prediction.upsert({
    where: { userId_matchId: { userId: testUserId, matchId: match.id } },
    create: {
      id: generateId("pred"),
      userId: testUserId,
      matchId: match.id,
      homeScore: 2,
      awayScore: 1,
      points: null,
    },
    update: { homeScore: 2, awayScore: 1, points: null },
  })

  const reloaded = await prisma.prediction.findUnique({
    where: { userId_matchId: { userId: testUserId, matchId: match.id } },
  })
  if (!reloaded || reloaded.homeScore !== 2) {
    throw new Error("Prediction persistence failed")
  }
  console.log("Prediction persistence OK (id:", row.id, ")")

  if (code === "WC") {
    const def = COMPETITIONS.WC
    const [roundCount, matchCount, activeRound] = await Promise.all([
      prisma.matchweek.count({ where: { competition: "WC" } }),
      prisma.match.count({ where: { matchweek: { competition: "WC" } } }),
      prisma.matchweek.findFirst({
        where: { competition: "WC", status: "active" },
        orderBy: { number: "asc" },
      }),
    ])
    console.log(`WC data: ${roundCount}/${def.expectedMatchweeks} rounds, ${matchCount}/${def.expectedMatches} matches`)
    if (activeRound) {
      console.log(`Active WC round: ${activeRound.label ?? `Round ${activeRound.number}`} (status: ${activeRound.status})`)
    } else {
      console.warn("No active WC round — activate Round of 32 in admin")
    }
  }

  await prisma.prediction.deleteMany({ where: { userId: testUserId } })
  console.log("Verification complete")
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
