"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScoreWheelPicker } from "@/components/game/score-wheel-picker"
import { TeamLogo, isTbdTeam } from "@/components/team-logo"
import MatchPointersSelector from "@/components/match-pointers-selector"
import { Dices, Target } from "lucide-react"
import type { Match, Team } from "@/lib/types"
import type { PredictionWindowStatus } from "@/lib/prediction-window"
import { SCORE_WHEEL_MAX } from "@/lib/prediction-window"
import { formatBracketKickoff } from "@/lib/date-format"

type ScorePrediction = { homeScore: number | null; awayScore: number | null }

type MatchWithTeams = Match & {
  homeTeam: Team
  awayTeam: Team
}

function teamDisplayName(team: Team): string {
  if (isTbdTeam(team.id)) return "TBD"
  return team.shortName || team.name
}

function isPredictionComplete(pred: ScorePrediction | undefined): pred is { homeScore: number; awayScore: number } {
  return pred != null && pred.homeScore !== null && pred.awayScore !== null
}

export type WcBracketMatchEditorProps = {
  match: MatchWithTeams
  prediction: ScorePrediction
  canEdit: boolean
  windowStatus: PredictionWindowStatus
  saving: boolean
  onHomeChange: (value: number) => void
  onAwayChange: (value: number) => void
  onRandomize: () => void
  onSave: () => void
}

export function WcBracketMatchEditor({
  match,
  prediction,
  canEdit,
  windowStatus,
  saving,
  onHomeChange,
  onAwayChange,
  onRandomize,
  onSave,
}: WcBracketMatchEditorProps) {
  const [showPointers, setShowPointers] = useState(false)
  const isCompleted = match.status === "completed"
  const complete = isPredictionComplete(prediction)

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-8">
        <div className="flex flex-col items-center gap-1">
          <TeamLogo
            teamId={match.homeTeam.id}
            logo={match.homeTeam.logo}
            alt={match.homeTeam.name}
            size={40}
          />
          <span className="text-xs font-medium text-green-950 dark:text-green-50">
            {teamDisplayName(match.homeTeam)}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <TeamLogo
            teamId={match.awayTeam.id}
            logo={match.awayTeam.logo}
            alt={match.awayTeam.name}
            size={40}
          />
          <span className="text-xs font-medium text-green-950 dark:text-green-50">
            {teamDisplayName(match.awayTeam)}
          </span>
        </div>
      </div>

      <p className="text-center text-sm text-green-950/70 dark:text-green-100/70">
        {formatBracketKickoff(match.kickoff)}
      </p>

      {isCompleted ? (
        <div className="text-center text-2xl font-bold text-green-950 dark:text-green-50 py-4">
          Final: {match.homeScore} – {match.awayScore}
        </div>
      ) : (
        <>
          <ScoreWheelPicker
            homeScore={prediction.homeScore}
            awayScore={prediction.awayScore}
            max={SCORE_WHEEL_MAX}
            disabled={!canEdit}
            onHomeChange={onHomeChange}
            onAwayChange={onAwayChange}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 min-h-11 wc-btn-outline"
              onClick={onRandomize}
              disabled={!canEdit}
            >
              <Dices className="h-4 w-4 mr-1" />
              Randomize
            </Button>
            <Button
              type="button"
              className="flex-1 min-h-11 wc-btn-primary"
              onClick={onSave}
              disabled={!canEdit || !complete || saving}
            >
              {saving ? "Saving..." : "Save prediction"}
            </Button>
          </div>
        </>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full min-h-11 wc-btn-outline flex items-center justify-center gap-1"
        onClick={() => setShowPointers((prev) => !prev)}
      >
        <Target className="h-4 w-4" />
        {showPointers ? "Hide Pointers" : "Show Pointers"}
      </Button>

      {showPointers && (
        <MatchPointersSelector
          matchId={match.id}
          homeTeam={match.homeTeam}
          awayTeam={match.awayTeam}
          windowStatus={windowStatus}
          isActive={false}
          pointersActive={canEdit}
          variant="wc"
        />
      )}
    </div>
  )
}

export { teamDisplayName }
