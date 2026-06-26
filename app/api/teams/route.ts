import { NextResponse } from "next/server"
import { getTeams } from "@/lib/db"

export async function GET() {
  const teams = await getTeams()
  return NextResponse.json(teams)
}
