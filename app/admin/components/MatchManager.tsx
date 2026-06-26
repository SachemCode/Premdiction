"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { Team, Matchweek } from "@/lib/types"

interface MatchFormProps {
  onSubmit: (match: {
    homeTeamId: string
    awayTeamId: string
    matchweekId: string
    kickoffTime: string
  }) => Promise<void>
}

function MatchForm({ onSubmit }: MatchFormProps) {
  const [homeTeamId, setHomeTeamId] = useState("")
  const [awayTeamId, setAwayTeamId] = useState("")
  const [matchweekId, setMatchweekId] = useState("")
  const [kickoffTime, setKickoffTime] = useState("")

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      onSubmit({
        homeTeamId,
        awayTeamId,
        matchweekId,
        kickoffTime,
      })
    }}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Home Team</label>
          <Select
            value={homeTeamId}
            onValueChange={setHomeTeamId}
            placeholder="Select home team"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Away Team</label>
          <Select
            value={awayTeamId}
            onValueChange={setAwayTeamId}
            placeholder="Select away team"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Matchweek</label>
          <Select
            value={matchweekId}
            onValueChange={setMatchweekId}
            placeholder="Select matchweek"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kickoff Time</label>
          <Input
            type="datetime-local"
            value={kickoffTime}
            onChange={(e) => setKickoffTime(e.target.value)}
          />
        </div>
        <Button type="submit">Create Match</Button>
      </div>
    </form>
  )
}

export default function MatchManager() {
  const [teams, setTeams] = useState<Team[]>([])
  const [matchweeks, setMatchweeks] = useState<Matchweek[]>([])

  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch(console.error)
    fetch("/api/matchweeks")
      .then((res) => res.json())
      .then((data) => setMatchweeks(data))
      .catch(console.error)
  }, [])

  const handleSubmit = async (matchData: {
    homeTeamId: string
    awayTeamId: string
    matchweekId: string
    kickoffTime: string
  }) => {
    // TODO: Implement API call to create match
    console.log('Creating match:', matchData)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Create New Match</h2>
      <MatchForm onSubmit={handleSubmit} />
    </div>
  )
}
