import "server-only"
import { cache } from "react"
import { getCompetitionCodeFromContext, type CompetitionCode } from "@/lib/competition-config"
import { prisma } from "@/lib/prisma"
import type { Team } from "@/lib/types"

function mapTeam(row: {
  id: string
  name: string
  shortName: string
  tla: string
  crestUrl: string
  venue?: string | null
}): Team {
  return {
    id: row.id,
    name: row.name,
    shortName: row.tla || row.shortName,
    logo: row.crestUrl,
    venue: row.venue ?? undefined,
  }
}

export async function getTeamsFromDb(competition?: CompetitionCode): Promise<Team[]> {
  const code = getCompetitionCodeFromContext(competition)
  const season = Number(process.env.FOOTBALL_DATA_SEASON ?? "2026")
  const teams = await prisma.team.findMany({
    where: { competition: code, season },
    orderBy: { name: "asc" },
  })
  return teams.map(mapTeam)
}

export const getTeamFromDb = cache(async (id: string): Promise<Team | null> => {
  const team = await prisma.team.findUnique({ where: { id } })
  return team ? mapTeam(team) : null
})

export async function getTeamsByIdsFromDb(ids: string[]): Promise<Team[]> {
  if (ids.length === 0) return []
  const teams = await prisma.team.findMany({
    where: { id: { in: ids } },
  })
  return teams.map(mapTeam)
}
