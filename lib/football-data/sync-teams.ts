import { prisma } from "@/lib/prisma-client"
import { fetchFootballData, getCompetitionConfig } from "./client"
import type { FootballDataTeamsResponse } from "./types"

export async function syncTeams() {
  const { competition, season } = getCompetitionConfig()

  const data = await fetchFootballData<FootballDataTeamsResponse>(
    `/competitions/${competition}/teams?season=${season}`
  )

  if (!data.teams?.length) {
    throw new Error(`No teams returned for ${competition} season ${season}`)
  }

  const results = await Promise.all(
    data.teams.map((team) =>
      prisma.team.upsert({
        where: { id: String(team.id) },
        create: {
          id: String(team.id),
          externalId: team.id,
          competition,
          season,
          name: team.name,
          shortName: team.shortName || team.name,
          tla: team.tla || team.shortName?.slice(0, 3).toUpperCase() || "UNK",
          crestUrl: team.crest,
          venue: team.venue ?? null,
        },
        update: {
          competition,
          season,
          name: team.name,
          shortName: team.shortName || team.name,
          tla: team.tla || team.shortName?.slice(0, 3).toUpperCase() || "UNK",
          crestUrl: team.crest,
          venue: team.venue ?? null,
        },
      })
    )
  )

  return {
    competition,
    season,
    count: results.length,
    teams: results,
  }
}
