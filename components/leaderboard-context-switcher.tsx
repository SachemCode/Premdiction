"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PrivateLeagueSummary } from "@/lib/private-leagues"
import { cn } from "@/lib/utils"

type LeaderboardContextSwitcherProps = {
  leagues: PrivateLeagueSummary[]
  currentLeagueId?: string | null
  className?: string
}

export function LeaderboardContextSwitcher({
  leagues,
  currentLeagueId,
  className,
}: LeaderboardContextSwitcherProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const value = currentLeagueId ?? "world"

  const handleChange = (next: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "")
    if (next === "world") {
      params.delete("league")
    } else {
      params.set("league", next)
    }
    const qs = params.toString()
    router.push(qs ? `/leaderboard?${qs}` : "/leaderboard")
  }

  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground shrink-0">Standings for</span>
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger className="w-full sm:w-[240px] min-h-11">
          <SelectValue placeholder="Select league" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="world">World (all players)</SelectItem>
          {leagues.map((league) => (
            <SelectItem key={league.id} value={league.id}>
              {league.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Link href="/leagues" className="text-sm text-pl-purple hover:underline shrink-0">
        Manage leagues
      </Link>
    </div>
  )
}
