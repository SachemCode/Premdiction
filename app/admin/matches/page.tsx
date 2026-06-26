"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Calendar, Play, CheckCircle, Clock } from "lucide-react"
import { updateMatchStatusAction } from "@/app/admin/actions"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"

export default function MatchesPage() {
  const searchParams = useSearchParams()
  const matchweekId = searchParams.get("matchweek") || ""
  const [matches, setMatches] = useState<any[]>([])
  const [matchweek, setMatchweek] = useState<any | null>(null)
  const [teams, setTeams] = useState<any[]>([])
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const url = matchweekId ? `/api/matches?matchweek=${matchweekId}` : "/api/matches"
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setMatches(data.matches || [])
        setTeams(data.teams || [])
        setMatchweek(data.matchweek || null)
      })
      .catch(console.error)
  }, [matchweekId])

  const handleStatusChange = async (matchId: string, status: "active" | "completed" | "upcoming") => {
    setIsUpdating((prev) => ({ ...prev, [matchId]: true }))

    try {
      await updateMatchStatusAction({ matchId, status })

      toast({
        title: "Status updated",
        description: `Match status has been updated to ${status}`,
      })

      // Force a refresh of the page to show updated data
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update match status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating((prev) => ({ ...prev, [matchId]: false }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {matchweek ? `Manage Matches for Matchweek ${matchweek.number}` : "Manage Matches"}
          </h1>
          <p className="text-muted-foreground">Manage Premier League matches</p>
        </div>
      </div>

      <div className="grid gap-4">
        {matches.map((match: any) => {
          const homeTeam = teams.find((team: any) => team.id === match.homeTeamId) || {}
          const awayTeam = teams.find((team: any) => team.id === match.awayTeamId) || {}
          return (
            <Card key={match.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {homeTeam.name} vs {awayTeam.name}
                  </CardTitle>
                  <CardDescription>
                    {matchweek ? `Matchweek ${matchweek.number} - ` : ""}{new Date(match.kickoff).toLocaleString()}
                  </CardDescription>
                </div>
                <Badge
                  variant={match.status === "completed" ? "secondary" : match.status === "active" ? "default" : "outline"}
                >
                  {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 flex items-center justify-center">
                        <img
                          src={homeTeam.logo || `/placeholder.svg?height=40&width=40`}
                          alt={homeTeam.name || "Home Team"}
                          className="max-w-full max-h-full"
                        />
                      </div>
                      <div className="text-sm font-medium mt-1">{homeTeam.shortName}</div>
                    </div>

                    <div className="text-2xl font-bold">
                      {match.homeScore !== null && match.awayScore !== null
                        ? `${match.homeScore} - ${match.awayScore}`
                        : "vs"}
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 flex items-center justify-center">
                        <img
                          src={awayTeam.logo || `/placeholder.svg?height=40&width=40`}
                          alt={awayTeam.name || "Away Team"}
                          className="max-w-full max-h-full"
                        />
                      </div>
                      <div className="text-sm font-medium mt-1">{awayTeam.shortName}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {match.status !== "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(match.id, "active")}
                        disabled={isUpdating[match.id]}
                        className="flex items-center gap-1"
                      >
                        <Play className="h-4 w-4" />
                        {isUpdating[match.id] ? "Updating..." : "Set Active"}
                      </Button>
                    )}

                    {match.status !== "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(match.id, "completed")}
                        disabled={isUpdating[match.id]}
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {isUpdating[match.id] ? "Updating..." : "Mark Completed"}
                      </Button>
                    )}

                    {match.status !== "upcoming" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(match.id, "upcoming")}
                        disabled={isUpdating[match.id]}
                        className="flex items-center gap-1"
                      >
                        <Clock className="h-4 w-4" />
                        {isUpdating[match.id] ? "Updating..." : "Set Upcoming"}
                      </Button>
                    )}

                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/matches/${match.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>

                    {match.status !== "completed" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/results/${match.id}`}>Enter Result</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
