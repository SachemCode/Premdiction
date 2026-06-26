import {
  getCompetition,
  getCompetitionCodeFromContext,
  getSeasonSyncWarning as getSeasonSyncWarningForCompetition,
  type CompetitionCode,
} from "@/lib/competition-config"

export const EPL_TEAMS_COUNT = 20
export const EPL_MATCHWEEK_COUNT = 38
export const EPL_MATCHES_PER_SEASON = EPL_TEAMS_COUNT * (EPL_TEAMS_COUNT - 1) // 380

export function getSeasonSyncExpectations(competition?: CompetitionCode) {
  const def = getCompetition(competition)
  return {
    matchweeks: def.expectedMatchweeks ?? EPL_MATCHWEEK_COUNT,
    matches: def.expectedMatches ?? EPL_MATCHES_PER_SEASON,
  }
}

export function getSeasonSyncWarning(
  matchweekCount: number,
  matchCount: number,
  competition?: CompetitionCode
): string | null {
  return getSeasonSyncWarningForCompetition(
    getCompetitionCodeFromContext(competition),
    matchweekCount,
    matchCount
  )
}

export { getCompetition, getCompetitionCodeFromContext, type CompetitionCode }
