import { prisma } from "@/lib/prisma-client"
import {
  getKnockoutStageLabel,
  getKnockoutStageOrder,
  isKnockoutStage,
  KNOCKOUT_STAGES,
} from "@/lib/competition-config"
import { getSeasonSyncWarning } from "@/lib/competition"
import { recalculatePredictionPointsForMatch } from "@/lib/predictions"
import { fetchFootballData, getCompetitionConfig } from "./client"
import type { FootballDataMatch, FootballDataMatchesResponse } from "./types"

export function matchweekId(competition: string, season: number, number: number) {
  return `${competition}_${season}_${number}`
}

function mapMatchStatus(apiStatus: string): "scheduled" | "live" | "completed" {
  if (apiStatus === "FINISHED") return "completed"
  if (["IN_PLAY", "LIVE", "PAUSED"].includes(apiStatus)) return "live"
  return "scheduled"
}

function computeMatchweekStatus(
  matches: { status: string; kickoff: Date }[]
): "upcoming" | "active" | "completed" {
  const now = new Date()
  if (matches.length === 0) return "upcoming"
  if (matches.every((m) => m.status === "completed")) return "completed"
  if (matches.every((m) => m.status === "scheduled" && m.kickoff > now)) return "upcoming"
  return "active"
}

function resolve90MinScore(match: FootballDataMatch, status: "scheduled" | "live" | "completed") {
  if (status !== "completed") return { homeScore: null, awayScore: null }

  const regular = match.score?.regularTime
  if (regular && regular.home != null && regular.away != null) {
    return { homeScore: regular.home, awayScore: regular.away }
  }

  const fullTime = match.score?.fullTime
  return {
    homeScore: fullTime?.home ?? null,
    awayScore: fullTime?.away ?? null,
  }
}

function placeholderTeamId(matchId: number, side: "home" | "away") {
  return `tbd_${matchId}_${side}`
}

function resolveTeamId(matchId: number, team: FootballDataMatch["homeTeam"], side: "home" | "away") {
  if (team.id != null) return String(team.id)
  return placeholderTeamId(matchId, side)
}

function placeholderTeamName(team: FootballDataMatch["homeTeam"], side: "home" | "away") {
  const label = team.name?.trim() || team.shortName?.trim()
  if (label) return label
  return side === "home" ? "Home TBD" : "Away TBD"
}

async function ensurePlaceholderTeams(
  matches: FootballDataMatch[],
  competition: string,
  season: number
) {
  for (const match of matches) {
    for (const side of ["home", "away"] as const) {
      const team = side === "home" ? match.homeTeam : match.awayTeam
      if (team.id != null) continue

      const id = placeholderTeamId(match.id, side)
      const name = placeholderTeamName(team, side)
      const shortName = team.shortName?.trim() || name
      const tla = team.tla?.trim() || "TBD"

      await prisma.team.upsert({
        where: { id },
        create: {
          id,
          externalId: -match.id * 10 - (side === "home" ? 1 : 2),
          competition,
          season,
          name,
          shortName,
          tla,
          crestUrl: "",
          venue: null,
        },
        update: {
          name,
          shortName,
          tla,
        },
      })
    }
  }
}

function mapApiMatch(match: FootballDataMatch, competition: string) {
  const status = mapMatchStatus(match.status)
  const { homeScore, awayScore } = resolve90MinScore(match, status)
  const stage = match.stage ?? null
  const isKnockout = competition === "WC"

  return {
    id: String(match.id),
    externalId: match.id,
    homeTeamId: resolveTeamId(match.id, match.homeTeam, "home"),
    awayTeamId: resolveTeamId(match.id, match.awayTeam, "away"),
    kickoff: new Date(match.utcDate),
    homeScore,
    awayScore,
    status,
    venue: match.venue ?? null,
    matchday: match.matchday,
    stage,
    groupKey: isKnockout && stage ? stage : String(match.matchday),
  }
}

async function fetchSeasonMatches(competition: string, season: number) {
  const path = `/competitions/${competition}/matches?season=${season}`
  const maxAttempts = 4

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const data = await fetchFootballData<FootballDataMatchesResponse>(path)
    if (data.matches?.length) return data

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 15_000))
    }
  }

  throw new Error(
    `No matches returned for ${competition} season ${season}. The football-data.org API may be rate-limited — wait a minute and try again.`
  )
}

