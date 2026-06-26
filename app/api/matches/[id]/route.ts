import { NextResponse } from "next/server"
import { getMatch, getTeam } from "@/lib/db"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const match = await getMatch(params.id)

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 })
  }

  const [homeTeam, awayTeam] = await Promise.all([
    getTeam(match.homeTeamId),
    getTeam(match.awayTeamId),
  ])

  return NextResponse.json({ match, homeTeam, awayTeam })
}
