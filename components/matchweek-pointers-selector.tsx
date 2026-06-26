"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { getMatchPointers, getUserPointerSelections, type PointerType } from "@/lib/pointers"
import { Square, Target, Ban, ArrowLeftRight, Hand, Trophy, Medal, AlertTriangle, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { saveUserPointerSelectionsAction } from "@/app/predictions/actions"

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

interface MatchweekPointersSelectorProps {
  matchweekId: string
  matchweekNumber: number
  isActive: boolean
  deadline?: Date
}

export default function MatchweekPointersSelector({
  matchweekId,
  matchweekNumber,
  isActive,
  deadline,
}: MatchweekPointersSelectorProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedPointers, setSelectedPointers] = useState<PointerType[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const pointers = getMatchPointers()

  // Check if deadline has passed
  const deadlinePassed = deadline ? new Date() > deadline : false

  useEffect(() => {
    if (user) {
      // Load user's existing selections
      const existingSelections = getUserPointerSelections(user.id, matchweekId)
      if (existingSelections) {
        setSelectedPointers(existingSelections.selectedPointers)
      }
      setIsLoading(false)
    }
  }, [user, matchweekId])

  const handlePointerToggle = (pointerId: PointerType, checked: boolean) => {
    if (checked) {
      setSelectedPointers((prev) => [...prev, pointerId])
    } else {
      setSelectedPointers((prev) => prev.filter((id) => id !== pointerId))
    }
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

    setIsSubmitting(true)

    try {
      await saveUserPointerSelectionsAction({
        matchId: matchweekId,
        selectedPointers,
      })

      toast({
        title: "Pointers saved",
        description: "Your pointer selections have been saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save pointer selections",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pl-purple"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isActive) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500 opacity-50" />
          <p className="text-lg">Pointers are only available for active matchweeks</p>
        </CardContent>
      </Card>
    )
  }

  if (deadlinePassed) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500 opacity-50" />
          <p className="text-lg">The deadline for selecting pointers has passed</p>
          <p className="text-sm mt-2">
            Your selected pointers:{" "}
            {selectedPointers.length > 0
              ? selectedPointers.map((p) => pointers.find((pointer) => pointer.id === p)?.name).join(", ")
              : "None"}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-pl-purple" />
          Matchweek {matchweekNumber} Pointers
        </CardTitle>
        <CardDescription>
          Select special predictions to earn bonus points. Be careful - wrong predictions will cost you points!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {pointers.map((pointer) => (
            <div key={pointer.id} className="flex items-start space-x-3 space-y-0">
              <Checkbox
                id={`pointer-${pointer.id}`}
                checked={selectedPointers.includes(pointer.id as PointerType)}
                onCheckedChange={(checked) => handlePointerToggle(pointer.id as PointerType, checked === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor={`pointer-${pointer.id}`}
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
                <p className="text-sm text-muted-foreground">{pointer.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-pl-purple hover:bg-pl-purple/90 text-white"
        >
          {isSubmitting ? (
            <>Saving...</>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Save Pointer Selections
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
