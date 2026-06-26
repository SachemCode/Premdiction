"use client"

import { useEffect, useState } from "react"
import type { Team, User } from "@/lib/types"
import { Trophy } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { calculateMatchweekPointerPoints } from "@/lib/pointers"
import { RankBadge } from "@/components/game/rank-badge"

type LeaderboardEntry = {
  userId: string
  points: number
  exactScores: number
  correctResults: number
  user?: User
  rank?: number
  pointerPoints?: number
  totalPoints?: number
}

import type { CompetitionCode } from "@/lib/competition-config"

type LeaderboardTableProps = {
  matchweekId: string
  competition?: CompetitionCode
  privateLeagueId?: string
}

export default function LeaderboardTable({
  matchweekId,
  competition = "PL",
  privateLeagueId,
}: LeaderboardTableProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [teamMap, setTeamMap] = useState<Record<string, Team>>({})

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({ matchweekId })
        if (competition) params.set("competition", competition)
        if (privateLeagueId) params.set("league", privateLeagueId)
        const res = await fetch(`/api/leaderboard?${params.toString()}`)
        if (!res.ok) throw new Error("Failed to load leaderboard data")
        const data = await res.json()

        if (cancelled) return

        const leaderboard: LeaderboardEntry[] = Array.isArray(data.leaderboard) ? data.leaderboard : []
        const teams: Record<string, Team> = data.allTeams
          ? Object.fromEntries((data.allTeams as Team[]).map((t) => [t.id, t]))
          : (data.teams ?? {})

        const leaderboardWithPointers = leaderboard
          .map((entry) => {
            const pointerPoints = calculateMatchweekPointerPoints(entry.userId, matchweekId)
            return {
              ...entry,
              pointerPoints,
              totalPoints: entry.points + pointerPoints,
            }
          })
          .sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0) || b.exactScores - a.exactScores)

        leaderboardWithPointers.forEach((entry, index) => {
          entry.rank = index + 1
        })

        setEntries(leaderboardWithPointers)
        setTeamMap(teams)
        setLoading(false)
      } catch (err: unknown) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load leaderboard data")
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [matchweekId, competition, privateLeagueId])

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading matchweek leaderboard...</div>
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-4 text-pl-purple opacity-20" />
        <p className="text-lg">No data available for this matchweek yet</p>
        <p className="text-sm">Check back after matches have been played</p>
      </div>
    )
  }

  return (
    <>
      <div className="md:hidden space-y-2">
        {entries.map((entry) => {
          const supportedTeam = entry.user?.supportedTeam ? teamMap[entry.user.supportedTeam] : null
          return (
            <div key={entry.userId} className="game-card p-3 flex items-center gap-3">
              <RankBadge rank={entry.rank ?? 0} />
              <Avatar className="w-9 h-9 shrink-0">
                <AvatarImage src={entry.user?.profilePicture || "/placeholder.svg"} />
                <AvatarFallback className="bg-pl-purple text-white text-xs">
                  {entry.user?.name?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{entry.user?.name ?? "Unknown"}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.exactScores} exact · {entry.correctResults} results
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold">{entry.totalPoints}</p>
                <p className="text-xs text-muted-foreground">
                  {(entry.pointerPoints ?? 0) > 0 ? "+" : ""}
                  {entry.pointerPoints ?? 0} ptr
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Rank</th>
            <th className="text-left py-3 px-4">User</th>
            <th className="text-center py-3 px-4">Total Points</th>
            <th className="text-center py-3 px-4">Match Points</th>
            <th className="text-center py-3 px-4">Pointer Points</th>
            <th className="text-center py-3 px-4">Exact Scores</th>
            <th className="text-center py-3 px-4">Correct Results</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const supportedTeam = entry.user?.supportedTeam ? teamMap[entry.user.supportedTeam] : null

            return (
              <tr
                key={entry.userId}
                className={`border-b hover:bg-muted/50 ${
                  entry.rank === 1
                    ? "bg-yellow-50 dark:bg-yellow-900/10"
                    : entry.rank === 2
                      ? "bg-gray-50 dark:bg-gray-800/10"
                      : entry.rank === 3
                        ? "bg-amber-50 dark:bg-amber-900/10"
                        : ""
                }`}
              >
                <td className="py-3 px-4 font-medium">
                  <div className="flex items-center justify-center w-8 h-8 mr-2">{entry.rank}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={entry.user?.profilePicture || "/placeholder.svg"} />
                      <AvatarFallback className="bg-pl-purple text-white text-xs">
                        {entry.user?.name?.charAt(0) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{entry.user?.name ?? "Unknown"}</span>
                      {supportedTeam && (
                        <img
                          src={supportedTeam.logo}
                          alt={supportedTeam.name}
                          className="w-5 h-5"
                          style={{ background: "white", borderRadius: "50%" }}
                        />
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="font-bold text-lg">{entry.totalPoints}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="font-medium">{entry.points}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`font-medium ${(entry.pointerPoints ?? 0) > 0 ? "text-green-600" : (entry.pointerPoints ?? 0) < 0 ? "text-red-600" : ""}`}
                  >
                    {(entry.pointerPoints ?? 0) > 0
                      ? `+${entry.pointerPoints}`
                      : entry.pointerPoints}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-sm font-medium text-green-700 dark:text-green-300">
                    {entry.exactScores}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-sm font-medium text-blue-700 dark:text-blue-300">
                    {entry.correctResults}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
    </>
  )
}
