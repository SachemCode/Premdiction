import type { SessionUser } from "@/lib/auth/types"

export function canUsePlFeatures(user: SessionUser | null | undefined): boolean {
  return user?.isAdmin === true
}

export function canUseLeagues(user: SessionUser | null | undefined): boolean {
  return user?.isAdmin === true
}
