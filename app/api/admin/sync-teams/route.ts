import { NextResponse } from "next/server"
import { syncTeams } from "@/lib/football-data/sync-teams"
import { invalidateDataCache } from "@/lib/data-cache"

export async function POST() {
  try {
    const result = await syncTeams()
    invalidateDataCache()
    return NextResponse.json({
      success: true,
      count: result.count,
      competition: result.competition,
      season: result.season,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Team sync failed"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
