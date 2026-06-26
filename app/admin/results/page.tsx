import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getMatches, getTeam, getMatchweek, getTeams } from "@/lib/db"
import { Calendar } from "lucide-react"
import AddResultForm from '@/components/AddResultForm'

export default async function AddResultPage() {
  const matches = await getMatches()
  const teams = await getTeams()
  return (
    <div className="max-w-xl mx-auto mt-8">
      <AddResultForm matches={matches} teams={teams} />
    </div>
  )
}
