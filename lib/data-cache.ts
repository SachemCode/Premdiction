import "server-only"
import { revalidateTag, unstable_cache } from "next/cache"
import {
  getCompetitionCodeFromContext,
  type CompetitionCode,
} from "@/lib/competition-config"
import { getTeamsFromDb } from "@/lib/teams"
import {
  getMatchweeksFromDb,
  getMatchesFromDb,
  getPredictionMatchweekFromDb,
} from "@/lib/matchweeks"
import type { Match, Matchweek, Team } from "@/lib/types"
import { getVisibleLeaderboardMatchweeksUncached } from "@/lib/leaderboard-visibility"

const CACHE_TTL = 90

function seasonKey() {
  return process.env.FOOTBALL_DATA_SEASON ?? "2026"
}

function cacheKey(base: string, competition: CompetitionCode) {
  return [base, competition, seasonKey()] as const
}

export async function getCachedTeams(competition?: CompetitionCode): Promise<Team[]> {
  const code = getCompetitionCodeFromContext(competition)
  return unstable_cache(
    async () => getTeamsFromDb(code),
    cacheKey("cached-teams", code),
    { revalidate: CACHE_TTL, tags: ["teams"] }
  )()
}

export async function getCachedMatchweeks(competition?: CompetitionCode): Promise<Matchweek[]> {
  const code = getCompetitionCodeFromContext(competition)
  return unstable_cache(
    async () => getMatchweeksFromDb(code),
    cacheKey("cached-matchweeks", code),
    { revalidate: CACHE_TTL, tags: ["matchweeks"] }
  )()
}

export async function getCachedCurrentMatchweek(competition?: CompetitionCode): Promise<Matchweek | null> {
  const code = getCompetitionCodeFromContext(competition)
  return unstable_cache(
    async () => getPredictionMatchweekFromDb(code),
    cacheKey("cached-current-matchweek", code),
    { revalidate: CACHE_TTL, tags: ["matchweeks", "matches"] }
  )()
}

export async function getCachedMatches(competition?: CompetitionCode): Promise<Match[]> {
  const code = getCompetitionCodeFromContext(competition)
  return unstable_cache(
    async () => getMatchesFromDb(code),
    cacheKey("cached-matches", code),
    { revalidate: CACHE_TTL, tags: ["matches"] }
  )()
}

export async function getCachedVisibleLeaderboardMatchweeks(
  competition?: CompetitionCode
): Promise<Matchweek[]> {
  const code = getCompetitionCodeFromContext(competition)
  return unstable_cache(
    async () => getVisibleLeaderboardMatchweeksUncached(code),
    cacheKey("cached-visible-matchweeks", code),
    { revalidate: CACHE_TTL, tags: ["matchweeks", "matches"] }
  )()
}

export function invalidateDataCache() {
  revalidateTag("teams")
  revalidateTag("matchweeks")
  revalidateTag("matches")
}
