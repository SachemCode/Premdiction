import { getMatchweek, updateMatchweek, deleteMatchweek } from '@/lib/db'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const data = await getMatchweek(params.id)
  if (!data) {
    return new Response(JSON.stringify({ error: 'Matchweek not found' }), { status: 404 })
  }
  return Response.json(data)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const data = await updateMatchweek(params.id, body)
  if (!data) {
    return new Response(JSON.stringify({ error: 'Matchweek not found' }), { status: 404 })
  }
  return Response.json(data)
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const success = await deleteMatchweek(params.id)
  if (!success) {
    return new Response(JSON.stringify({ error: 'Matchweek not found' }), { status: 404 })
  }
  return Response.json({ success: true })
}
