import { NextResponse } from "next/server"
import { getTeam } from "@/lib/db"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const team = await getTeam(params.id)
  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 })
  }
  return NextResponse.json(team)
}
