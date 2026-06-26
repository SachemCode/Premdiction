"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CalendarDays, Users, CheckCircle } from "lucide-react"
import MatchweekLauncher from "@/components/MatchweekLauncher"
import MatchManager from "@/app/admin/components/MatchManager"

export default function AdminPage() {
  const [matchweeks, setMatchweeks] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setMatchweeks(data.matchweeks || [])
        setMatches(data.matches || [])
        setUsers(data.users || [])
        setPredictions(data.predictions || [])
      })
      .catch(console.error)
  }, [])

  const activeMatchweek = matchweeks.find((mw: any) => mw.status === "active")
  const completedMatches = matches.filter((m: any) => m.status === "completed")
  const pendingMatches = matches.filter((m: any) => m.status === "scheduled")
  const liveMatches = matches.filter((m: any) => m.status === "live")
  const avgPredictionsPerUser = users.length > 0 ? (predictions.length / users.length).toFixed(1) : "0.0"

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Match Management</h2>
          <MatchManager />
        </div>
        <MatchweekLauncher matchweeks={matchweeks} initialMatches={matches} />
      </div>
      <hr className="my-8" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your Premier League prediction game</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Matchweeks</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{matchweeks.length}</div>
              {activeMatchweek && (
                <p className="text-xs text-muted-foreground">Current: Matchweek {activeMatchweek.number}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Matches</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{matches.length}</div>
              <p className="text-xs text-muted-foreground">
                {completedMatches.length} completed, {liveMatches.length} live, {pendingMatches.length} upcoming
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Predictions</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{predictions.length}</div>
              <p className="text-xs text-muted-foreground">Avg {avgPredictionsPerUser} per user</p>
            </CardContent>
          </Card>
        </div>
        <Button asChild>
          <Link href="/admin/matchweeks">Manage Matchweeks</Link>
        </Button>
      </div>
    </>
  )
}
