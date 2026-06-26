"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { savePredictionAction } from "@/app/predictions/actions"
import type { Match, Team } from "@/lib/types"
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  ExternalLink,
  MapPin,
  Target,
  Dices,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import MatchPointersSelector from "./match-pointers-selector"
import { PointsBadge } from "@/components/game/points-badge"
import { EXACT_SCORE_POINTS, CORRECT_RESULT_POINTS } from "@/lib/prediction-points"
import { ScoreWheelPicker } from "@/components/game/score-wheel-picker"
import {
  getFirstKickoff,
  getPredictionWindow,
  getPredictionWindowStatus,
  formatPredictionWindowMessage,
  randomScore,
  SCORE_INPUT_MAX,
  SCORE_RANDOM_MAX,
  SCORE_WHEEL_MAX,
  type PredictionWindowStatus,
} from "@/lib/prediction-window"
import { formatDateDDMMYYYY, formatTimeHHMM } from "@/lib/date-format"
import type { CompetitionCode } from "@/lib/competition-config"

type ScorePrediction = { homeScore: number | null; awayScore: number | null }

type MatchWithTeams = Match & {
  homeTeam: Team
  awayTeam: Team
  venue?: string
  matchInfo?: string
}

type MatchweekData = {
  id: string
  number: number
  status: "upcoming" | "active" | "completed"
  startDate: Date | string
  matches: MatchWithTeams[]
  userPredictions: Record<string, { homeScore: number; awayScore: number }>
}

function initPredictions(
  matches: MatchWithTeams[],
  saved: Record<string, { homeScore: number; awayScore: number }>
): Record<string, ScorePrediction> {
  const result: Record<string, ScorePrediction> = {}
  for (const match of matches) {
    if (saved[match.id]) {
      result[match.id] = { ...saved[match.id] }
    } else {
      result[match.id] = { homeScore: null, awayScore: null }
    }
  }
  return result
}

function isPredictionComplete(pred: ScorePrediction | undefined): pred is { homeScore: number; awayScore: number } {
  return pred != null && pred.homeScore !== null && pred.awayScore !== null
}

function windowBannerClass(status: PredictionWindowStatus): string {
  switch (status) {
    case "open":
      return "bg-pl-green/10 border-pl-green/30 text-foreground"
    case "not_open":
      return "bg-amber-500/10 border-amber-500/30 text-foreground"
    case "closed":
      return "bg-muted border-border text-muted-foreground"
  }
}

