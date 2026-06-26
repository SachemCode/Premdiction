import { getSessionUser } from "@/lib/auth"

export async function getUserIdFromSession(): Promise<string | null> {
  const user = await getSessionUser()
  return user?.id ?? null
}
