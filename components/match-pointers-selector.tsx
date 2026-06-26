"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  getMatchPointers,
  getKnockoutPointers,
  type PointerType,
} from "@/lib/pointers"
import { Square, Target, Ban, ArrowLeftRight, Hand, Trophy, Medal, AlertTriangle, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  getUserPointerSelectionsAction,
  saveUserPointerSelectionsAction,
} from "@/app/predictions/actions"
import type { PredictionWindowStatus } from "@/lib/prediction-window"
import { cn } from "@/lib/utils"

const pointerIcons: Record<string, React.ReactNode> = {
  red_card: <Square className="h-4 w-4 text-red-500" />,
  penalty_goal: <Target className="h-4 w-4 text-blue-500" />,
  no_yellow_cards: <Ban className="h-4 w-4 text-yellow-500" />,
  own_goal: <ArrowLeftRight className="h-4 w-4 text-purple-500" />,
  goalkeeper_goal: <Hand className="h-4 w-4 text-green-500" />,
  hat_trick: <Trophy className="h-4 w-4 text-amber-500" />,
  motm: <Medal className="h-4 w-4 text-cyan-500" />,
  penalty_shootout: <Target className="h-4 w-4 text-orange-500" />,
}

interface MatchPointersSelectorProps {
  matchId: string
  homeTeam: { id: string; name: string; shortName: string; logo?: string }
  awayTeam: { id: string; name: string; shortName: string; logo?: string }
  windowStatus: PredictionWindowStatus
  isActive: boolean
  /** When set, overrides isActive for WC-style window-based gating */
  pointersActive?: boolean
  variant?: "pl" | "wc"
}

