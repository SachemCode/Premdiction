import { NextResponse } from "next/server"
import { syncFixtures } from "@/lib/football-data/sync-fixtures"
import { invalidateDataCache } from "@/lib/data-cache"
import { isWcEventEnabled } from "@/lib/competition-config"

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false

  const authHeader = request.headers.get("authorization")
  if (authHeader === `Bearer ${secret}`) return true

  const url = new URL(request.url)
  return url.searchParams.get("secret") === secret
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  if (!isWcEventEnabled()) {
    return NextResponse.json({ success: true, skipped: true, reason: "WC event disabled" })
  }

  try {
    const result = await syncFixtures("WC")
    invalidateDataCache()
    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      matchweekCount: result.matchweekCount,
      matchCount: result.matchCount,
      competition: result.competition,
      season: result.season,
      warning: result.warning,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "WC fixture sync failed"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
