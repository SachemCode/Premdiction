import "server-only"
import { prisma } from "@/lib/prisma"
import { getCompetitionCodeFromContext, type CompetitionCode } from "@/lib/competition-config"
import {
  getMatchweeksFromDb,
  getMatchesFromDb,
  getPredictionMatchweekFromDb,
} from "@/lib/matchweeks"
import type { Matchweek } from "@/lib/types"

function buildMatchIdsByMatchweek(matches: { id: string; matchweekId: string }[]) {
  const map = new Map<string, string[]>()
  for (const match of matches) {
    const existing = map.get(match.matchweekId) ?? []
    existing.push(match.id)
    map.set(match.matchweekId, existing)
  }
  return map
}

export async function getVisibleLeaderboardMatchweeksUncached(
  competition?: CompetitionCode
): Promise<Matchweek[]> {
  const code = getCompetitionCodeFromContext(competition)
  const [matchweeks, currentMatchweek, allMatches] = await Promise.all([
    getMatchweeksFromDb(code),
    getPredictionMatchweekFromDb(code),
    getMatchesFromDb(code),
  ])

  const matchIdsByMatchweek = buildMatchIdsByMatchweek(allMatches)
  const allMatchIds = allMatches.map((m) => m.id)

  const matchweeksWithActivity = new Set<string>()
  if (allMatchIds.length > 0) {
    const predictions = await prisma.prediction.findMany({
      where: { matchId: { in: allMatchIds } },
      select: { matchId: true, points: true },
    })
    const matchIdToMatchweek = new Map(allMatches.map((m) => [m.id, m.matchweekId]))
    for (const pred of predictions) {
      const mwId = matchIdToMatchweek.get(pred.matchId)
      if (mwId) matchweeksWithActivity.add(mwId)
    }
  }

  const currentNumber = currentMatchweek?.number ?? Infinity
  const now = new Date()
  const visible: Matchweek[] = []

  for (const mw of matchweeks) {
    const matchIds = matchIdsByMatchweek.get(mw.id) ?? []
    const mwMatches = allMatches.filter((m) => m.matchweekId === mw.id)
    const hasActivity = matchweeksWithActivity.has(mw.id)
    const isCurrent = currentMatchweek?.id === mw.id
    const isCompleted = mw.status === "completed"
    const isActive = mw.status === "active"
    const seasonStarted = mwMatches.some(
      (m) => m.status === "completed" || m.status === "live" || m.kickoff <= now
    )
    const hasCompletedMatches = mwMatches.some((m) => m.status === "completed")

    if (mw.number > currentNumber && !hasActivity && !isCompleted) continue

    if (
      hasActivity ||
      isActive ||
      (isCompleted && hasCompletedMatches) ||
      (isCurrent && seasonStarted)
    ) {
      visible.push(mw)
    }
  }

  return visible
}
