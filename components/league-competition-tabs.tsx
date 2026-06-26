"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import type { CompetitionCode } from "@/lib/competition-config"
import { COMPETITIONS } from "@/lib/competition-config"

export function LeagueCompetitionTabs({
  competitions,
  activeCompetition,
  leagueId,
  context = "league-page",
}: {
  competitions: CompetitionCode[]
  activeCompetition: CompetitionCode
  leagueId: string
  context?: "leaderboard" | "league-page"
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (competitions.length <= 1) return null

  const setCompetition = (code: CompetitionCode) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "")
    params.set("competition", code)
    if (context === "leaderboard") {
      params.set("league", leagueId)
      router.push(`/leaderboard?${params.toString()}`)
    } else {
      router.push(`/leagues/${leagueId}?${params.toString()}`)
    }
  }

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
      {competitions.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setCompetition(code)}
          className={cn(
            "shrink-0 px-3 py-2 rounded-full text-sm font-medium min-h-11 transition-colors",
            activeCompetition === code
              ? "bg-pl-purple text-white"
              : "bg-muted hover:bg-muted/80"
          )}
        >
          {COMPETITIONS[code].displayName}
        </button>
      ))}
    </div>
  )
}
