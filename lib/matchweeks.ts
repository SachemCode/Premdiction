import "server-only"
import { getCompetitionCodeFromContext, getKnockoutRoundName, isKnockoutCompetition, type CompetitionCode } from "@/lib/competition-config"
import { prisma } from "@/lib/prisma"
import type { Match, Matchweek, Team } from "@/lib/types"
import { matchweekId } from "@/lib/football-data/sync-fixtures"
import { getTeamsByIdsFromDb } from "@/lib/teams"
import { getMatchStadium } from "@/lib/match-venue"

function mapMatchweek(row: {
  id: string
  number: number
  competition?: string
  startDate: Date
  endDate: Date
  status: string
  label?: string | null
}): Matchweek {
  return {
    id: row.id,
    number: row.number,
    competition: row.competition,
    startDate: row.startDate,
    endDate: row.endDate,
    status: row.status as Matchweek["status"],
    label: row.label ?? undefined,
  }
}

function mapMatch(row: {
  id: string
  matchweekId: string
  homeTeamId: string
  awayTeamId: string
  kickoff: Date
  homeScore: number | null
  awayScore: number | null
  status: string
  venue: string | null
  stage?: string | null
}): Match {
  return {
    id: row.id,
    matchweekId: row.matchweekId,
    homeTeamId: row.homeTeamId,
    awayTeamId: row.awayTeamId,
    kickoff: row.kickoff,
    homeScore: row.homeScore,
    awayScore: row.awayScore,
    status: row.status as Match["status"],
    venue: row.venue ?? undefined,
    stage: row.stage ?? undefined,
  }
}

function competitionFilter(competition?: CompetitionCode) {
  const code = getCompetitionCodeFromContext(competition)
  const season = Number(process.env.FOOTBALL_DATA_SEASON ?? "2026")
  return { competition: code, season }
}

export async function getMatchweeksFromDb(competition?: CompetitionCode): Promise<Matchweek[]> {
  const { competition: code, season } = competitionFilter(competition)
  const rows = await prisma.matchweek.findMany({
    where: { competition: code, season },
    orderBy: { number: "asc" },
  })
  return rows.map(mapMatchweek)
}

export async function getMatchweekFromDb(id: string): Promise<Matchweek | null> {
  const row = await prisma.matchweek.findUnique({ where: { id } })
  return row ? mapMatchweek(row) : null
}

export async function getMatchesFromDb(competition?: CompetitionCode): Promise<Match[]> {
  const { competition: code, season } = competitionFilter(competition)
  const rows = await prisma.match.findMany({
    where: { matchweek: { competition: code, season } },
    orderBy: { kickoff: "asc" },
  })
  return rows.map(mapMatch)
}

export async function getMatchesByMatchweekFromDb(matchweekIdValue: string): Promise<Match[]> {
  const rows = await prisma.match.findMany({
    where: { matchweekId: matchweekIdValue },
    orderBy: { kickoff: "asc" },
  })
  return rows.map(mapMatch)
}

export async function getMatchFromDb(id: string): Promise<Match | null> {
  const row = await prisma.match.findUnique({ where: { id } })
  return row ? mapMatch(row) : null
}

export async function getPredictionMatchweekFromDb(competition?: CompetitionCode): Promise<Matchweek | null> {
  const { competition: code, season } = competitionFilter(competition)
  const now = new Date()

  if (isKnockoutCompetition(code)) {
    const activeRound = await prisma.matchweek.findFirst({
      where: { competition: code, season, status: "active" },
      orderBy: { number: "asc" },
    })
    if (activeRound) return mapMatchweek(activeRound)
  }

  const withUpcoming = await prisma.matchweek.findFirst({
    where: {
      competition: code,
      season,
      matches: {
        some: {
          status: "scheduled",
          kickoff: { gt: now },
        },
      },
    },
    orderBy: { number: "asc" },
  })

  if (withUpcoming) return mapMatchweek(withUpcoming)

  const upcomingByStatus = await prisma.matchweek.findFirst({
    where: { competition: code, season, status: "upcoming" },
    orderBy: { number: "asc" },
  })

  return upcomingByStatus ? mapMatchweek(upcomingByStatus) : null
}

export async function getMatchweeksWithCountsFromDb(competition?: CompetitionCode): Promise<(Matchweek & { matchCount: number })[]> {
  const { competition: code, season } = competitionFilter(competition)
  const rows = await prisma.matchweek.findMany({
    where: { competition: code, season },
    orderBy: { number: "asc" },
    include: { _count: { select: { matches: true } } },
  })

  return rows.map((row) => ({
    ...mapMatchweek(row),
    matchCount: row._count.matches,
  }))
}

export async function getMatchweekWithTeamsFromDb(id: string): Promise<{
  id: string
  number: number
  startDate: Date
  endDate: Date
  status: Matchweek["status"]
  label?: string
  matches: (Match & { homeTeam: Team | null; awayTeam: Team | null })[]
} | null> {
  const row = await prisma.matchweek.findUnique({
    where: { id },
    include: {
      matches: { orderBy: { kickoff: "asc" } },
    },
  })

  if (!row) return null

  const teamIds = new Set<string>()
  for (const match of row.matches) {
    teamIds.add(match.homeTeamId)
    teamIds.add(match.awayTeamId)
  }

  const teams = await getTeamsByIdsFromDb([...teamIds])
  const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]))

  const matches = row.matches.map((match) => {
    const homeTeam = teamMap[match.homeTeamId] ?? null
    const awayTeam = teamMap[match.awayTeamId] ?? null
    const mapped = mapMatch(match)
    const stadium = getMatchStadium(mapped, homeTeam)

    return {
      ...mapped,
      venue: stadium ?? undefined,
      homeTeam,
      awayTeam,
    }
  })

  return {
    ...mapMatchweek(row),
    label: row.label ?? undefined,
    matches,
  }
}

