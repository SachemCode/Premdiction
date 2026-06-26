import "server-only"

import { prisma } from "@/lib/prisma"
import type { PointerType, UserPointerSelection } from "@/lib/pointers"

function mapRow(row: {
  userId: string
  matchId: string
  selectedPointers: string[]
  details: unknown
  createdAt: Date
}): UserPointerSelection {
  return {
    userId: row.userId,
    matchId: row.matchId,
    selectedPointers: row.selectedPointers as PointerType[],
    details: (row.details as Record<string, string> | null) ?? undefined,
    timestamp: row.createdAt,
  }
}

export async function saveUserPointerSelectionsInDb(
  userId: string,
  matchId: string,
  selectedPointers: PointerType[],
  details?: Record<string, string>
): Promise<UserPointerSelection> {
  const row = await prisma.matchPointerSelection.upsert({
    where: { userId_matchId: { userId, matchId } },
    create: {
      userId,
      matchId,
      selectedPointers,
      details: details ?? undefined,
    },
    update: {
      selectedPointers,
      details: details ?? undefined,
    },
  })

  return mapRow(row)
}

export async function getUserPointerSelectionsFromDb(
  userId: string,
  matchId: string
): Promise<UserPointerSelection | undefined> {
  const row = await prisma.matchPointerSelection.findUnique({
    where: { userId_matchId: { userId, matchId } },
  })
  return row ? mapRow(row) : undefined
}

export async function getUserPointerSelectionsForUserFromDb(
  userId: string
): Promise<UserPointerSelection[]> {
  const rows = await prisma.matchPointerSelection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  })
  return rows.map(mapRow)
}
