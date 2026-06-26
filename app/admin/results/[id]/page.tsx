"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { Match, Team } from "@/lib/types"
import { updateMatchResultAction } from "@/app/admin/actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MatchPointerOutcomes from "./pointers"

export default function EnterResultPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [homeScore, setHomeScore] = useState<string>("")
  const [awayScore, setAwayScore] = useState<string>("")
  const [match, setMatch] = useState<Match | null>(null)
  const [homeTeam, setHomeTeam] = useState<Team | null>(null)
  const [awayTeam, setAwayTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/matches/${params.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.match) {
          setLoading(false)
          return
        }
        setMatch(data.match)
        setHomeTeam(data.homeTeam)
        setAwayTeam(data.awayTeam)
        if (data.match.homeScore !== null) setHomeScore(data.match.homeScore.toString())
        if (data.match.awayScore !== null) setAwayScore(data.match.awayScore.toString())
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Loading match...</div>
  }

  if (!match || !homeTeam || !awayTeam) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Match Not Found</h1>
          <p className="text-muted-foreground">The match you are looking for does not exist</p>
        </div>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await updateMatchResultAction({
        matchId: match.id,
        homeScore: Number.parseInt(homeScore),
        awayScore: Number.parseInt(awayScore),
      })

      toast({
        title: "Result updated",
        description: "The match result has been updated and points calculated.",
      })

      router.push("/admin/results")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update result. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Enter Result</h1>
        <p className="text-muted-foreground">Update the final score and special events for this match</p>
      </div>

      <Tabs defaultValue="score" className="space-y-4">
        <TabsList>
          <TabsTrigger value="score">Match Score</TabsTrigger>
          <TabsTrigger value="pointers">Special Events</TabsTrigger>
        </TabsList>

        <TabsContent value="score">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>
                  {homeTeam.name} vs {awayTeam.name}
                </CardTitle>
                <CardDescription>{new Date(match.kickoff).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-8 py-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <img
                        src={homeTeam.logo || `/placeholder.svg?height=64&width=64`}
                        alt={homeTeam.name}
                        className="max-w-full max-h-full"
                      />
                    </div>
                    <div className="font-medium">{homeTeam.name}</div>
                    <div className="w-20">
                      <Label htmlFor="homeScore" className="sr-only">
                        Home Score
                      </Label>
                      <Input
                        id="homeScore"
                        type="number"
                        min="0"
                        value={homeScore}
                        onChange={(e) => setHomeScore(e.target.value)}
                        className="text-center text-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="text-2xl font-bold">vs</div>

                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <img
                        src={awayTeam.logo || `/placeholder.svg?height=64&width=64`}
                        alt={awayTeam.name}
                        className="max-w-full max-h-full"
                      />
                    </div>
                    <div className="font-medium">{awayTeam.name}</div>
                    <div className="w-20">
                      <Label htmlFor="awayScore" className="sr-only">
                        Away Score
                      </Label>
                      <Input
                        id="awayScore"
                        type="number"
                        min="0"
                        value={awayScore}
                        onChange={(e) => setAwayScore(e.target.value)}
                        className="text-center text-xl"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-sm text-muted-foreground text-center">
                  <p>Updating this result will automatically calculate points for all user predictions.</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Result"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="pointers">
          <MatchPointerOutcomes matchId={match.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
