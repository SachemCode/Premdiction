import { cache } from "react"
import type { CompetitionCode } from "@/lib/competition-config"
import {
  getCachedCurrentMatchweek,
  getCachedMatchweeks,
} from "./data-cache"
import {
  getMatchweekWithTeamsFromDb,
  getMatchweeksWithCountsFromDb,
  getKnockoutBracketFromDb,
} from "./matchweeks"

export const getCurrentMatchweek = cache(async (competition?: CompetitionCode) => {
  return getCachedCurrentMatchweek(competition)
})

export const getMatchweekById = cache(async (id: string) => {
  return getMatchweekWithTeamsFromDb(id)
})

export const getAllMatchweeks = cache(async (competition?: CompetitionCode) => {
  return getMatchweeksWithCountsFromDb(competition)
})

export const getKnockoutBracket = cache(async (competition?: CompetitionCode) => {
  return getKnockoutBracketFromDb(competition)
})

export { getCachedMatchweeks }
