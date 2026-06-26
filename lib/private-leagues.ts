import "server-only"

import { randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"
import type { CompetitionCode } from "@/lib/competition-config"
import { COMPETITIONS } from "@/lib/competition-config"

export type PrivateLeagueRole = "owner" | "admin" | "member"

export type PrivateLeagueSummary = {
  id: string
  name: string
  slug: string
  inviteCode: string
  createdById: string
  memberCount: number
  competitions: CompetitionCode[]
  role: PrivateLeagueRole
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "league"
}

function generateInviteCode(): string {
  return randomBytes(4).toString("hex")
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base
  let attempt = 0
  while (attempt < 10) {
    const existing = await prisma.privateLeague.findUnique({ where: { slug } })
    if (!existing) return slug
    slug = `${base}-${randomBytes(2).toString("hex")}`
    attempt++
  }
  return `${base}-${Date.now()}`
}

async function uniqueInviteCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const inviteCode = generateInviteCode()
    const existing = await prisma.privateLeague.findUnique({ where: { inviteCode } })
    if (!existing) return inviteCode
  }
  return randomBytes(6).toString("hex")
}

function mapCompetitions(rows: { competition: string }[]): CompetitionCode[] {
  return rows
    .map((r) => r.competition)
    .filter((c): c is CompetitionCode => c === "PL" || c === "WC")
}

export async function createPrivateLeague(
  userId: string,
  data: { name: string; competitions: CompetitionCode[] }
): Promise<PrivateLeagueSummary> {
  const name = data.name.trim()
  if (name.length < 2 || name.length > 80) {
    throw new Error("League name must be between 2 and 80 characters")
  }

  const competitions = data.competitions.length > 0 ? data.competitions : (["PL"] as CompetitionCode[])
  for (const code of competitions) {
    if (!COMPETITIONS[code]) throw new Error(`Invalid competition: ${code}`)
  }

  const slug = await uniqueSlug(slugify(name))
  const inviteCode = await uniqueInviteCode()

  const league = await prisma.privateLeague.create({
    data: {
      name,
      slug,
      inviteCode,
      createdById: userId,
      members: {
        create: { userId, role: "owner" },
      },
      competitions: {
        create: competitions.map((competition) => ({ competition, season: 2026 })),
      },
    },
    include: {
      members: true,
      competitions: true,
    },
  })

  const member = league.members.find((m) => m.userId === userId)!

  return {
    id: league.id,
    name: league.name,
    slug: league.slug,
    inviteCode: league.inviteCode,
    createdById: league.createdById,
    memberCount: league.members.length,
    competitions: mapCompetitions(league.competitions),
    role: member.role as PrivateLeagueRole,
  }
}

export async function joinPrivateLeagueByCode(
  userId: string,
  inviteCode: string
): Promise<PrivateLeagueSummary> {
  const code = inviteCode.trim().toLowerCase()
  const league = await prisma.privateLeague.findFirst({
    where: { inviteCode: { equals: code, mode: "insensitive" } },
    include: { members: true, competitions: true },
  })

  if (!league) throw new Error("Invalid invite code")

  const existing = league.members.find((m) => m.userId === userId)
  if (existing) {
    return {
      id: league.id,
      name: league.name,
      slug: league.slug,
      inviteCode: league.inviteCode,
      createdById: league.createdById,
      memberCount: league.members.length,
      competitions: mapCompetitions(league.competitions),
      role: existing.role as PrivateLeagueRole,
    }
  }

  await prisma.privateLeagueMember.create({
    data: { leagueId: league.id, userId, role: "member" },
  })

  const updated = await prisma.privateLeague.findUniqueOrThrow({
    where: { id: league.id },
    include: { members: true, competitions: true },
  })

  const member = updated.members.find((m) => m.userId === userId)!

  return {
    id: updated.id,
    name: updated.name,
    slug: updated.slug,
    inviteCode: updated.inviteCode,
    createdById: updated.createdById,
    memberCount: updated.members.length,
    competitions: mapCompetitions(updated.competitions),
    role: member.role as PrivateLeagueRole,
  }
}

export async function getPrivateLeaguesForUser(userId: string): Promise<PrivateLeagueSummary[]> {
  const memberships = await prisma.privateLeagueMember.findMany({
    where: { userId },
    include: {
      league: {
        include: {
          members: true,
          competitions: true,
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  })

  return memberships.map((m) => ({
    id: m.league.id,
    name: m.league.name,
    slug: m.league.slug,
    inviteCode: m.league.inviteCode,
    createdById: m.league.createdById,
    memberCount: m.league.members.length,
    competitions: mapCompetitions(m.league.competitions),
    role: m.role as PrivateLeagueRole,
  }))
}

export async function getPrivateLeagueById(leagueId: string) {
  return prisma.privateLeague.findUnique({
    where: { id: leagueId },
    include: {
      members: true,
      competitions: true,
    },
  })
}

export async function getPrivateLeagueMemberUserIds(leagueId: string): Promise<string[]> {
  const members = await prisma.privateLeagueMember.findMany({
    where: { leagueId },
    select: { userId: true },
  })
  return members.map((m) => m.userId)
}

export async function getPrivateLeagueCompetitions(leagueId: string): Promise<CompetitionCode[]> {
  const rows = await prisma.privateLeagueCompetition.findMany({
    where: { leagueId },
  })
  return mapCompetitions(rows)
}

export async function isUserInPrivateLeague(userId: string, leagueId: string): Promise<boolean> {
  const row = await prisma.privateLeagueMember.findUnique({
    where: { leagueId_userId: { leagueId, userId } },
  })
  return !!row
}

export async function updatePrivateLeagueCompetitions(
  leagueId: string,
  userId: string,
  competitions: CompetitionCode[]
): Promise<void> {
  const league = await prisma.privateLeague.findUnique({
    where: { id: leagueId },
    include: { members: true },
  })
  if (!league) throw new Error("League not found")

  const member = league.members.find((m) => m.userId === userId)
  if (!member || (member.role !== "owner" && member.role !== "admin")) {
    throw new Error("Only league owners can update competitions")
  }

  if (competitions.length === 0) throw new Error("Select at least one competition")

  await prisma.privateLeagueCompetition.deleteMany({ where: { leagueId } })
  await prisma.privateLeagueCompetition.createMany({
    data: competitions.map((competition) => ({ leagueId, competition, season: 2026 })),
  })
}
