import { getMatchweeks, createMatchweek } from '@/lib/db'

export async function GET() {
  const data = await getMatchweeks()
  return Response.json(data)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { number, startDate, endDate, status } = body
    const matchweek = await createMatchweek({ number, startDate, endDate, status })
    return Response.json(matchweek)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create matchweek'
    return new Response(JSON.stringify({ error: message }), { status: 400 })
  }
}
