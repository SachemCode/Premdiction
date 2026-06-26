"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { logoutAction, updateProfileAction } from "@/app/auth/actions"
import type { SessionUser } from "@/lib/auth/types"

type AuthContextType = {
  user: SessionUser | null
  signOut: () => Promise<void>
  updateProfile: (data: Partial<Pick<SessionUser, "name" | "profilePicture" | "supportedTeam"> & { supportedTeam?: string | null }>) => Promise<void>
  refreshUser: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" })
      const data = await res.json()
      setUser(data.user ?? null)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false))
  }, [refreshUser])

  const signOut = async () => {
    await logoutAction()
    setUser(null)
  }

  const updateProfile = async (
    data: Partial<Pick<SessionUser, "name" | "profilePicture" | "supportedTeam">> & {
      supportedTeam?: string | null
    }
  ) => {
    const result = await updateProfileAction(data)
    if (!result.success) {
      throw new Error(result.error ?? "Failed to update profile")
    }
    await refreshUser()
  }

  return (
    <AuthContext.Provider value={{ user, signOut, updateProfile, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export type { SessionUser as AuthUser }
