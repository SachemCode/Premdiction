import { NextResponse } from "next/server"
import { getPredictions } from "@/lib/db"

export async function GET() {
  const predictions = await getPredictions()
  return NextResponse.json(predictions)
}
