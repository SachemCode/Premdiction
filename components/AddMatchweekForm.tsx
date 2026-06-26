"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddMatchweekForm() {
  const [number, setNumber] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("upcoming");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/matchweeks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number, startDate, endDate, status }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to add matchweek");
    } else {
      setNumber(1);
      setStartDate("");
      setEndDate("");
      setStatus("upcoming");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-white">
      <h2 className="text-lg font-bold mb-2">Add Matchweek</h2>
      <div className="mb-2">
        <label className="block mb-1">Number</label>
        <input type="number" value={number} onChange={e => setNumber(Number(e.target.value))} className="border rounded px-2 py-1 w-full" required />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Start Date</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded px-2 py-1 w-full" required />
      </div>
      <div className="mb-2">
        <label className="block mb-1">End Date</label>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded px-2 py-1 w-full" required />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-2 py-1 w-full">
          <option value="upcoming">Upcoming</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? "Adding..." : "Add Matchweek"}
      </button>
    </form>
  );
}
