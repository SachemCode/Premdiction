import { NextResponse } from 'next/server'
import { getMatches, getMatchesByMatchweek, getTeams, getMatchweek, createMatch } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const matchweekId = searchParams.get('matchweek')

  const [matchList, teamList, matchweek] = await Promise.all([
    matchweekId ? getMatchesByMatchweek(matchweekId) : getMatches(),
    getTeams(),
    matchweekId ? getMatchweek(matchweekId) : Promise.resolve(null),
  ])

  return NextResponse.json({ matches: matchList, teams: teamList, matchweek })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { homeTeamId, awayTeamId, matchweekId, kickoffTime, kickoff, venue, status } = body

    const kickoffValue = kickoffTime || kickoff
    if (!homeTeamId || !awayTeamId || !matchweekId || !kickoffValue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const match = await createMatch({
      homeTeamId,
      awayTeamId,
      matchweekId,
      kickoff: kickoffValue,
      venue,
      status,
    })

    return NextResponse.json(match)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
