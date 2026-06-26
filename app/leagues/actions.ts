"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth"
import type { CompetitionCode } from "@/lib/competition-config"
import {
  createPrivateLeague,
  joinPrivateLeagueByCode,
  getPrivateLeaguesForUser,
  updatePrivateLeagueCompetitions,
  isUserInPrivateLeague,
} from "@/lib/private-leagues"

export async function createPrivateLeagueAction(data: {
  name: string
  competitions: CompetitionCode[]
}) {
  const user = await requireUser()
  const league = await createPrivateLeague(user.id, data)

  revalidatePath("/leagues")
  revalidatePath("/leaderboard")
  revalidatePath(`/leagues/${league.id}`)

  return league
}

export async function joinPrivateLeagueAction(inviteCode: string) {
  const user = await requireUser()
  const league = await joinPrivateLeagueByCode(user.id, inviteCode)

  revalidatePath("/leagues")
  revalidatePath("/leaderboard")
  revalidatePath(`/leagues/${league.id}`)

  return league
}

export async function getMyPrivateLeaguesAction() {
  const user = await requireUser()
  return getPrivateLeaguesForUser(user.id)
}

export async function updatePrivateLeagueCompetitionsAction(
  leagueId: string,
  competitions: CompetitionCode[]
) {
  const user = await requireUser()
  await updatePrivateLeagueCompetitions(leagueId, user.id, competitions)

  revalidatePath("/leagues")
  revalidatePath(`/leagues/${leagueId}`)
  revalidatePath("/leaderboard")
}

export async function assertLeagueMemberAction(leagueId: string) {
  const user = await requireUser()
  const isMember = await isUserInPrivateLeague(user.id, leagueId)
  if (!isMember) throw new Error("You are not a member of this league")
  return user
}
