import { NextResponse } from 'next/server'
import { launchMatchweek } from '@/lib/db'
import type { CompetitionCode } from '@/lib/competition-config'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { matchIds, competition } = await request.json()
    const comp: CompetitionCode =
      competition === 'WC' ? 'WC' : competition === 'PL' ? 'PL' : params.id.startsWith('WC_') ? 'WC' : 'PL'
    await launchMatchweek(params.id, matchIds || [], comp)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error launching matchweek:', error)
    const message = error instanceof Error ? error.message : 'Failed to launch matchweek'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
