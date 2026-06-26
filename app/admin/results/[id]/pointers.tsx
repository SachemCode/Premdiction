"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getMatchPointers, getMatchPointerOutcomes, type PointerType } from "@/lib/pointers"
import { Square, Target, Ban, ArrowLeftRight, Hand, Trophy, Medal } from "lucide-react"
import { saveMatchPointerOutcomesAction } from "@/app/admin/actions"

// Map of pointer IDs to their respective icons
const pointerIcons: Record<string, React.ReactNode> = {
  red_card: <Square className="h-4 w-4 text-red-500" />,
  penalty_goal: <Target className="h-4 w-4 text-blue-500" />,
  no_yellow_cards: <Ban className="h-4 w-4 text-yellow-500" />,
  own_goal: <ArrowLeftRight className="h-4 w-4 text-purple-500" />,
  goalkeeper_goal: <Hand className="h-4 w-4 text-green-500" />,
  hat_trick: <Trophy className="h-4 w-4 text-amber-500" />,
  motm: <Medal className="h-4 w-4 text-cyan-500" />,
}

interface MatchPointerOutcomesProps {
  matchId: string
}

export default function MatchPointerOutcomes({ matchId }: MatchPointerOutcomesProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const pointers = getMatchPointers()
  const existingOutcomes = getMatchPointerOutcomes(matchId)

  const [outcomes, setOutcomes] = useState<
    {
      pointerId: PointerType
      occurred: boolean
      details?: string
    }[]
  >(
    existingOutcomes?.pointerOutcomes ||
      pointers.map((p) => ({
        pointerId: p.id as PointerType,
        occurred: false,
      })),
  )

  const handleOutcomeChange = (pointerId: PointerType, occurred: boolean) => {
    setOutcomes((prev) => prev.map((o) => (o.pointerId === pointerId ? { ...o, occurred } : o)))
  }

  const handleDetailsChange = (pointerId: PointerType, details: string) => {
    setOutcomes((prev) => prev.map((o) => (o.pointerId === pointerId ? { ...o, occurred: o.occurred, details } : o)))
  }

  const handleSubmit = async () => {
    // Validate MOTM has a player name if selected
    const motmOutcome = outcomes.find((o) => o.pointerId === "motm" && o.occurred)
    if (motmOutcome && (!motmOutcome.details || motmOutcome.details.trim() === "")) {
      toast({
        title: "Missing information",
        description: "Please enter a player name for Man of the Match",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await saveMatchPointerOutcomesAction({
        matchId,
        outcomes,
      })

      toast({
        title: "Pointer outcomes saved",
        description: "The pointer outcomes have been saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save pointer outcomes",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Special Events</CardTitle>
        <CardDescription>Record which special events occurred during this match</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pointers.map((pointer) => (
            <div key={pointer.id} className="flex items-start space-x-3 space-y-0 p-2 rounded-lg border">
              <Checkbox
                id={`outcome-${pointer.id}`}
                checked={outcomes.find((o) => o.pointerId === pointer.id)?.occurred || false}
                onCheckedChange={(checked) => handleOutcomeChange(pointer.id as PointerType, checked === true)}
              />
              <div className="grid gap-1.5 leading-none flex-1">
                <label
                  htmlFor={`outcome-${pointer.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  {pointerIcons[pointer.id]}
                  {pointer.name}
                </label>
                <p className="text-xs text-muted-foreground">{pointer.description}</p>

                {pointer.id === "motm" && outcomes.find((o) => o.pointerId === "motm")?.occurred && (
                  <div className="mt-2">
                    <Label htmlFor="motm-player" className="text-xs">
                      Player Name
                    </Label>
                    <Input
                      id="motm-player"
                      placeholder="Enter MOTM player name"
                      value={outcomes.find((o) => o.pointerId === "motm")?.details || ""}
                      onChange={(e) => handleDetailsChange("motm", e.target.value)}
                      className="h-8 mt-1"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Special Events"}
        </Button>
      </CardFooter>
    </Card>
  )
}
