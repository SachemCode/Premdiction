"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { updatePrivateLeagueCompetitionsAction } from "@/app/leagues/actions"
import { COMPETITIONS, type CompetitionCode } from "@/lib/competition-config"

export function LeagueCompetitionSettings({
  leagueId,
  initialCompetitions,
  wcEventEnabled,
  canEdit,
}: {
  leagueId: string
  initialCompetitions: CompetitionCode[]
  wcEventEnabled: boolean
  canEdit: boolean
}) {
  const { toast } = useToast()
  const [pl, setPl] = useState(initialCompetitions.includes("PL"))
  const [wc, setWc] = useState(initialCompetitions.includes("WC"))
  const [saving, setSaving] = useState(false)

  if (!canEdit) return null

  const handleSave = async () => {
    const competitions: CompetitionCode[] = []
    if (pl) competitions.push("PL")
    if (wc && wcEventEnabled) competitions.push("WC")
    if (competitions.length === 0) {
      toast({ title: "Select at least one competition", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      await updatePrivateLeagueCompetitionsAction(leagueId, competitions)
      toast({ title: "Competitions updated" })
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <Label>League competitions</Label>
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={pl} onCheckedChange={(v) => setPl(v === true)} />
          {COMPETITIONS.PL.displayName}
        </label>
        {wcEventEnabled && (
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={wc} onCheckedChange={(v) => setWc(v === true)} />
            {COMPETITIONS.WC.displayName}
          </label>
        )}
      </div>
      <Button type="button" size="sm" variant="outline" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save competitions"}
      </Button>
    </div>
  )
}
