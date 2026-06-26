"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { getKnockoutRoundName } from "@/lib/competition-config"

interface MatchweekLauncherProps {
  matchweeks: any[]
  initialMatches: any[]
  competition?: "PL" | "WC"
}

export default function MatchweekLauncher({
  matchweeks,
  initialMatches,
  competition = "PL",
}: MatchweekLauncherProps) {
  const [selectedMatchweek, setSelectedMatchweek] = useState<string>(matchweeks[0]?.id || "")
  const [matches, setMatches] = useState<any[]>(initialMatches)
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set(initialMatches.map((m: any) => m.id)))
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMatches() {
      if (!selectedMatchweek) return
      const res = await fetch(`/api/matchweeks/${selectedMatchweek}/matches`)
      const ms = await res.json()
      setMatches(ms)
      setSelectedMatches(new Set(ms.map((m: any) => m.id))) // Select all by default
    }
    if (selectedMatchweek !== matchweeks[0]?.id) {
      fetchMatches()
    }
  }, [selectedMatchweek, matchweeks])

  const handleSelectAll = () => {
    setSelectedMatches(new Set(matches.map((m: any) => m.id)))
  }
  const handleDeselectAll = () => {
    setSelectedMatches(new Set())
  }
  const handleToggleMatch = (id: string) => {
    setSelectedMatches((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const handleLaunch = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/matchweeks/${selectedMatchweek}/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchIds: Array.from(selectedMatches), competition }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to launch matchweek')
      setMessage('Matchweek launched successfully!')
    } catch (err: any) {
      setMessage(err.message || 'Failed to launch matchweek')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4 border rounded bg-white">
      <h1 className="text-2xl font-bold mb-4">Launch Matchweek</h1>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Matchweek</label>
        <select
          value={selectedMatchweek}
          onChange={e => setSelectedMatchweek(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        >
          {matchweeks.map(mw => (
            <option key={mw.id} value={mw.id}>
              {competition === "WC"
                ? getKnockoutRoundName(mw)
                : mw.label
                  ? mw.label
                  : `Matchweek ${mw.number}`}{" "}
              ({new Date(mw.startDate).toLocaleDateString()} -{" "}
              {new Date(mw.endDate).toLocaleDateString()})
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Matches</span>
          <div>
            <Button size="sm" variant="outline" onClick={handleSelectAll} className="mr-2">Select All</Button>
            <Button size="sm" variant="outline" onClick={handleDeselectAll}>Deselect All</Button>
          </div>
        </div>
        <ul className="border rounded divide-y">
          {matches.map((match: any) => (
            <li key={match.id} className="flex items-center px-2 py-1">
              <input
                type="checkbox"
                checked={selectedMatches.has(match.id)}
                onChange={() => handleToggleMatch(match.id)}
                className="mr-2"
              />
              <span>
                {match.homeTeamId} vs {match.awayTeamId} — {new Date(match.kickoff).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <Button onClick={handleLaunch} disabled={loading || selectedMatches.size === 0} className="w-full mb-2">
        {loading ? "Launching..." : "Launch Matchweek"}
      </Button>
      {message && <div className="mt-2 text-center text-green-600">{message}</div>}
    </div>
  )
} 