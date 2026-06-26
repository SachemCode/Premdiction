import { NextRequest, NextResponse } from "next/server"
import {
  getMatchweeks,
  getLeaderboardByMatchweek,
  getMatchIdsByMatchweek,
  getTeam,
  getTeams,
  getOverallLeaderboardData,
} from "@/lib/db"
import { getCompetitionCodeFromContext, type CompetitionCode } from "@/lib/competition-config"

function parseCompetition(value: string | null): CompetitionCode | undefined {
  if (value === "WC") return "WC"
  if (value === "PL") return "PL"
  return undefined
}

export async function GET(request: NextRequest) {
  const competition = parseCompetition(request.nextUrl.searchParams.get("competition"))
  const matchweekId = request.nextUrl.searchParams.get("matchweekId")

  if (matchweekId) {
    const [leaderboard, teams] = await Promise.all([
      getLeaderboardByMatchweek(matchweekId),
      getTeams(competition),
    ])

    const userTeamIds = new Set<string>()
    leaderboard.forEach((entry) => {
      if (entry.user?.supportedTeam) {
        userTeamIds.add(entry.user.supportedTeam)
      }
    })

    const teamArr = await Promise.all(Array.from(userTeamIds).map((id) => getTeam(id)))
    const teamMap: Record<string, (typeof teamArr)[number]> = {}
    teamArr.forEach((team) => {
      if (team?.id) teamMap[team.id] = team
    })

    return NextResponse.json({
      matchweekId,
      leaderboard,
      teams: teamMap,
      allTeams: teams,
    })
  }

  const data = await getOverallLeaderboardData(competition)

  return NextResponse.json({
    competition: getCompetitionCodeFromContext(competition),
    matchweeks: data.matchweeks,
    visibleMatchweeks: data.visibleMatchweeks,
    leaderboards: data.leaderboards,
    teams: data.teams,
  })
}