export async function syncFixtures(competitionOverride?: "PL" | "WC") {
  const { competition, season } = getCompetitionConfig(competitionOverride)
  const isKnockout = competition === "WC"

  const data = await fetchSeasonMatches(competition, season)

  if (!data.matches?.length) {
    throw new Error(`No matches returned for ${competition} season ${season}`)
  }

  const teamVenues = await prisma.team.findMany({
    where: { competition, season },
    select: { id: true, venue: true },
  })
  const homeTeamVenueMap = new Map(teamVenues.map((t) => [t.id, t.venue]))

  const knockoutMatches = isKnockout
    ? data.matches.filter((m) => m.stage && isKnockoutStage(m.stage))
    : data.matches

  if (isKnockout && knockoutMatches.length > 0) {
    await ensurePlaceholderTeams(knockoutMatches, competition, season)
  }

  const teamIds = new Set(
    (await prisma.team.findMany({ where: { competition, season }, select: { id: true } })).map((t) => t.id)
  )

  const byGroup = new Map<string, ReturnType<typeof mapApiMatch>[]>()
  const unknownStages = new Set<string>()
  const skippedMissingTeams = new Set<string>()

  for (const raw of data.matches) {
    if (isKnockout) {
      const stage = raw.stage
      if (!stage || !isKnockoutStage(stage)) {
        if (stage) unknownStages.add(stage)
        continue
      }
    }

    const mapped = mapApiMatch(raw, competition)
    if (!teamIds.has(mapped.homeTeamId) || !teamIds.has(mapped.awayTeamId)) {
      skippedMissingTeams.add(mapped.id)
      continue
    }
    const group = byGroup.get(mapped.groupKey) ?? []
    group.push(mapped)
    byGroup.set(mapped.groupKey, group)
  }

  if (isKnockout && unknownStages.size > 0) {
    console.warn(
      `[sync-fixtures] Ignored non-knockout stages: ${[...unknownStages].join(", ")}. Expected: ${KNOCKOUT_STAGES.join(", ")}`
    )
  }
  if (skippedMissingTeams.size > 0) {
    console.warn(
      `[sync-fixtures] Skipped ${skippedMissingTeams.size} matches with unresolved teams`
    )
  }

  let matchweekCount = 0
  let matchCount = 0

  const sortedGroups = [...byGroup.entries()].sort((a, b) => {
    if (isKnockout) {
      return getKnockoutStageOrder(a[0]) - getKnockoutStageOrder(b[0])
    }
    return Number(a[0]) - Number(b[0])
  })

  let roundNumber = 0
  for (const [, groupMatches] of sortedGroups) {
    roundNumber++
    const dayMatches = groupMatches.sort((a, b) => a.kickoff.getTime() - b.kickoff.getTime())
    const kickoffs = dayMatches.map((m) => m.kickoff)
    const startDate = new Date(Math.min(...kickoffs.map((d) => d.getTime())))
    const endDate = new Date(Math.max(...kickoffs.map((d) => d.getTime())))
    const stage = isKnockout ? dayMatches[0]?.stage ?? null : null
    const label = stage ? getKnockoutStageLabel(stage) : null
    const mwId = matchweekId(competition, season, roundNumber)
    const status = computeMatchweekStatus(dayMatches)

    await prisma.matchweek.upsert({
      where: { id: mwId },
      create: {
        id: mwId,
        number: roundNumber,
        competition,
        season,
        label,
        startDate,
        endDate,
        status,
      },
      update: {
        label,
        startDate,
        endDate,
        status,
      },
    })
    matchweekCount++

    for (const match of dayMatches) {
      const resolvedVenue = match.venue ?? homeTeamVenueMap.get(match.homeTeamId) ?? null

      await prisma.match.upsert({
        where: { id: match.id },
        create: {
          id: match.id,
          externalId: match.externalId,
          matchweekId: mwId,
          homeTeamId: match.homeTeamId,
          awayTeamId: match.awayTeamId,
          kickoff: match.kickoff,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          status: match.status,
          venue: resolvedVenue,
          stage: match.stage,
        },
        update: {
          matchweekId: mwId,
          homeTeamId: match.homeTeamId,
          awayTeamId: match.awayTeamId,
          kickoff: match.kickoff,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          status: match.status,
          venue: resolvedVenue,
          stage: match.stage,
        },
      })
      if (match.status === "completed" && match.homeScore != null && match.awayScore != null) {
        await recalculatePredictionPointsForMatch(match.id, match.homeScore, match.awayScore)
      }
      matchCount++
    }
  }

  return {
    competition,
    season,
    matchweekCount,
    matchCount,
    warning: getSeasonSyncWarning(matchweekCount, matchCount, competition as "PL" | "WC"),
  }
}
