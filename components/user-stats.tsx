/**
 * UserStats Component
 * 
 * This component displays comprehensive statistics for the current user's prediction performance.
 * It includes:
 * - Overall performance metrics
 * - Match prediction statistics
 * - Pointer prediction statistics
 * - Best performance highlights
 * 
 * Features:
 * - User profile display with supported team
 * - Total points calculation (match points + pointer points)
 * - Prediction accuracy tracking
 * - Visual progress bars for key metrics
 * - Pointer prediction success rate
 * - Responsive grid layout
 * 
 * State Management:
 * - Uses authentication context for user data
 * - Calculates pointer statistics
 * - Computes accuracy percentages
 * 
 * Visual Elements:
 * - Progress bars for key metrics
 * - Color-coded statistics
 * - Icon-based metric indicators
 * - Card-based layout for different stat categories
 */

"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, Percent, Award, Star, TrendingUp, User, CheckCircle, AlertTriangle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import type { Team } from "@/lib/types"
import {
  calculateMatchweekPointerPoints,
  getAllUserPointerSelections,
  getAllMatchPointerOutcomes,
} from "@/lib/pointers"

export default function UserStats() {
  const { user } = useAuth()
  const [supportedTeam, setSupportedTeam] = useState<Team | null>(null)

  useEffect(() => {
    if (!user?.supportedTeam) {
      setSupportedTeam(null)
      return
    }
    fetch(`/api/teams/${user.supportedTeam}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((team) => setSupportedTeam(team))
      .catch(() => setSupportedTeam(null))
  }, [user?.supportedTeam])

  // Show sign-in prompt if user is not authenticated
  if (!user) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <User className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p className="text-lg">Please sign in to view your stats</p>
        <Button asChild className="mt-4 bg-pl-purple hover:bg-pl-purple/90 text-white">
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </div>
    )
  }

  // Mock stats data - In a real app, these would be fetched from the database
  const stats = {
    totalPoints: 14,
    exactScores: 2,
    correctResults: 4,
    totalPredictions: 8,
    accuracy: 75, // percentage
    bestMatchweek: {
      number: 2,
      points: 7,
    },
  }

  // Calculate pointer statistics
  const pointerSelections = getAllUserPointerSelections().filter((selection) => selection.userId === user.id)
  const pointerOutcomes = getAllMatchPointerOutcomes()

  // Initialize pointer statistics counters
  let correctPointers = 0
  let incorrectPointers = 0
  let totalPointerPoints = 0

  // Calculate pointer success/failure counts
  pointerSelections.forEach((selection) => {
    const matchOutcome = pointerOutcomes.find((outcome) => outcome.matchId === selection.matchId)
    if (matchOutcome) {
      selection.selectedPointers.forEach((pointerId) => {
        const outcome = matchOutcome.pointerOutcomes.find((o) => o.pointerId === pointerId)
        if (outcome) {
          if (outcome.occurred) {
            correctPointers++
          } else {
            incorrectPointers++
          }
        }
      })
    }
  })

  // Calculate total pointer points across all matchweeks
  const matchweekIds = ["mw_1", "mw_2", "mw_3"] // In a real app, get this from the database
  matchweekIds.forEach((matchweekId) => {
    totalPointerPoints += calculateMatchweekPointerPoints(user.id, matchweekId)
  })

  return (
    <div className="space-y-6">
      {/* User Profile Header */}
      <div className="bg-pl-gradient rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* User Avatar */}
          <Avatar className="w-20 h-20 border-2 border-white">
            <AvatarImage src={user.profilePicture || "/placeholder.svg"} />
            <AvatarFallback className="bg-white/20 text-white text-2xl">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {/* User Info and Stats Summary */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-1">{user.name}</h3>
            <div className="text-4xl font-bold">{stats.totalPoints + totalPointerPoints} points</div>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
              <p className="text-white/80">
                {stats.totalPredictions} predictions ({stats.accuracy}% accuracy)
              </p>
              {/* Supported Team Badge */}
              {supportedTeam && (
                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                  <div className="w-4 h-4">
                    <img
                      src={supportedTeam.logo || `/placeholder.svg?height=16&width=16`}
                      alt={supportedTeam.name}
                      className="max-w-full max-h-full"
                    />
                  </div>
                  <span className="text-xs">{supportedTeam.shortName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Exact Scores Card */}
        <Card className="pl-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exact Scores</CardTitle>
            <Target className="h-4 w-4 text-pl-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.exactScores}</div>
            {/* Progress bar showing exact scores percentage */}
            <div className="flex items-center mt-1">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-pl-green h-2 rounded-full"
                  style={{ width: `${(stats.exactScores / stats.totalPredictions) * 100}%` }}
                ></div>
              </div>
              <span className="ml-2 text-xs text-muted-foreground">
                {Math.round((stats.exactScores / stats.totalPredictions) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Correct Results Card */}
        <Card className="pl-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Correct Results</CardTitle>
            <Star className="h-4 w-4 text-pl-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.correctResults}</div>
            {/* Progress bar showing correct results percentage */}
            <div className="flex items-center mt-1">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-pl-cyan h-2 rounded-full"
                  style={{ width: `${(stats.correctResults / stats.totalPredictions) * 100}%` }}
                ></div>
              </div>
              <span className="ml-2 text-xs text-muted-foreground">
                {Math.round((stats.correctResults / stats.totalPredictions) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Overall Accuracy Card */}
        <Card className="pl-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Percent className="h-4 w-4 text-pl-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accuracy}%</div>
            <p className="text-xs text-muted-foreground">Correct results or exact scores</p>
          </CardContent>
        </Card>

        {/* Best Matchweek Card */}
        <Card className="pl-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Matchweek</CardTitle>
            <Award className="h-4 w-4 text-pl-red" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bestMatchweek.points} pts</div>
            <p className="text-xs text-muted-foreground">Matchweek {stats.bestMatchweek.number}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pointer Statistics Section */}
      <Card className="pl-card-alt">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Pointer Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Pointer Stats Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Total Pointer Points */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Total Pointer Points</h3>
                <span
                  className={`text-lg font-bold ${totalPointerPoints > 0 ? "text-green-600" : totalPointerPoints < 0 ? "text-red-600" : ""}`}
                >
                  {totalPointerPoints > 0 ? `+${totalPointerPoints}` : totalPointerPoints}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Points earned from special event predictions</p>
            </div>

            {/* Correct Pointers */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Correct Pointers</h3>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-lg font-bold">{correctPointers}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Special events correctly predicted</p>
            </div>

            {/* Incorrect Pointers */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Incorrect Pointers</h3>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-lg font-bold">{incorrectPointers}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Special events incorrectly predicted</p>
            </div>
          </div>

          {/* Pointer Accuracy Progress Bar */}
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Pointer Accuracy</div>
            <div className="w-full bg-muted rounded-full h-3">
              {correctPointers + incorrectPointers > 0 ? (
                <div
                  className="bg-pl-green h-3 rounded-full"
                  style={{ width: `${(correctPointers / (correctPointers + incorrectPointers)) * 100}%` }}
                ></div>
              ) : (
                <div className="bg-gray-300 h-3 rounded-full w-0"></div>
              )}
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>
                Success Rate:{" "}
                {correctPointers + incorrectPointers > 0
                  ? Math.round((correctPointers / (correctPointers + incorrectPointers)) * 100)
                  : 0}
                %
              </span>
              <span>
                {correctPointers} of {correctPointers + incorrectPointers} correct
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="pl-card-alt">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <p>Performance chart will appear here as you make more predictions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
