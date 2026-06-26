import { NextResponse } from "next/server"
import {
  getMatchweeks,
  getMatches,
  getUsers,
  getPredictions,
  getTeams,
} from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const [matchweeks, matches, users, predictions, teams] = await Promise.all([
    getMatchweeks(),
    getMatches(),
    getUsers(),
    getPredictions(),
    getTeams(),
  ])

  return NextResponse.json({ matchweeks, matches, users, predictions, teams })
}
