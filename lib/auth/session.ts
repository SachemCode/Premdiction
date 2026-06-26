import "server-only"

import { prisma } from "@/lib/prisma"
import { clearSessionCookie, getSessionIdFromCookies, setSessionCookie, SESSION_MAX_AGE_SECONDS } from "./cookies"
import type { SessionUser } from "./types"

function mapSessionUser(user: {
  id: string
  name: string
  email: string
  isAdmin: boolean
  profilePicture: string | null
  supportedTeam: string | null
}): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    profilePicture: user.profilePicture,
    supportedTeam: user.supportedTeam,
  }
}

export async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000)

  await prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })

  const session = await prisma.session.create({
    data: { userId, expiresAt },
  })

  await setSessionCookie(session.id)
  return session.id
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const sessionId = await getSessionIdFromCookies()
  if (!sessionId) return null

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: sessionId } }).catch(() => undefined)
    }
    await clearSessionCookie()
    return null
  }

  return mapSessionUser(session.user)
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) {
    throw new Error("Not authenticated")
  }
  return user
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser()
  if (!user.isAdmin) {
    throw new Error("Admin access required")
  }
  return user
}

export async function deleteSession(): Promise<void> {
  const sessionId = await getSessionIdFromCookies()
  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => undefined)
  }
  await clearSessionCookie()
}
