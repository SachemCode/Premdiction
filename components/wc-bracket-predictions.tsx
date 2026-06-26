"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { savePredictionAction } from "@/app/predictions/actions"
import type { Match, Team } from "@/lib/types"
import {
  CheckCircle,
  AlertTriangle,
  Calendar,
  Dices,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { TeamLogo, isTbdTeam } from "@/components/team-logo"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  getPredictionWindow,
  getPredictionWindowStatus,
  randomScore,
  SCORE_RANDOM_MAX,
} from "@/lib/prediction-window"
import { formatBracketKickoff } from "@/lib/date-format"
import { cn } from "@/lib/utils"
import { WcBracketConnectors } from "@/components/wc-bracket-connectors"
import { WcBracketRoundColumn } from "@/components/wc-bracket-round-column"
import { WcBracketMatchEditor, teamDisplayName } from "@/components/wc-bracket-match-editor"
import { WC_BRACKET_CARD_HEIGHT } from "@/lib/wc-bracket-layout"
import { useMobile } from "@/hooks/use-mobile"

type ScorePrediction = { homeScore: number | null; awayScore: number | null }

type MatchWithTeams = Match & {
  homeTeam: Team
  awayTeam: Team
  venue?: string
}

type KnockoutRoundData = {
  id: string
  number: number
  status: "upcoming" | "active" | "completed"
  startDate: Date | string
  roundName: string
  matches: MatchWithTeams[]
}

