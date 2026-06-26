import { cookies } from "next/headers"

export const SESSION_COOKIE_NAME = "premdiction_session"

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  }
}

export async function getSessionIdFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null
}

export async function setSessionCookie(sessionId: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, getSessionCookieOptions())
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  })
}

export { SESSION_MAX_AGE_SECONDS }
