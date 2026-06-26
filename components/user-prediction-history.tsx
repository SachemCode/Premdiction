"use client"

import { useAuth } from "@/lib/auth-provider"
import { Badge } from "@/components/ui/badge"
import { Target } from "lucide-react"
import { getUserPointerSelections, getMatchPointerOutcomes, getMatchPointers, calculatePointerPoints } from "@/lib/pointers"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CORRECT_RESULT_POINTS, EXACT_SCORE_POINTS } from "@/lib/prediction-points"

export default function UserPredictionHistory() {
  const { user } = useAuth()

  if (!user) {
    return <div className="text-center py-6 text-muted-foreground">Please sign in to view your prediction history</div>
  }

  // In a real app, these would be fetched from the database
  const predictions = [
    {
      id: "pred_1",
      matchweek: 1,
      match: {
        id: "match_1",
        homeTeam: { id: "team_1", name: "Arsenal", shortName: "ARS" },
        awayTeam: { id: "team_13", name: "Newcastle", shortName: "NEW" },
        homeScore: 2,
        awayScore: 0,
      },
      prediction: {
        homeScore: 2,
        awayScore: 0,
      },
      points: EXACT_SCORE_POINTS,
      date: "2023-08-12",
    },
    {
      id: "pred_2",
      matchweek: 1,
      match: {
        id: "match_2",
        homeTeam: { id: "team_10", name: "Liverpool", shortName: "LIV" },
        awayTeam: { id: "team_6", name: "Chelsea", shortName: "CHE" },
        homeScore: 1,
        awayScore: 1,
      },
      prediction: {
        homeScore: 2,
        awayScore: 1,
      },
      points: 0,
      date: "2023-08-13",
    },
    {
      id: "pred_5",
      matchweek: 2,
      match: {
        id: "match_3",
        homeTeam: { id: "team_6", name: "Chelsea", shortName: "CHE" },
        awayTeam: { id: "team_11", name: "Manchester City", shortName: "MCI" },
        homeScore: 0,
        awayScore: 3,
      },
      prediction: {
        homeScore: 1,
        awayScore: 2,
      },
      points: 2,
      date: "2023-08-20",
    },
    {
      id: "pred_6",
      matchweek: 2,
      match: {
        id: "match_4",
        homeTeam: { id: "team_16", name: "Tottenham", shortName: "TOT" },
        awayTeam: { id: "team_12", name: "Manchester United", shortName: "MUN" },
        homeScore: 2,
        awayScore: 2,
      },
      prediction: {
        homeScore: 1,
        awayScore: 1,
      },
      points: 0,
      date: "2023-08-19",
    },
  ]

  // Get all pointer definitions for reference
  const pointerDefinitions = getMatchPointers()

  // Group predictions by matchweek
  const predictionsByMatchweek = predictions.reduce((acc, prediction) => {
    if (!acc[prediction.matchweek]) {
      acc[prediction.matchweek] = []
    }
    acc[prediction.matchweek].push(prediction)
    return acc
  }, {} as Record<number, typeof predictions>)

  return (
    <div className="space-y-4">
      {predictions.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">You haven't made any predictions yet</div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {Object.entries(predictionsByMatchweek)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([matchweek, weekPredictions]) => (
              <AccordionItem key={matchweek} value={matchweek}>
                <AccordionTrigger className="text-lg font-semibold">
                  Matchweek {matchweek}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {weekPredictions.map((prediction) => {
                      // Get pointer selections for this match
                      const pointerSelections = getUserPointerSelections(user.id, prediction.match.id)
                      const pointerOutcomes = getMatchPointerOutcomes(prediction.match.id)

                      // Use team data already embedded in mock predictions
                      const homeTeam = prediction.match.homeTeam
                      const awayTeam = prediction.match.awayTeam

                      return (
                        <div key={prediction.id} className="border rounded-lg p-4">
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">Matchweek {prediction.matchweek}</Badge>
                                <span className="text-sm text-muted-foreground">{prediction.date}</span>
                              </div>
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6">
                                    <img
                                      src={homeTeam?.logo || `/placeholder.svg?height=24&width=24`}
                                      alt={homeTeam?.name}
                                      className="max-w-full max-h-full"
                                    />
                                  </div>
                                  <span className="font-medium">{prediction.match.homeTeam.name} (H)</span>
                                </div>
                                <span className="text-muted-foreground">vs</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6">
                                    <img
                                      src={awayTeam?.logo || `/placeholder.svg?height=24&width=24`}
                                      alt={awayTeam?.name}
                                      className="max-w-full max-h-full"
                                    />
                                  </div>
                                  <span className="font-medium">{prediction.match.awayTeam.name} (A)</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 mt-2">
                                <div>
                                  <div className="text-sm text-muted-foreground">Final Score</div>
                                  <div className="font-medium">
                                    {prediction.match.homeScore} - {prediction.match.awayScore}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Your Prediction</div>
                                  <div className="font-medium">
                                    {prediction.prediction.homeScore} - {prediction.prediction.awayScore}
                                  </div>
                                </div>
                              </div>

                              {/* Pointer Selections */}
                              {pointerSelections && pointerSelections.selectedPointers.length > 0 && (
                                <div className="mt-3">
                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    Your Pointers:
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {pointerSelections.selectedPointers.map((pointerId) => {
                                      const pointerDef = pointerDefinitions.find((p) => p.id === pointerId)
                                      const outcome = pointerOutcomes?.pointerOutcomes.find((o) => o.pointerId === pointerId)
                                      const isCorrect = outcome?.occurred

                                      return (
                                        <Badge
                                          key={pointerId}
                                          variant="outline"
                                          className={`${isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"} flex items-center gap-1`}
                                        >
                                          {pointerDef?.name || pointerId}
                                          {pointerId === "motm" && pointerSelections.details?.motm && `: ${pointerSelections.details.motm}`}
                                          <span className="ml-1 text-xs font-semibold">{isCorrect ? `+1` : "+0"} pts</span>
                                        </Badge>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Pointer History */}
                              <div className="mt-3">
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  Pointer History:
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(() => {
                                    const pointerResults = calculatePointerPoints(user.id, prediction.match.id).pointerResults
                                    if (!pointerResults.length) {
                                      return <span className="text-xs text-muted-foreground">No pointers selected</span>
                                    }
                                    return pointerResults.map((result) => {
                                      const pointerDef = pointerDefinitions.find((p) => p.id === result.pointerId)
                                      return (
                                        <Badge
                                          key={result.pointerId}
                                          variant="outline"
                                          className={`${result.correct ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"} flex items-center gap-1`}
                                        >
                                          {pointerDef?.name || result.pointerId}
                                          {result.pointerId === "motm" && pointerSelections && pointerSelections.details?.motm && `: ${pointerSelections.details.motm}`}
                                          <span className="ml-1 text-xs font-semibold">{result.points > 0 ? `+${result.points}` : result.points} pts</span>
                                        </Badge>
                                      )
                                    })
                                  })()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="text-center">
                                <div className="text-sm text-muted-foreground">Points</div>
                                <div
                                  className={`text-xl font-bold ${
                                    prediction.points === EXACT_SCORE_POINTS
                                      ? "text-green-600"
                                      : prediction.points === CORRECT_RESULT_POINTS
                                        ? "text-blue-600"
                                        : "text-red-600"
                                  }`}
                                >
                                  {prediction.points}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
        </Accordion>
      )}
    </div>
  )
}
