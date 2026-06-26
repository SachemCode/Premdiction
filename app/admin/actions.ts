"use server"

import { revalidatePath } from "next/cache"
import {
  updateMatchResult,
  getMatchweeks,
  getMatches,
  getUsers,
  getMatch,
  createMatchweek,
  createMatch,
  updateMatchweek,
  launchMatchweek,
  createUser,
  type Match,
  type Matchweek,
  type User,
} from "@/lib/db"
import { updateMatchInDb } from "@/lib/matchweeks"
import { saveMatchPointerOutcomes, type PointerType } from "@/lib/pointers"

export async function createMatchweekAction(data: {
  number: number
  startDate: string
  endDate: string
}) {
  const newMatchweek = await createMatchweek({
    number: data.number,
    startDate: data.startDate,
    endDate: data.endDate,
    status: "upcoming",
  })

  revalidatePath("/admin/matchweeks")
  revalidatePath("/predictions")
  revalidatePath("/leaderboard")

  return { success: true, matchweek: newMatchweek }
}

export async function updateMatchweekStatusAction(data: {
  matchweekId: string
  status: "upcoming" | "active" | "completed"
}) {
  const matchweeks = await getMatchweeks()
  const matchweek = matchweeks.find((mw) => mw.id === data.matchweekId)

  if (!matchweek) {
    throw new Error("Matchweek not found")
  }

  if (data.status === "active") {
    for (const mw of matchweeks) {
      if (mw.status === "active" && mw.id !== data.matchweekId) {
        await updateMatchweek(mw.id, { status: "completed" })
      }
    }
  }

  await updateMatchweek(data.matchweekId, { status: data.status })

  revalidatePath("/admin/matchweeks")
  revalidatePath("/predictions")
  revalidatePath("/leaderboard")
  revalidatePath("/")

  return { success: true }
}

export async function createMatchAction(data: {
  matchweekId: string
  homeTeamId: string
  awayTeamId: string
  kickoff: string
  venue?: string
  matchInfo?: string
}) {
  const matches = await getMatches()
  if (
    matches.some(
      (m) =>
        m.matchweekId === data.matchweekId &&
        m.homeTeamId === data.homeTeamId &&
        m.awayTeamId === data.awayTeamId
    )
  ) {
    throw new Error("A match between these teams already exists in this matchweek")
  }

  const newMatch = await createMatch({
    matchweekId: data.matchweekId,
    homeTeamId: data.homeTeamId,
    awayTeamId: data.awayTeamId,
    kickoff: data.kickoff,
    venue: data.venue,
    matchInfo: data.matchInfo,
  })

  revalidatePath("/admin/matches")
  revalidatePath("/predictions")
  revalidatePath("/")

  return { success: true, match: newMatch }
}

export async function updateMatchStatusAction(data: {
  matchId: string
  status: "scheduled" | "live" | "completed"
}) {
  const match = await getMatch(data.matchId)

  if (!match) {
    throw new Error("Match not found")
  }

  await updateMatchInDb(data.matchId, { status: data.status })

  revalidatePath("/admin/matches")
  revalidatePath("/predictions")
  revalidatePath("/")

  return { success: true }
}

export async function updateMatchResultAction(data: {
  matchId: string
  homeScore: number
  awayScore: number
}) {
  const result = await updateMatchResult(data.matchId, data.homeScore, data.awayScore)

  if (!result) {
    throw new Error("Failed to update match result")
  }

  revalidatePath("/admin/results")
  revalidatePath("/admin/matches")
  revalidatePath("/predictions")
  revalidatePath("/leaderboard")
  revalidatePath("/profile")
  revalidatePath("/")

  return { success: true }
}

export async function createUserAction(data: {
  name: string
  email: string
  password: string
}) {
  const newUser = await createUser(data)

  revalidatePath("/admin/users")
  revalidatePath("/leaderboard")

  return { success: true, user: newUser }
}

export async function saveMatchPointerOutcomesAction(data: {
  matchId: string
  outcomes: {
    pointerId: PointerType
    occurred: boolean
    details?: string
  }[]
}) {
  const outcome = saveMatchPointerOutcomes(data.matchId, data.outcomes)

  revalidatePath("/admin/results")
  revalidatePath("/predictions")
  revalidatePath("/leaderboard")
  revalidatePath("/profile")

  return outcome
}

export async function launchMatchweekAction({
  matchweekId,
  matchIds,
}: {
  matchweekId: string
  matchIds: string[]
}) {
  await launchMatchweek(matchweekId, matchIds)

  revalidatePath("/admin")
  revalidatePath("/predictions")
  revalidatePath("/leaderboard")
  revalidatePath("/")

  return { success: true }
}