export type WcBracketData = {
  rounds: KnockoutRoundData[]
  userPredictions: Record<string, { homeScore: number; awayScore: number }>
  currentRoundId?: string | null
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

function matchCanEdit(match: MatchWithTeams, roundStartDate: Date | string): boolean {
  if (match.status === "completed") return false
  if (isTbdTeam(match.homeTeamId) || isTbdTeam(match.awayTeamId)) return false
  const window = getPredictionWindow(roundStartDate, match.kickoff)
  return getPredictionWindowStatus(new Date(), window) === "open"
}

function getMatchWindowStatus(match: MatchWithTeams, roundStartDate: Date | string) {
  const window = getPredictionWindow(roundStartDate, match.kickoff)
  return getPredictionWindowStatus(new Date(), window)
}

type WcBracketMatchCardProps = {
  match: MatchWithTeams
  prediction: ScorePrediction
  saved: boolean
  canEdit: boolean
  isCompleted: boolean
  isSelected: boolean
  onOpen: () => void
}

function WcBracketMatchCard({
  match,
  prediction,
  saved,
  canEdit,
  isCompleted,
  isSelected,
  onOpen,
}: WcBracketMatchCardProps) {
  const complete = isPredictionComplete(prediction)
  const kickoff = formatBracketKickoff(match.kickoff)

  if (isCompleted) {
    return (
      <div
        className="rounded-xl border border-green-800/40 bg-green-950 text-green-50 shadow-md h-full"
        style={{ minHeight: WC_BRACKET_CARD_HEIGHT }}
      >
        <div className="p-3 h-full flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs text-green-100/70">{kickoff}</span>
            {saved && <CheckCircle className="h-3.5 w-3.5 text-amber-300" />}
          </div>
          <TeamRow team={match.homeTeam} />
          <TeamRow team={match.awayTeam} />
          <div className="mt-auto pt-2 text-center text-sm font-bold text-green-50">
            {match.homeScore} – {match.awayScore}
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "w-full text-left rounded-xl border border-green-800/50 bg-green-950 text-green-50 shadow-md h-full transition-shadow hover:shadow-lg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60",
        isSelected && "ring-2 ring-amber-400/70",
        !canEdit && "opacity-80"
      )}
      style={{ minHeight: WC_BRACKET_CARD_HEIGHT }}
    >
      <div className="p-3 h-full flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs text-green-100/70">{kickoff}</span>
          <div className="flex items-center gap-1.5">
            {saved && <CheckCircle className="h-3.5 w-3.5 text-amber-300" />}
            <ChevronRight className="h-4 w-4 text-green-100/50" />
          </div>
        </div>
        <TeamRow team={match.homeTeam} />
        <TeamRow team={match.awayTeam} />
        <div className="mt-auto pt-2">
          {complete ? (
            <span className="inline-flex items-center rounded-full bg-green-900/80 border border-green-700/50 px-2 py-0.5 text-xs font-medium text-amber-200">
              Pick: {prediction.homeScore} – {prediction.awayScore}
            </span>
          ) : (
            <span className="text-xs text-green-100/60">
              {canEdit ? "Tap to predict" : "View match"}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

function TeamRow({ team }: { team: Team }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <TeamLogo teamId={team.id} logo={team.logo} alt={team.name} size={22} />
      <span className="text-sm font-medium truncate">{teamDisplayName(team)}</span>
    </div>
  )
}

export default function WcBracketPredictions({ bracketData }: { bracketData: WcBracketData }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const isMobile = useMobile()
  const scrollRef = useRef<HTMLDivElement>(null)
  const columnRefs = useRef<(HTMLDivElement | null)[]>([])
  const hasScrolledToCurrent = useRef(false)

  const allMatches = useMemo(
    () => bracketData.rounds.flatMap((round) => round.matches),
    [bracketData.rounds]
  )

  const currentRoundIndex = useMemo(() => {
    if (!bracketData.currentRoundId) return 0
    const idx = bracketData.rounds.findIndex((r) => r.id === bracketData.currentRoundId)
    return idx >= 0 ? idx : 0
  }, [bracketData.currentRoundId, bracketData.rounds])

  const [predictions, setPredictions] = useState<Record<string, ScorePrediction>>(() =>
    initPredictions(allMatches, bracketData.userPredictions)
  )
  const [savedPredictions, setSavedPredictions] = useState(bracketData.userPredictions)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null)
  const [activeRoundStart, setActiveRoundStart] = useState<Date | string | null>(null)

  useEffect(() => {
    setSavedPredictions(bracketData.userPredictions)
    setPredictions(initPredictions(allMatches, bracketData.userPredictions))
  }, [bracketData.userPredictions, allMatches])

  useEffect(() => {
    if (hasScrolledToCurrent.current) return
    const target = columnRefs.current[currentRoundIndex]
    if (!target) return
    hasScrolledToCurrent.current = true
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "auto", inline: "center", block: "nearest" })
    })
  }, [currentRoundIndex, bracketData.rounds.length])

  const editableMatches = useMemo(
    () =>
      bracketData.rounds.flatMap((round) =>
        round.matches.filter((m) => matchCanEdit(m, round.startDate))
      ),
    [bracketData.rounds]
  )
  const editableMatchIds = editableMatches.map((m) => m.id)

  const activeMatch = activeMatchId ? allMatches.find((m) => m.id === activeMatchId) ?? null : null
  const activePrediction = activeMatchId ? predictions[activeMatchId] : undefined
  const activeCanEdit =
    activeMatch && activeRoundStart ? matchCanEdit(activeMatch, activeRoundStart) : false
  const activeWindowStatus =
    activeMatch && activeRoundStart
      ? getMatchWindowStatus(activeMatch, activeRoundStart)
      : "closed"

  const openMatchEditor = (matchId: string, roundStart: Date | string) => {
    setActiveRoundStart(roundStart)
    setActiveMatchId(matchId)
  }

  const closeMatchEditor = () => {
    setActiveMatchId(null)
    setActiveRoundStart(null)
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

  const randomizeAll = () => {
    if (editableMatchIds.length === 0) return
    setPredictions((prev) => {
      const next = { ...prev }
      for (const id of editableMatchIds) {
        next[id] = { homeScore: randomScore(SCORE_RANDOM_MAX), awayScore: randomScore(SCORE_RANDOM_MAX) }
      }
      return next
    })
  }

  const savePrediction = async (matchId: string, closeEditor = false) => {
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

      if (closeEditor) closeMatchEditor()
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

  const scrollBracket = (direction: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const columnWidth = columnRefs.current[0]?.offsetWidth ?? el.clientWidth * 0.88
    el.scrollBy({ left: direction === "left" ? -columnWidth : columnWidth, behavior: "smooth" })
  }

  const savedCount = Object.keys(savedPredictions).length
  const totalMatches = allMatches.length
  const openCount = editableMatches.length
  const editorOpen = activeMatchId != null && activeMatch != null && activePrediction != null

  const preferSheet = isMobile === true
  const preferDialog = isMobile !== true

  const matchEditor = editorOpen ? (
    <WcBracketMatchEditor
      match={activeMatch}
      prediction={activePrediction}
      canEdit={activeCanEdit}
      windowStatus={activeWindowStatus}
      saving={!!saving[activeMatch.id]}
      onHomeChange={(v) =>
        setPredictions((prev) => ({
          ...prev,
          [activeMatch.id]: {
            homeScore: v,
            awayScore: prev[activeMatch.id]?.awayScore ?? null,
          },
        }))
      }
      onAwayChange={(v) =>
        setPredictions((prev) => ({
          ...prev,
          [activeMatch.id]: {
            homeScore: prev[activeMatch.id]?.homeScore ?? null,
            awayScore: v,
          },
        }))
      }
      onRandomize={() => randomizeMatch(activeMatch.id)}
      onSave={() => savePrediction(activeMatch.id, true)}
    />
  ) : null

  return (
    <div className="space-y-4">
      <div className="wc-event-banner flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-300" />
        <span>
          {openCount > 0
            ? `${openCount} match${openCount === 1 ? "" : "es"} open — click a match to set your score and pointers`
            : "No matches open right now — check back when the next round approaches"}
        </span>
      </div>


      {totalMatches > 0 && user && (
        <p className="text-sm text-green-950/80 dark:text-green-100/80">
          {savedCount} of {totalMatches} predictions saved across all rounds
        </p>
      )}

      {openCount > 0 && (
        <Button type="button" variant="outline" size="sm" className="min-h-9 wc-btn-outline" onClick={randomizeAll}>
          <Dices className="h-4 w-4 mr-1" />
          Randomize open matches
        </Button>
      )}

      {totalMatches === 0 ? (
        <div className="text-center py-12 text-green-950/70 dark:text-green-100/70">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No matches scheduled yet</p>
          <p className="text-sm">Check back after the next fixture sync</p>
        </div>
      ) : (
        <div className="relative">
          <div className="hidden md:flex absolute right-0 top-0 z-10 gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full wc-btn-outline"
              onClick={() => scrollBracket("left")}
              aria-label="Scroll bracket left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full wc-btn-outline"
              onClick={() => scrollBracket("right")}
              aria-label="Scroll bracket right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div
            ref={scrollRef}
            className="overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory scrollbar-thin"
          >
            <div className="flex items-start gap-0 min-w-max px-[6vw] md:px-[14vw]">
              {bracketData.rounds.map((round, roundIndex) => (
                <div key={round.id} className="flex items-start shrink-0">
                  {roundIndex > 0 && (
                    <WcBracketConnectors
                      prevRoundIndex={roundIndex - 1}
                      prevMatchCount={bracketData.rounds[roundIndex - 1].matches.length}
                      nextMatchCount={round.matches.length}
                    />
                  )}
                  <WcBracketRoundColumn
                    roundName={round.roundName}
                    roundIndex={roundIndex}
                    matchCount={round.matches.length}
                    matches={round.matches}
                    isCurrent={roundIndex === currentRoundIndex}
                    setColumnRef={(el) => {
                      columnRefs.current[roundIndex] = el
                    }}
                    renderMatch={(match) => {
                      const prediction = predictions[match.id] || { homeScore: null, awayScore: null }
                      const isCompleted = match.status === "completed"
                      const canEdit = matchCanEdit(match, round.startDate)

                      return (
                        <WcBracketMatchCard
                          match={match}
                          prediction={prediction}
                          saved={!!savedPredictions[match.id]}
                          canEdit={canEdit}
                          isCompleted={isCompleted}
                          isSelected={activeMatchId === match.id}
                          onOpen={() => openMatchEditor(match.id, round.startDate)}
                        />
                      )
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex md:hidden justify-center gap-2 mt-2">
            <Button type="button" variant="outline" size="sm" className="wc-btn-outline" onClick={() => scrollBracket("left")}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Earlier
            </Button>
            <Button type="button" variant="outline" size="sm" className="wc-btn-outline" onClick={() => scrollBracket("right")}>
              Later
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {preferSheet && (
        <Sheet open={editorOpen} onOpenChange={(open) => !open && closeMatchEditor()}>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
            {activeMatch && (
              <>
                <SheetHeader>
                  <SheetTitle className="text-left">
                    {teamDisplayName(activeMatch.homeTeam)} vs {teamDisplayName(activeMatch.awayTeam)}
                  </SheetTitle>
                  <SheetDescription className="text-left">
                    {formatBracketKickoff(activeMatch.kickoff)}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">{matchEditor}</div>
              </>
            )}
          </SheetContent>
        </Sheet>
      )}

      {preferDialog && (
        <Dialog open={editorOpen} onOpenChange={(open) => !open && closeMatchEditor()}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto sm:rounded-xl">
            {activeMatch && (
              <>
                <DialogHeader>
                  <DialogTitle>
                    {teamDisplayName(activeMatch.homeTeam)} vs {teamDisplayName(activeMatch.awayTeam)}
                  </DialogTitle>
                  <DialogDescription>
                    Set your 90-minute score prediction and optional pointers
                  </DialogDescription>
                </DialogHeader>
                {matchEditor}
              </>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
