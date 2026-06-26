"use client"

import type { User } from "@/lib/types"
import type { CompetitionCode } from "@/lib/competition-config"
import { getMatchweekTabLabel } from "@/lib/competition-config"
import { Trophy, ChevronUp, ChevronDown, Minus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { calculateMatchweekPointerPoints } from "@/lib/pointers"
import { RankBadge } from "@/components/game/rank-badge"

export type MainLeaderboardInitialData = {
  matchweeks: Array<{
    id: string
    number: number
    status: string
    label?: string
  }>
  leaderboards: Array<
    Array<{
      userId: string
      points: number
      exactScores: number
      correctResults: number
      user?: User
    }>
  >
  teams: Record<string, { id: string; name: string; logo: string }>
}

type MainLeaderboardProps = {
  initialData?: MainLeaderboardInitialData
  competition?: CompetitionCode
}

export default function MainLeaderboard({ initialData, competition = "PL" }: MainLeaderboardProps) {
  const matchweeks = initialData?.matchweeks ?? []
  const leaderboards = initialData?.leaderboards ?? []
  const teams = initialData?.teams ?? {}
  const showPointers = competition === "PL"

  if (!initialData) {
    return (
      <div className="text-center py-12 text-muted-foreground">Loading leaderboard...</div>
    )
  }

  if (matchweeks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-4 text-pl-purple opacity-20" />
        <p className="text-lg">No data available yet</p>
        <p className="text-sm">Check back after matches have been played</p>
      </div>
    )
  }

  const userPoints: Record<
    string,
    {
      userId: string
      points: number
      pointerPoints: number
      exactScores: number
      correctResults: number
      matchweekPoints: Record<string, { match: number; pointer: number }>
      previousRank?: number
      user?: User
    }
  > = {}

  leaderboards.forEach((leaderboard, mwIndex) => {
    const matchweek = matchweeks[mwIndex]
    leaderboard.forEach((entry, rank) => {
      if (!userPoints[entry.userId]) {
        userPoints[entry.userId] = {
          userId: entry.userId,
          points: 0,
          pointerPoints: 0,
          exactScores: 0,
          correctResults: 0,
          matchweekPoints: {},
          user: entry.user,
        }
      }
      const pointerPoints = showPointers
        ? calculateMatchweekPointerPoints(entry.userId, matchweek.id)
        : 0
      userPoints[entry.userId].points += entry.points
      userPoints[entry.userId].pointerPoints += pointerPoints
      userPoints[entry.userId].exactScores += entry.exactScores
      userPoints[entry.userId].correctResults += entry.correctResults
      userPoints[entry.userId].matchweekPoints[matchweek.id] = {
        match: entry.points,
        pointer: pointerPoints,
      }
      if (mwIndex === matchweeks.length - 2) {
        userPoints[entry.userId].previousRank = rank + 1
      }
      userPoints[entry.userId].user = entry.user
    })
  })

  const leaderboard = Object.values(userPoints)
    .sort((a, b) => b.points + b.pointerPoints - (a.points + a.pointerPoints) || b.exactScores - a.exactScores)
    .map((entry, index) => ({
      ...entry,
      totalPoints: entry.points + entry.pointerPoints,
      rank: index + 1,
    }))

  const currentMatchweek = matchweeks.find((mw) => mw.status === "active")
  const currentLabel = currentMatchweek
    ? getMatchweekTabLabel(currentMatchweek, competition)
    : "Current"
  const topThree = leaderboard.slice(0, 3)

  return (
    <div className="space-y-4">
      {topThree.length > 0 && (
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {topThree.map((entry, i) => {
            const supportedTeam =
              entry.user && entry.user.supportedTeam ? teams[entry.user.supportedTeam] : null
            const order = i === 0 ? "order-2" : i === 1 ? "order-1" : "order-3"
            const scale = i === 0 ? "md:scale-105" : ""
            return (
              <div
                key={entry.userId}
                className={`game-card p-3 md:p-4 flex flex-col items-center text-center ${order} ${scale}`}
              >
                <RankBadge rank={entry.rank} className="mb-2" />
                <Avatar className="w-10 h-10 md:w-12 md:h-12">
                  <AvatarImage src={entry.user?.profilePicture || "/placeholder.svg"} />
                  <AvatarFallback className="bg-pl-purple text-white text-xs">
                    {entry.user?.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <p className="font-bold text-sm mt-2 truncate w-full">{entry.user?.name || "Unknown"}</p>
                {supportedTeam && (
                  <img src={supportedTeam.logo} alt="" className="w-4 h-4 mt-1 rounded-full bg-white" />
                )}
                <p className="text-xl font-bold text-pl-purple mt-2">{entry.totalPoints}</p>
                <p className="text-xs text-muted-foreground">pts</p>
              </div>
            )
          })}
        </div>
      )}

      <div className="md:hidden space-y-2">
        {leaderboard.map((entry) => {
          const supportedTeam =
            entry.user && entry.user.supportedTeam ? teams[entry.user.supportedTeam] : null
          const currentMatchweekPoints = currentMatchweek
            ? (entry.matchweekPoints[currentMatchweek.id]?.match || 0) +
              (entry.matchweekPoints[currentMatchweek.id]?.pointer || 0)
            : 0
          return (
            <div key={entry.userId} className="game-card p-3 flex items-center gap-3">
              <RankBadge rank={entry.rank} />
              <Avatar className="w-9 h-9 shrink-0">
                <AvatarImage src={entry.user?.profilePicture || "/placeholder.svg"} />
                <AvatarFallback className="bg-pl-purple text-white text-xs">
                  {entry.user?.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{entry.user?.name || "Unknown"}</p>
                {supportedTeam && (
                  <p className="text-xs text-muted-foreground truncate">{supportedTeam.name}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold">{entry.totalPoints}</p>
                {currentMatchweek && (
                  <p className="text-xs text-muted-foreground">{currentLabel}: {currentMatchweekPoints}</p>
                )}
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
              {showPointers && <th className="text-center py-3 px-4">Pointer Points</th>}
              <th className="text-center py-3 px-4">{currentLabel}</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => {
              const supportedTeam =
                entry.user && entry.user.supportedTeam ? teams[entry.user.supportedTeam] : null
              const currentMatchweekPoints = currentMatchweek
                ? (entry.matchweekPoints[currentMatchweek.id]?.match || 0) +
                  (entry.matchweekPoints[currentMatchweek.id]?.pointer || 0)
                : 0
              let rankChange = 0
              if (entry.previousRank) {
                rankChange = entry.previousRank - entry.rank
              }

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
                    <div className="flex items-center">
                      {entry.rank === 1 ? (
                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-yellow-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center">{entry.rank}</div>
                      )}
                      {rankChange !== 0 && (
                        <div className={`ml-1 ${rankChange > 0 ? "trend-up" : rankChange < 0 ? "trend-down" : ""}`}>
                          {rankChange > 0 ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : rankChange < 0 ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <Minus className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={entry.user?.profilePicture || "/placeholder.svg"} />
                        <AvatarFallback className="bg-pl-purple text-white text-xs">
                          {entry.user?.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{entry.user?.name || "Unknown"}</span>
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
                  {showPointers && (
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-medium ${entry.pointerPoints > 0 ? "text-green-600" : entry.pointerPoints < 0 ? "text-red-600" : ""}`}
                      >
                        {entry.pointerPoints > 0 ? `+${entry.pointerPoints}` : entry.pointerPoints}
                      </span>
                    </td>
                  )}
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-pl-purple/10 px-2.5 py-0.5 text-sm font-medium text-pl-purple">
                      {currentMatchweekPoints}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
