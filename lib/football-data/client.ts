import { getDefaultCompetitionCode } from "@/lib/competition-config"

const FOOTBALL_DATA_BASE_URL = "https://api.football-data.org/v4"

function getApiKey(): string {
  const key = process.env.FOOTBALL_DATA_API_KEY
  if (!key) {
    throw new Error("FOOTBALL_DATA_API_KEY is not set in environment variables")
  }
  return key
}

export async function fetchFootballData<T>(path: string): Promise<T> {
  const response = await fetch(`${FOOTBALL_DATA_BASE_URL}${path}`, {
    headers: {
      "X-Auth-Token": getApiKey(),
    },
    next: { revalidate: 0 },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`football-data.org request failed (${response.status}): ${body}`)
  }

  return response.json() as Promise<T>
}

export function getCompetitionConfig(competitionOverride?: "PL" | "WC") {
  const competition =
    competitionOverride ?? process.env.FOOTBALL_DATA_COMPETITION ?? getDefaultCompetitionCode()
  return {
    competition: competition === "WC" ? "WC" : "PL",
    season: Number(process.env.FOOTBALL_DATA_SEASON ?? "2026"),
  }
}