export default function MatchPointersSelector({
  matchId,
  homeTeam,
  awayTeam,
  windowStatus,
  isActive,
  pointersActive,
  variant = "pl",
}: MatchPointersSelectorProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedPointers, setSelectedPointers] = useState<PointerType[]>([])
  const [pointerDetails, setPointerDetails] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const pointers = variant === "wc" ? getKnockoutPointers() : getMatchPointers()
  const windowOpen = windowStatus === "open"
  const pointersEnabled = pointersActive !== undefined ? pointersActive : isActive
  const isWc = variant === "wc"

  useEffect(() => {
    let cancelled = false

    async function loadSelections() {
      if (!user) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const existingSelections = await getUserPointerSelectionsAction(matchId)
        if (cancelled) return
        if (existingSelections) {
          setSelectedPointers(existingSelections.selectedPointers)
          setPointerDetails(existingSelections.details ?? {})
        }
      } catch {
        if (!cancelled) {
          setSelectedPointers([])
          setPointerDetails({})
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadSelections()
    return () => {
      cancelled = true
    }
  }, [user, matchId])

  const handlePointerToggle = (pointerId: PointerType, checked: boolean) => {
    if (checked) {
      setSelectedPointers((prev) => [...prev, pointerId])
    } else {
      setSelectedPointers((prev) => prev.filter((id) => id !== pointerId))
      if (pointerId === "penalty_shootout") {
        setPointerDetails((prev) => {
          const next = { ...prev }
          delete next.penalty_shootout_winner
          return next
        })
      }
    }
  }

  const handleDetailsChange = (key: string, value: string) => {
    setPointerDetails((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Not signed in",
        description: "Please sign in to save your pointer selections",
        variant: "destructive",
      })
      return
    }

    if (selectedPointers.includes("motm") && (!pointerDetails.motm || pointerDetails.motm.trim() === "")) {
      toast({
        title: "Missing information",
        description: "Please enter a player name for Man of the Match prediction",
        variant: "destructive",
      })
      return
    }

    if (
      selectedPointers.includes("penalty_shootout") &&
      !pointerDetails.penalty_shootout_winner
    ) {
      toast({
        title: "Missing information",
        description: "Please pick which team wins the penalty shootout",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await saveUserPointerSelectionsAction({
        matchId,
        selectedPointers,
        details: pointerDetails,
      })

      toast({
        title: "Pointers saved",
        description: "Your pointer selections have been saved successfully",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to save pointer selections. The prediction window may be closed.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-40 flex items-center justify-center">
        <div
          className={cn(
            "animate-spin rounded-full h-8 w-8 border-b-2",
            isWc ? "border-green-800 dark:border-amber-400" : "border-pl-purple"
          )}
        />
      </div>
    )
  }

  if (!pointersEnabled) {
    return (
      <div
        className={cn(
          "p-4 text-center",
          isWc ? "text-green-950/70 dark:text-green-100/70" : "text-muted-foreground"
        )}
      >
        <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-500 opacity-50" />
        <p>
          {pointersActive !== undefined
            ? isWc
              ? "Pointers open when both teams are confirmed and until 30 minutes before kickoff"
              : "Pointers are not available for this match right now"
            : "Pointers are only available for active matchweeks"}
        </p>
      </div>
    )
  }

  if (windowStatus === "not_open") {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-500 opacity-50" />
        <p>
          {isWc
            ? "Waiting for both teams to be confirmed before pointers open"
            : "Pointer selections are not open yet for this matchweek"}
        </p>
      </div>
    )
  }

  if (windowStatus === "closed") {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500 opacity-50" />
        <p>
          {isWc
            ? "The deadline has passed — pointers close 30 minutes before kickoff"
            : "The deadline for selecting pointers has passed"}
        </p>
        {selectedPointers.length > 0 && (
          <p className="text-sm mt-2">
            Your selected pointers:{" "}
            {selectedPointers.map((p) => pointers.find((pointer) => pointer.id === p)?.name).join(", ")}
          </p>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-lg p-4 shadow-sm",
        isWc
          ? "wc-event-card"
          : "border bg-white dark:bg-gray-800"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className={cn(
            "font-medium flex items-center gap-2",
            isWc && "text-green-950 dark:text-green-50"
          )}
        >
          <Target className={cn("h-4 w-4", isWc ? "text-green-800 dark:text-amber-300" : "text-pl-purple")} />
          Special Event Predictions
        </h3>
        <div
          className={cn(
            "text-sm",
            isWc ? "text-green-950/70 dark:text-green-100/70" : "text-muted-foreground"
          )}
        >
          {homeTeam.shortName} vs {awayTeam.shortName}
        </div>
      </div>

      <div className="grid gap-3 mb-4">
        {pointers.map((pointer) => (
          <div key={pointer.id} className="flex items-start space-x-3 space-y-0">
            <Checkbox
              id={`pointer-${matchId}-${pointer.id}`}
              checked={selectedPointers.includes(pointer.id as PointerType)}
              onCheckedChange={(checked) => handlePointerToggle(pointer.id as PointerType, checked === true)}
              disabled={!windowOpen}
            />
            <div className="grid gap-1 leading-none flex-1">
              <label
                htmlFor={`pointer-${matchId}-${pointer.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                {pointerIcons[pointer.id]}
                {pointer.name}
                <div className="flex gap-1 ml-1">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    +{pointer.pointsIfCorrect}
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {pointer.pointsIfWrong}
                  </Badge>
                </div>
              </label>
              <p className="text-xs text-muted-foreground">{pointer.description}</p>

              {pointer.id === "motm" && selectedPointers.includes("motm") && (
                <div className="mt-2">
                  <Label htmlFor={`motm-player-${matchId}`} className="text-xs">
                    Player Name
                  </Label>
                  <Input
                    id={`motm-player-${matchId}`}
                    placeholder="Enter player name"
                    value={pointerDetails.motm || ""}
                    onChange={(e) => handleDetailsChange("motm", e.target.value)}
                    className="h-8 mt-1"
                    disabled={!windowOpen}
                  />
                </div>
              )}

              {pointer.id === "penalty_shootout" && selectedPointers.includes("penalty_shootout") && (
                <div className="mt-2 space-y-2">
                  <Label className="text-xs">Shootout winner</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={pointerDetails.penalty_shootout_winner === homeTeam.id ? "default" : "outline"}
                      className={cn(
                        "flex-1",
                        pointerDetails.penalty_shootout_winner === homeTeam.id && isWc && "wc-btn-primary"
                      )}
                      onClick={() => handleDetailsChange("penalty_shootout_winner", homeTeam.id)}
                      disabled={!windowOpen}
                    >
                      {homeTeam.shortName}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={pointerDetails.penalty_shootout_winner === awayTeam.id ? "default" : "outline"}
                      className={cn(
                        "flex-1",
                        pointerDetails.penalty_shootout_winner === awayTeam.id && isWc && "wc-btn-primary"
                      )}
                      onClick={() => handleDetailsChange("penalty_shootout_winner", awayTeam.id)}
                      disabled={!windowOpen}
                    >
                      {awayTeam.shortName}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !windowOpen}
          size="sm"
          className={isWc ? "wc-btn-primary" : "bg-pl-purple hover:bg-pl-purple/90 text-white"}
        >
          {isSubmitting ? (
            <>Saving...</>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Save Pointers
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
