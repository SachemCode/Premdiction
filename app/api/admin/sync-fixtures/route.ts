import { NextResponse } from "next/server"
import { syncFixtures } from "@/lib/football-data/sync-fixtures"
import { invalidateDataCache } from "@/lib/data-cache"
import type { CompetitionCode } from "@/lib/competition-config"

export async function POST(request: Request) {
  try {
    let competition: CompetitionCode | undefined
    try {
      const body = await request.json()
      if (body?.competition === "WC" || body?.competition === "PL") {
        competition = body.competition
      }
    } catch {
      // empty body is fine — uses env default
    }

    const result = await syncFixtures(competition)
    invalidateDataCache()
    return NextResponse.json({
      success: true,
      matchweekCount: result.matchweekCount,
      matchCount: result.matchCount,
      competition: result.competition,
      season: result.season,
      warning: result.warning,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fixture sync failed"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
