/**
 * One-shot WC launch: db push, sync, activate Round of 32, verify prediction persistence.
 */
import { config } from "dotenv"
import { execSync } from "child_process"

config({ path: ".env.local" })

import { prisma } from "../lib/prisma-client"
import { COMPETITIONS } from "../lib/competition-config"

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}`
}

async function main() {
  console.log("1/5 Pushing schema...")
  execSync("pnpm prisma db push --accept-data-loss", { stdio: "inherit", env: process.env })

  console.log("\n2/5 Syncing teams...")
  execSync("pnpm sync:teams", { stdio: "inherit", env: process.env })

  console.log("\n3/5 Syncing fixtures...")
  execSync("pnpm sync:fixtures", { stdio: "inherit", env: process.env })

  const def = COMPETITIONS.WC
  const [roundCount, matchCount] = await Promise.all([
    prisma.matchweek.count({ where: { competition: "WC", season: 2026 } }),
    prisma.match.count({ where: { matchweek: { competition: "WC", season: 2026 } } }),
  ])
  console.log(`\n4/5 WC data: ${roundCount} rounds, ${matchCount} matches (expected ${def.expectedMatchweeks}/${def.expectedMatches})`)

  const round32 = await prisma.matchweek.findFirst({
    where: { competition: "WC", season: 2026, number: 1 },
    include: { matches: { select: { id: true } } },
  })
  if (!round32) {
    throw new Error("Round of 32 matchweek not found after sync")
  }

  console.log(`\n5/5 Activating ${round32.label ?? "Round 1"} (${round32.id})...`)
  const allRounds = await prisma.matchweek.findMany({
    where: { competition: "WC", season: 2026 },
  })
  for (const mw of allRounds) {
    if (mw.status === "active" && mw.id !== round32.id) {
      await prisma.matchweek.update({
        where: { id: mw.id },
        data: { status: "completed" },
      })
    }
  }
  await prisma.matchweek.update({
    where: { id: round32.id },
    data: { status: "active" },
  })

  const testUserId = "launch_check_user"
  const testMatch = round32.matches[0]
  if (testMatch) {
    await prisma.prediction.upsert({
      where: { userId_matchId: { userId: testUserId, matchId: testMatch.id } },
      create: {
        id: generateId("pred"),
        userId: testUserId,
        matchId: testMatch.id,
        homeScore: 1,
        awayScore: 0,
        points: null,
      },
      update: { homeScore: 1, awayScore: 0 },
    })
    const saved = await prisma.prediction.findUnique({
      where: { userId_matchId: { userId: testUserId, matchId: testMatch.id } },
    })
    if (!saved) throw new Error("Prediction persistence check failed")
    await prisma.prediction.delete({ where: { id: saved.id } })
    console.log("Prediction persistence check OK")
  }

  console.log("\nLaunch checklist complete.")
  console.log(`Active round: ${round32.label ?? "Round of 32"} · ${round32.matches.length} matches`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
