import { NextRequest } from 'next/server'
import { getMatchesByMatchweek } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const matchweekId = params.id
  const matches = await getMatchesByMatchweek(matchweekId)
  return new Response(JSON.stringify(matches), { status: 200 })
} 