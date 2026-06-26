"use server"

import { savePrediction, getMatch, getMatchweek, getMatchesByMatchweek } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { saveUserPointerSelections, type PointerType } from "@/lib/pointers"
import { requireUser } from "@/lib/auth"
import {
  getFirstKickoff,
  getPredictionWindow,
  getPredictionWindowStatus,
  SCORE_INPUT_MAX,
} from "@/lib/prediction-window"

async function assertPredictionWindowOpen(matchId: string) {
  const match = await getMatch(matchId)
  if (!match) throw new Error("Match not found")

  const matchweek = await getMatchweek(match.matchweekId)
  if (!matchweek) throw new Error("Matchweek not found")

  const matches = await getMatchesByMatchweek(match.matchweekId)
  const firstKickoff = getFirstKickoff(matches)
  const window = getPredictionWindow(matchweek.startDate, firstKickoff)
  const status = getPredictionWindowStatus(new Date(), window)

  if (status !== "open") {
    throw new Error("Prediction window is not open")
  }
}

export async function savePredictionAction(data: {
  matchId: string
  homeScore: number
  awayScore: number
}) {
  const user = await requireUser()

  if (
    typeof data.homeScore !== "number" ||
    typeof data.awayScore !== "number" ||
    data.homeScore < 0 ||
    data.awayScore < 0 ||
    data.homeScore > SCORE_INPUT_MAX ||
    data.awayScore > SCORE_INPUT_MAX
  ) {
    throw new Error("Both home and away scores are required and must be between 0 and 1000")
  }

  await assertPredictionWindowOpen(data.matchId)

  const prediction = await savePrediction({
    userId: user.id,
    matchId: data.matchId,
    homeScore: data.homeScore,
    awayScore: data.awayScore,
  })

  revalidatePath("/predictions")
  revalidatePath("/leaderboard")
  revalidatePath("/events/world-cup")
  revalidatePath("/events/world-cup/predictions")
  revalidatePath("/events/world-cup/leaderboard")

  return prediction
}

export async function saveUserPointerSelectionsAction(data: {
  matchId: string
  selectedPointers: PointerType[]
  details?: Record<string, string>
}) {
  const user = await requireUser()

  await assertPredictionWindowOpen(data.matchId)

  const selection = saveUserPointerSelections(user.id, data.matchId, data.selectedPointers, data.details)

  revalidatePath("/predictions")
  revalidatePath("/leaderboard")
  revalidatePath("/events/world-cup")
  revalidatePath("/events/world-cup/predictions")
  revalidatePath("/events/world-cup/leaderboard")

  return selection
}
