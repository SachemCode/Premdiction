"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AddMatchFormProps {
  matchweeks: { id: string; number: number }[];
  teams: { id: string; name: string; [key: string]: any }[];
}

export default function AddMatchForm({ matchweeks, teams }: AddMatchFormProps) {
  const [matchweekId, setMatchweekId] = useState(matchweeks[0]?.id || "");
  const [homeTeamId, setHomeTeamId] = useState(teams[0]?.id || "");
  const [awayTeamId, setAwayTeamId] = useState(teams[1]?.id || "");
  const [kickoff, setKickoff] = useState("");
  const [venue, setVenue] = useState("");
  const [status, setStatus] = useState("scheduled");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const selectedHomeTeam = teams.find(team => team.id === homeTeamId);
    if (selectedHomeTeam && selectedHomeTeam[" Home Stadium"]) {
      setVenue(selectedHomeTeam[" Home Stadium"]);
    }
  }, [homeTeamId, teams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (homeTeamId === awayTeamId) {
      setError("Home and away teams must be different.");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchweekId, homeTeamId, awayTeamId, kickoff, venue, status }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to add match");
    } else {
      setHomeTeamId(teams[0]?.id || "");
      setAwayTeamId(teams[1]?.id || "");
      setKickoff("");
      setVenue("");
      setStatus("scheduled");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-white">
      <h2 className="text-lg font-bold mb-2">Add Match</h2>
      <div className="mb-2">
        <label className="block mb-1">Matchweek</label>
        <select value={matchweekId} onChange={e => setMatchweekId(e.target.value)} className="border rounded px-2 py-1 w-full">
          {matchweeks.map(mw => (
            <option key={mw.id} value={mw.id}>Matchweek {mw.number}</option>
          ))}
        </select>
      </div>
      <div className="mb-2">
        <label className="block mb-1">Home Team</label>
        <select value={homeTeamId} onChange={e => setHomeTeamId(e.target.value)} className="border rounded px-2 py-1 w-full">
          {teams.map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-2">
        <label className="block mb-1">Away Team</label>
        <select value={awayTeamId} onChange={e => setAwayTeamId(e.target.value)} className="border rounded px-2 py-1 w-full">
          {teams.map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-2">
        <label className="block mb-1">Kickoff</label>
        <input type="datetime-local" value={kickoff} onChange={e => setKickoff(e.target.value)} className="border rounded px-2 py-1 w-full" required />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Venue</label>
        <input type="text" value={venue} onChange={e => setVenue(e.target.value)} className="border rounded px-2 py-1 w-full" />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-2 py-1 w-full">
          <option value="scheduled">Scheduled</option>
          <option value="live">Live</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? "Adding..." : "Add Match"}
      </button>
    </form>
  );
}
