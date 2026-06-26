"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { StatTile } from "@/components/game/stat-tile"
import { MatchweekHeader } from "@/components/game/matchweek-header"
import { Calendar, Target, Trophy, ArrowRight } from "lucide-react"
import type { Matchweek } from "@/lib/types"

type HomeDashboardProps = {
  currentMatchweek: Matchweek | null
  matchCount?: number
}

export default function HomeDashboard({ currentMatchweek, matchCount = 10 }: HomeDashboardProps) {
  const { user } = useAuth()

  if (!user || !currentMatchweek) return null

  return (
    <section className="space-y-4">
      <MatchweekHeader
        matchweek={currentMatchweek}
        subtitle="Your game hub — pick scores before kickoff"
      />
      <div className="grid grid-cols-2 gap-3">
        <StatTile icon={Calendar} label="Matchweek" value={currentMatchweek.number} />
        <StatTile icon={Target} label="Fixtures" value={matchCount} />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="bg-pl-green hover:bg-pl-green/90 text-pl-purple flex-1 min-h-11">
          <Link href="/predictions">
            Make Predictions
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1 min-h-11">
          <Link href="/leaderboard">
            <Trophy className="mr-2 h-4 w-4" />
            Leaderboard
          </Link>
        </Button>
      </div>
    </section>
  )
}
