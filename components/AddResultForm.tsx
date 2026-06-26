"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateMatchResultAction } from "@/app/admin/actions";

interface AddResultFormProps {
  matches: { id: string; homeTeamId: string; awayTeamId: string; homeScore: number | null; awayScore: number | null; status: string }[];
  teams: { id: string; name: string }[];
}

export default function AddResultForm({ matches, teams }: AddResultFormProps) {
  const [matchId, setMatchId] = useState(matches[0]?.id || "");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await updateMatchResultAction({
        matchId,
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
      });
      setHomeScore("");
      setAwayScore("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save result");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-white">
      <h2 className="text-lg font-bold mb-2">Enter Match Result</h2>
      <div className="mb-2">
        <label className="block mb-1">Match</label>
        <select value={matchId} onChange={e => setMatchId(e.target.value)} className="border rounded px-2 py-1 w-full">
          {matches.map(match => (
            <option key={match.id} value={match.id}>
              {getTeamName(match.homeTeamId)} vs {getTeamName(match.awayTeamId)}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-2">
        <label className="block mb-1">Home Score</label>
        <input type="number" value={homeScore} onChange={e => setHomeScore(e.target.value)} className="border rounded px-2 py-1 w-full" required />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Away Score</label>
        <input type="number" value={awayScore} onChange={e => setAwayScore(e.target.value)} className="border rounded px-2 py-1 w-full" required />
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? "Saving..." : "Save Result"}
      </button>
    </form>
  );
}