export default function MatchweekPredictions({
  matchweekData,
  showPointers = true,
  competition = "PL",
}: {
  matchweekData: MatchweekData
  showPointers?: boolean
  competition?: CompetitionCode
}) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [predictions, setPredictions] = useState<Record<string, ScorePrediction>>(() =>
    initPredictions(matchweekData.matches, matchweekData.userPredictions)
  )
  const [savedPredictions, setSavedPredictions] = useState(matchweekData.userPredictions)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [expandedPointers, setExpandedPointers] = useState<Record<string, boolean>>({})
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set())

  useEffect(() => {
    setSavedPredictions(matchweekData.userPredictions)
    setPredictions(initPredictions(matchweekData.matches, matchweekData.userPredictions))
  }, [matchweekData.userPredictions, matchweekData.matches])

  const firstKickoff = useMemo(
    () => getFirstKickoff(matchweekData.matches),
    [matchweekData.matches]
  )
  const window = useMemo(
    () => getPredictionWindow(matchweekData.startDate, firstKickoff),
    [matchweekData.startDate, firstKickoff]
  )
  const windowStatus = useMemo(
    () => getPredictionWindowStatus(new Date(), window),
    [window]
  )
  const windowOpen = windowStatus === "open"

  const editableMatches = matchweekData.matches.filter((m) => m.status !== "completed")
  const editableMatchIds = editableMatches.map((m) => m.id)

  const handleScoreChange = (matchId: string, team: "home" | "away", value: string) => {
    if (value === "") {
      setPredictions((prev) => ({
        ...prev,
        [matchId]: {
          ...(prev[matchId] || { homeScore: null, awayScore: null }),
          [team === "home" ? "homeScore" : "awayScore"]: null,
        },
      }))
      return
    }

    const numValue = Number.parseInt(value, 10)
    if (isNaN(numValue)) return
    const score = Math.max(0, Math.min(SCORE_INPUT_MAX, numValue))

    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] || { homeScore: null, awayScore: null }),
        [team === "home" ? "homeScore" : "awayScore"]: score,
      },
    }))
  }

  const setMatchScores = (matchId: string, homeScore: number, awayScore: number) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: { homeScore, awayScore },
    }))
  }

  const randomizeMatch = (matchId: string) => {
    setMatchScores(matchId, randomScore(SCORE_RANDOM_MAX), randomScore(SCORE_RANDOM_MAX))
  }

  const randomizeMatches = (matchIds: string[]) => {
    if (matchIds.length === 0) {
      toast({
        title: "No matches selected",
        description: "Select at least one match to randomize",
        variant: "destructive",
      })
      return
    }
    setPredictions((prev) => {
      const next = { ...prev }
      for (const id of matchIds) {
        next[id] = { homeScore: randomScore(SCORE_RANDOM_MAX), awayScore: randomScore(SCORE_RANDOM_MAX) }
      }
      return next
    })
  }

  const toggleMatchSelection = (matchId: string, checked: boolean) => {
    setSelectedMatches((prev) => {
      const next = new Set(prev)
      if (checked) next.add(matchId)
      else next.delete(matchId)
      return next
    })
  }

  const selectAllEditable = () => setSelectedMatches(new Set(editableMatchIds))
  const clearSelection = () => setSelectedMatches(new Set())

  const savePrediction = async (matchId: string) => {
    if (!user) {
      toast({
        title: "Not signed in",
        description: "Please sign in to save your prediction",
        variant: "destructive",
      })
      return
    }

    const prediction = predictions[matchId]
    if (!isPredictionComplete(prediction)) {
      toast({
        title: "Incomplete prediction",
        description: "Please set both home and away scores before saving",
        variant: "destructive",
      })
      return
    }

    setSaving((prev) => ({ ...prev, [matchId]: true }))

    try {
      await savePredictionAction({
        matchId,
        homeScore: prediction.homeScore,
        awayScore: prediction.awayScore,
      })

      setSavedPredictions((prev) => ({
        ...prev,
        [matchId]: { homeScore: prediction.homeScore, awayScore: prediction.awayScore },
      }))
      router.refresh()

      toast({
        title: "Prediction saved",
        description: "Your prediction has been saved successfully",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to save prediction. The prediction window may be closed.",
        variant: "destructive",
      })
    } finally {
      setSaving((prev) => ({ ...prev, [matchId]: false }))
    }
  }

  const togglePointers = (matchId: string) => {
    setExpandedPointers((prev) => ({
      ...prev,
      [matchId]: !prev[matchId],
    }))
  }

  const savedCount = Object.keys(savedPredictions).length

  return (
    <div className="space-y-4">
      <div
        className={`rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ${windowBannerClass(windowStatus)}`}
      >
        {windowStatus === "open" ? (
          <Clock className="h-4 w-4 shrink-0 text-pl-green" />
        ) : (
          <AlertTriangle className="h-4 w-4 shrink-0" />
        )}
        <span>{formatPredictionWindowMessage(windowStatus, window)}</span>
      </div>


      {matchweekData.matches.length > 0 && user && (
        <p className="text-sm text-muted-foreground">
          {savedCount} of {matchweekData.matches.length} predictions saved
        </p>
      )}

      {windowOpen && editableMatches.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-9"
            onClick={() => randomizeMatches(editableMatchIds)}
          >
            <Dices className="h-4 w-4 mr-1" />
            Randomize all
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-9"
            onClick={() => randomizeMatches([...selectedMatches])}
          >
            <Dices className="h-4 w-4 mr-1" />
            Randomize selected
          </Button>
          <button
            type="button"
            onClick={selectAllEditable}
            className="text-xs text-pl-purple hover:underline ml-1"
          >
            Select all
          </button>
          <span className="text-muted-foreground text-xs">·</span>
          <button
            type="button"
            onClick={clearSelection}
            className="text-xs text-muted-foreground hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      {matchweekData.matches.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-pl-purple opacity-20" />
          <p className="text-lg">
            {competition === "WC"
              ? "No matches scheduled for this round"
              : "No matches scheduled for this matchweek"}
          </p>
          <p className="text-sm">Check back later for upcoming matches</p>
        </div>
      ) : (
        matchweekData.matches.map((match) => {
          const prediction = predictions[match.id] || { homeScore: null, awayScore: null }
          const isCompleted = match.status === "completed"
          const canEdit = windowOpen && !isCompleted
          const complete = isPredictionComplete(prediction)

          const kickoffDate = new Date(match.kickoff)
          const formattedDate = formatDateDDMMYYYY(kickoffDate)
          const formattedTime = formatTimeHHMM(kickoffDate)

          return (
            <div key={match.id} className="space-y-2">
              <div className="game-card p-4">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="fixture-meta flex flex-wrap gap-x-2 gap-y-1 flex-1 min-w-0">
                    {canEdit && (
                      <Checkbox
                        checked={selectedMatches.has(match.id)}
                        onCheckedChange={(checked) => toggleMatchSelection(match.id, checked === true)}
                        className="mt-0.5 shrink-0"
                        aria-label={`Select ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`}
                      />
                    )}
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>{formattedDate}</span>
                    <span>•</span>
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>{formattedTime}</span>
                  </div>
                  {canEdit && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => randomizeMatch(match.id)}
                      aria-label="Randomize score"
                    >
                      <Dices className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4 text-sm">
                  <MapPin className="h-4 w-4 shrink-0 text-pl-purple" />
                  <span className={match.venue ? "font-medium" : "text-muted-foreground italic"}>
                    {match.venue ?? "Venue TBC"}
                  </span>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 flex items-center justify-center">
                      <img
                        src={match.homeTeam.logo || `/placeholder.svg?height=56&width=56`}
                        alt={match.homeTeam.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="text-sm font-semibold mt-2 leading-tight">{match.homeTeam.shortName}</div>
                    <Badge variant="outline" className="mt-1 text-xs">
                      H
                    </Badge>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    {isCompleted ? (
                      <div className="text-2xl font-bold px-4 py-2 bg-muted rounded-xl">
                        {match.homeScore} - {match.awayScore}
                      </div>
                    ) : (
                      <>
                        <ScoreWheelPicker
                          homeScore={prediction.homeScore}
                          awayScore={prediction.awayScore}
                          max={SCORE_WHEEL_MAX}
                          disabled={!canEdit}
                          onHomeChange={(v) =>
                            setPredictions((prev) => ({
                              ...prev,
                              [match.id]: {
                                homeScore: v,
                                awayScore: prev[match.id]?.awayScore ?? null,
                              },
                            }))
                          }
                          onAwayChange={(v) =>
                            setPredictions((prev) => ({
                              ...prev,
                              [match.id]: {
                                homeScore: prev[match.id]?.homeScore ?? null,
                                awayScore: v,
                              },
                            }))
                          }
                        />
                        <div className="hidden md:flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max={SCORE_INPUT_MAX}
                            placeholder="-"
                            className="w-14 h-12 text-center text-lg font-bold"
                            value={prediction.homeScore ?? ""}
                            onChange={(e) => handleScoreChange(match.id, "home", e.target.value)}
                            disabled={!canEdit}
                          />
                          <span className="text-lg font-bold">-</span>
                          <Input
                            type="number"
                            min="0"
                            max={SCORE_INPUT_MAX}
                            placeholder="-"
                            className="w-14 h-12 text-center text-lg font-bold"
                            value={prediction.awayScore ?? ""}
                            onChange={(e) => handleScoreChange(match.id, "away", e.target.value)}
                            disabled={!canEdit}
                          />
                        </div>
                        <div className="flex md:hidden items-center gap-2">
                          <div className="w-14 h-12 flex items-center justify-center text-lg font-bold border rounded-md bg-muted/30">
                            {prediction.homeScore ?? "-"}
                          </div>
                          <span className="text-lg font-bold">-</span>
                          <div className="w-14 h-12 flex items-center justify-center text-lg font-bold border rounded-md bg-muted/30">
                            {prediction.awayScore ?? "-"}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 flex items-center justify-center">
                      <img
                        src={match.awayTeam.logo || `/placeholder.svg?height=56&width=56`}
                        alt={match.awayTeam.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="text-sm font-semibold mt-2 leading-tight">{match.awayTeam.shortName}</div>
                    <Badge variant="outline" className="mt-1 text-xs">
                      A
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {match.matchInfo && (
                    <a href={match.matchInfo} target="_blank" rel="noopener noreferrer" className="match-info-link">
                      <ExternalLink className="h-4 w-4" />
                      More Match Info
                    </a>
                  )}

                  {!isCompleted && (
                    <Button
                      onClick={() => savePrediction(match.id)}
                      disabled={!canEdit || !complete || saving[match.id]}
                      size="lg"
                      className={`w-full min-h-11 ${
                        !canEdit
                          ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                          : "bg-pl-green hover:bg-pl-green/90 text-pl-purple"
                      }`}
                    >
                      {saving[match.id] ? (
                        <>Saving...</>
                      ) : !canEdit ? (
                        <>
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {windowStatus === "not_open" ? "Not Open Yet" : "Window Closed"}
                        </>
                      ) : !complete ? (
                        <>Set both scores to save</>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Save Prediction
                        </>
                      )}
                    </Button>
                  )}

                  {isCompleted && savedPredictions[match.id] && (
                    <div className="flex items-center gap-2 bg-muted p-2 rounded-lg">
                      <div className="text-sm">Your prediction:</div>
                      <div className="font-medium">
                        {savedPredictions[match.id].homeScore} -{" "}
                        {savedPredictions[match.id].awayScore}
                      </div>
                      {match.homeScore !== null && match.awayScore !== null && (
                        <div className="ml-2">
                          {match.homeScore === savedPredictions[match.id].homeScore &&
                          match.awayScore === savedPredictions[match.id].awayScore ? (
                            <PointsBadge points={EXACT_SCORE_POINTS} />
                          ) : (match.homeScore > match.awayScore &&
                              savedPredictions[match.id].homeScore >
                                savedPredictions[match.id].awayScore) ||
                            (match.homeScore < match.awayScore &&
                              savedPredictions[match.id].homeScore <
                                savedPredictions[match.id].awayScore) ||
                            (match.homeScore === match.awayScore &&
                              savedPredictions[match.id].homeScore ===
                                savedPredictions[match.id].awayScore) ? (
                            <PointsBadge points={CORRECT_RESULT_POINTS} />
                          ) : (
                            <PointsBadge points={0} />
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {showPointers && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePointers(match.id)}
                      className="w-full min-h-11 flex items-center justify-center gap-1"
                    >
                      <Target className="h-4 w-4" />
                      {expandedPointers[match.id] ? "Hide Pointers" : "Show Pointers"}
                    </Button>
                  )}
                </div>
              </div>

              {showPointers && expandedPointers[match.id] && (
                <MatchPointersSelector
                  matchId={match.id}
                  homeTeam={match.homeTeam}
                  awayTeam={match.awayTeam}
                  windowStatus={windowStatus}
                  isActive={matchweekData.status === "active"}
                />
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
