import "server-only"
import { prisma } from "@/lib/prisma"
import { getCompetitionCodeFromContext, type CompetitionCode } from "@/lib/competition-config"
import type { User, Team, Match, Matchweek, Prediction } from "./types"
import {
  getCachedTeams,
  getCachedMatchweeks,
  getCachedCurrentMatchweek,
  getCachedMatches,
  getCachedVisibleLeaderboardMatchweeks,
} from "./data-cache"
import { getTeamFromDb } from "./teams"
import {
  getMatchweekFromDb,
  getMatchesByMatchweekFromDb,
  getMatchFromDb,
  updateMatchweekInDb,
  updateMatchInDb,
  updateMatchesInDb,
  createMatchweekInDb,
  deleteMatchweekFromDb,
  createMatchInDb,
  launchMatchweekInDb,
} from "./matchweeks"
import { recalculatePredictionPointsForMatch } from "./predictions"
import { CORRECT_RESULT_POINTS, EXACT_SCORE_POINTS } from "./prediction-points"
import {
  getPrivateLeagueCompetitions,
  getPrivateLeagueMemberUserIds,
} from "./private-leagues"

export type { User, Team, Match, Matchweek, Prediction } from "./types"

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}`
}

function mapPrediction(row: {
  id: string
  userId: string
  matchId: string
  homeScore: number
  awayScore: number
  points: number | null
}): Prediction {
  return {
    id: row.id,
    userId: row.userId,
    matchId: row.matchId,
    homeScore: row.homeScore,
    awayScore: row.awayScore,
    points: row.points,
  }
}


function mapDbUser(row: {
  id: string
  name: string
  email: string
  isAdmin: boolean
  profilePicture: string | null
  supportedTeam: string | null
  createdAt: Date
}): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    isAdmin: row.isAdmin,
    profilePicture: row.profilePicture ?? undefined,
    supportedTeam: row.supportedTeam ?? undefined,
    createdAt: row.createdAt,
  }
}

export async function getUsers() {
  const rows = await prisma.user.findMany({ orderBy: { createdAt: "asc" } })
  return rows.map(mapDbUser)
}

export async function getUser(id: string) {
  const row = await prisma.user.findUnique({ where: { id } })
  return row ? mapDbUser(row) : null
}

export async function getTeams(competition?: CompetitionCode) {
  return getCachedTeams(competition)
}

export async function getTeam(id: string) {
  return getTeamFromDb(id)
}

export async function getMatchweeks(competition?: CompetitionCode) {
  return getCachedMatchweeks(competition)
}

export async function getMatchweek(id: string) {
  return getMatchweekFromDb(id)
}

export async function getCurrentMatchweek(competition?: CompetitionCode) {
  return getCachedCurrentMatchweek(competition)
}

export async function getMatches(competition?: CompetitionCode) {
  return getCachedMatches(competition)
}

export async function getMatchesByMatchweek(matchweekId: string) {
  return getMatchesByMatchweekFromDb(matchweekId)
}

export async function getMatch(id: string) {
  return getMatchFromDb(id)
}

export async function getPredictions() {
  const rows = await prisma.prediction.findMany()
  return rows.map(mapPrediction)
}

export async function getPredictionsByUser(userId: string) {
  const rows = await prisma.prediction.findMany({ where: { userId } })
  return rows.map(mapPrediction)
}

export async function getPredictionsByMatch(matchId: string) {
  const rows = await prisma.prediction.findMany({ where: { matchId } })
  return rows.map(mapPrediction)
}

export async function getPredictionsByUserAndMatch(userId: string, matchId: string) {
  const row = await prisma.prediction.findUnique({
    where: { userId_matchId: { userId, matchId } },
  })
  return row ? mapPrediction(row) : null
}

export async function getPredictionsByUserAndMatchweek(userId: string, matchweekId: string) {
  const matchIds = (await getMatchesByMatchweekFromDb(matchweekId)).map((m) => m.id)
  if (matchIds.length === 0) return []

  const rows = await prisma.prediction.findMany({
    where: { userId, matchId: { in: matchIds } },
  })
  return rows.map(mapPrediction)
}

export async function getPredictionsByUserAndCompetition(userId: string, competition?: CompetitionCode) {
  const code = getCompetitionCodeFromContext(competition)
  const season = Number(process.env.FOOTBALL_DATA_SEASON ?? "2026")

  const rows = await prisma.prediction.findMany({
    where: {
      userId,
      match: {
        matchweek: { competition: code, season },
      },
    },
  })
  return rows.map(mapPrediction)
}

export async function savePrediction(prediction: Omit<Prediction, "id" | "points">) {
  const row = await prisma.prediction.upsert({
    where: {
      userId_matchId: {
        userId: prediction.userId,
        matchId: prediction.matchId,
      },
    },
    create: {
      id: generateId("pred"),
      userId: prediction.userId,
      matchId: prediction.matchId,
      homeScore: prediction.homeScore,
      awayScore: prediction.awayScore,
      points: null,
    },
    update: {
      homeScore: prediction.homeScore,
      awayScore: prediction.awayScore,
      points: null,
    },
  })
  return mapPrediction(row)
}

export async function updateMatchResult(matchId: string, homeScore: number, awayScore: number) {
  const match = await updateMatchInDb(matchId, {
    homeScore,
    awayScore,
    status: "completed",
  })

  await recalculatePredictionPointsForMatch(matchId, homeScore, awayScore)

  return match
}

export async function getLeaderboardByMatchweek(
  matchweekId: string,
  matchIdsByMatchweek?: Map<string, string[]>,
  options?: LeaderboardQueryOptions
) {
  const matchIds = matchIdsByMatchweek
    ? (matchIdsByMatchweek.get(matchweekId) ?? [])
    : (await getMatchesByMatchweekFromDb(matchweekId)).map((m) => m.id)

  return computeLeaderboard(matchIds, options)
}

export async function getMatchIdsByMatchweek(competition?: CompetitionCode): Promise<Map<string, string[]>> {
  const matches = await getCachedMatches(competition)
  const map = new Map<string, string[]>()

  for (const match of matches) {
    const existing = map.get(match.matchweekId) ?? []
    existing.push(match.id)
    map.set(match.matchweekId, existing)
  }

  return map
}

async function computeLeaderboard(
  matchIds: string[],
  options?: { userIds?: string[]; includeAllUsers?: boolean }
) {
  const scopedUserIds = options?.userIds

  if (matchIds.length === 0 && !scopedUserIds?.length && !options?.includeAllUsers) {
    return []
  }

  const matchweekPredictions =
    matchIds.length > 0
      ? await prisma.prediction.findMany({
          where: { matchId: { in: matchIds } },
        })
      : []

  let userIds: string[]
  if (scopedUserIds?.length) {
    userIds = scopedUserIds
  } else if (options?.includeAllUsers) {
    const allUsers = await prisma.user.findMany({ select: { id: true } })
    userIds = allUsers.map((u) => u.id)
  } else {
    userIds = [...new Set(matchweekPredictions.map((p) => p.userId))]
  }

  const dbUsers = userIds.length
    ? await prisma.user.findMany({ where: { id: { in: userIds } } })
    : []
  const userMap = new Map(dbUsers.map((u) => [u.id, mapDbUser(u)]))

  const byUser: Record<
    string,
    { userId: string; points: number; exactScores: number; correctResults: number; user?: User; rank?: number }
  > = {}

  for (const userId of userIds) {
    byUser[userId] = {
      userId,
      points: 0,
      exactScores: 0,
      correctResults: 0,
      user: userMap.get(userId),
    }
  }

  for (const pred of matchweekPredictions) {
    if (scopedUserIds?.length && !scopedUserIds.includes(pred.userId)) continue
    if (!byUser[pred.userId]) {
      byUser[pred.userId] = {
        userId: pred.userId,
        points: 0,
        exactScores: 0,
        correctResults: 0,
        user: userMap.get(pred.userId),
      }
    }
    const pts = pred.points ?? 0
    byUser[pred.userId].points += pts
    if (pts === EXACT_SCORE_POINTS) byUser[pred.userId].exactScores++
    if (pts === CORRECT_RESULT_POINTS) byUser[pred.userId].correctResults++
  }

  return Object.values(byUser).sort((a, b) => b.points - a.points || b.exactScores - a.exactScores)
}

export async function getVisibleLeaderboardMatchweeks(competition?: CompetitionCode): Promise<Matchweek[]> {
  return getCachedVisibleLeaderboardMatchweeks(competition)
}

export type OverallLeaderboardData = {
  matchweeks: Matchweek[]
  visibleMatchweeks: Matchweek[]
  leaderboards: Awaited<ReturnType<typeof getLeaderboardByMatchweek>>[]
  teams: Record<string, Team | null | undefined>
}

export type LeaderboardQueryOptions = {
  userIds?: string[]
  includeAllUsers?: boolean
}

export async function getOverallLeaderboardData(
  competition?: CompetitionCode,
  options?: LeaderboardQueryOptions
): Promise<OverallLeaderboardData> {
  const code = getCompetitionCodeFromContext(competition)
  const [matchweeks, visibleMatchweeks, matchIdsByMatchweek] = await Promise.all([
    getCachedMatchweeks(code),
    getCachedVisibleLeaderboardMatchweeks(code),
    getMatchIdsByMatchweek(code),
  ])

  const leaderboards = await Promise.all(
    matchweeks.map((mw) => getLeaderboardByMatchweek(mw.id, matchIdsByMatchweek, options))
  )

  const userTeamIds = new Set<string>()
  leaderboards.forEach((lb) => {
    lb.forEach((entry) => {
      if (entry.user?.supportedTeam) userTeamIds.add(entry.user.supportedTeam)
    })
  })

  const teamArr = await Promise.all(Array.from(userTeamIds).map((id) => getTeam(id)))
  const teams: Record<string, Team | null | undefined> = {}
  teamArr.forEach((team) => {
    if (team?.id) teams[team.id] = team
  })

  return { matchweeks, visibleMatchweeks, leaderboards, teams }
}

export async function getPrivateLeagueLeaderboardData(
  leagueId: string,
  competition?: CompetitionCode
): Promise<OverallLeaderboardData & { competitions: CompetitionCode[] }> {
  const comps = await getPrivateLeagueCompetitions(leagueId)
  const code = competition ?? comps[0] ?? "PL"
  if (!comps.includes(code)) {
    throw new Error("This competition is not enabled for this league")
  }
  const userIds = await getPrivateLeagueMemberUserIds(leagueId)
  const data = await getOverallLeaderboardData(code, { userIds })
  return { ...data, competitions: comps }
}

export async function updateMatchweek(matchweekId: string, updates: Partial<Matchweek>) {
  return updateMatchweekInDb(matchweekId, updates)
}

export async function updateMatches(matchIds: string[], updates: Partial<Match>) {
  return updateMatchesInDb(matchIds, updates)
}

export async function createMatchweek(data: {
  number: number
  startDate: string | Date
  endDate: string | Date
  status?: Matchweek["status"]
}) {
  return createMatchweekInDb({
    number: data.number,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    status: data.status,
  })
}

export async function deleteMatchweek(id: string) {
  return deleteMatchweekFromDb(id)
}

export async function createMatch(data: {
  matchweekId: string
  homeTeamId: string
  awayTeamId: string
  kickoff: string | Date
  venue?: string
  matchInfo?: string
  status?: Match["status"]
}) {
  return createMatchInDb({
    matchweekId: data.matchweekId,
    homeTeamId: data.homeTeamId,
    awayTeamId: data.awayTeamId,
    kickoff: new Date(data.kickoff),
    venue: data.venue,
    status: data.status,
  })
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  isAdmin?: boolean
}) {
  const { hashPassword, normalizeEmail } = await import("@/lib/auth")
  const email = normalizeEmail(data.email)

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new Error("A user with this email already exists")
  }

  const passwordHash = await hashPassword(data.password)
  const row = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email,
      passwordHash,
      isAdmin: data.isAdmin ?? false,
    },
  })
  return mapDbUser(row)
}

export async function launchMatchweek(
  matchweekId: string,
  matchIds: string[],
  competition?: CompetitionCode
) {
  return launchMatchweekInDb(matchweekId, matchIds, competition)
}