export type KnockoutRoundWithMatches = {
  id: string
  number: number
  startDate: Date
  endDate: Date
  status: Matchweek["status"]
  label?: string
  roundName: string
  matches: (Match & { homeTeam: Team; awayTeam: Team })[]
}

export async function getKnockoutBracketFromDb(
  competition?: CompetitionCode
): Promise<KnockoutRoundWithMatches[]> {
  const { competition: code, season } = competitionFilter(competition)
  const rows = await prisma.matchweek.findMany({
    where: { competition: code, season },
    orderBy: { number: "asc" },
    include: {
      matches: { orderBy: { kickoff: "asc" } },
    },
  })

  if (rows.length === 0) return []

  const teamIds = new Set<string>()
  for (const row of rows) {
    for (const match of row.matches) {
      teamIds.add(match.homeTeamId)
      teamIds.add(match.awayTeamId)
    }
  }

  const teams = await getTeamsByIdsFromDb([...teamIds])
  const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]))

  return rows.map((row) => {
    const matchweek = mapMatchweek(row)
    const matches = row.matches
      .map((match) => {
        const homeTeam = teamMap[match.homeTeamId]
        const awayTeam = teamMap[match.awayTeamId]
        if (!homeTeam || !awayTeam) return null

        const mapped = mapMatch(match)
        const stadium = getMatchStadium(mapped, homeTeam)

        return {
          ...mapped,
          venue: stadium ?? undefined,
          homeTeam,
          awayTeam,
        }
      })
      .filter((m): m is Match & { homeTeam: Team; awayTeam: Team } => m != null)

    return {
      ...matchweek,
      label: row.label ?? undefined,
      roundName: getKnockoutRoundName(matchweek),
      matches,
    }
  })
}

export async function updateMatchweekInDb(
  id: string,
  updates: Partial<Pick<Matchweek, "status" | "startDate" | "endDate">>
) {
  const row = await prisma.matchweek.update({
    where: { id },
    data: updates,
  })
  return mapMatchweek(row)
}

export async function updateMatchInDb(id: string, updates: Partial<Match>) {
  const row = await prisma.match.update({
    where: { id },
    data: {
      status: updates.status,
      homeScore: updates.homeScore,
      awayScore: updates.awayScore,
      kickoff: updates.kickoff,
      matchweekId: updates.matchweekId,
      venue: updates.venue,
    },
  })
  return mapMatch(row)
}

export async function updateMatchesInDb(matchIds: string[], updates: Partial<Match>) {
  const results: Match[] = []
  for (const id of matchIds) {
    const match = await updateMatchInDb(id, updates)
    results.push(match)
  }
  return results
}

export async function createMatchweekInDb(
  data: {
    number: number
    startDate: Date
    endDate: Date
    status?: Matchweek["status"]
  },
  competition?: CompetitionCode
) {
  const { competition: code, season } = competitionFilter(competition)
  const id = matchweekId(code, season, data.number)

  const existing = await prisma.matchweek.findUnique({ where: { id } })
  if (existing) {
    throw new Error(`Matchweek ${data.number} already exists`)
  }

  const row = await prisma.matchweek.create({
    data: {
      id,
      number: data.number,
      competition: code,
      season,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status ?? "upcoming",
    },
  })
  return mapMatchweek(row)
}

export async function deleteMatchweekFromDb(id: string) {
  await prisma.matchweek.delete({ where: { id } })
  return true
}

export async function createMatchInDb(data: {
  matchweekId: string
  homeTeamId: string
  awayTeamId: string
  kickoff: Date
  venue?: string
  status?: Match["status"]
}) {
  if (data.homeTeamId === data.awayTeamId) {
    throw new Error("Home team and away team cannot be the same")
  }

  const externalId = Date.now()
  const row = await prisma.match.create({
    data: {
      id: `manual_${externalId}`,
      externalId,
      matchweekId: data.matchweekId,
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      kickoff: data.kickoff,
      homeScore: null,
      awayScore: null,
      status: data.status ?? "scheduled",
      venue: data.venue ?? null,
    },
  })
  return mapMatch(row)
}

export async function launchMatchweekInDb(
  matchweekIdValue: string,
  matchIds: string[],
  competition?: CompetitionCode
) {
  const matchweeks = await getMatchweeksFromDb(competition)

  for (const mw of matchweeks) {
    if (mw.status === "active" && mw.id !== matchweekIdValue) {
      await updateMatchweekInDb(mw.id, { status: "completed" })
    }
  }

  await updateMatchweekInDb(matchweekIdValue, { status: "active" })

  if (matchIds.length > 0) {
    await updateMatchesInDb(matchIds, { status: "scheduled", matchweekId: matchweekIdValue })
  }

  return { success: true }
}
