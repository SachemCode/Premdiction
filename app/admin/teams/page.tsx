"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Team } from "@/lib/types"
import { TeamLogo } from "@/components/team-logo"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw } from "lucide-react"

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useToast()

  const loadTeams = useCallback(() => {
    setIsLoading(true)
    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => setTeams(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    loadTeams()
  }, [loadTeams])

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const res = await fetch("/api/admin/sync-teams", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Sync failed")

      toast({
        title: "Teams synced",
        description: `Imported ${data.count} EPL teams for season ${data.season}`,
      })
      loadTeams()
    } catch (error) {
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Could not sync teams",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Premier League Teams</h1>
          <p className="text-muted-foreground">Teams and crests synced from football-data.org</p>
        </div>
        <Button onClick={handleSync} disabled={isSyncing} className="bg-pl-purple hover:bg-pl-purple/90 text-white">
          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing..." : "Sync EPL Teams"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Season Squads</CardTitle>
          <CardDescription>
            {teams.length > 0
              ? `${teams.length} teams loaded from the database`
              : "No teams yet — click Sync EPL Teams to import from football-data.org"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading teams...</p>
          ) : teams.length === 0 ? (
            <p className="text-muted-foreground text-sm">Run a sync to populate Premier League teams and logos.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {teams.map((team) => (
                <div key={team.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <TeamLogo teamId={team.id} logo={team.logo} alt={team.name} size={48} />
                  <div className="flex-1">
                    <h3 className="font-medium">{team.name}</h3>
                    <p className="text-sm text-muted-foreground">{team.shortName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
