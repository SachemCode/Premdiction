"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { createPrivateLeagueAction } from "@/app/leagues/actions"
import { COMPETITIONS, type CompetitionCode } from "@/lib/competition-config"

export function CreateLeagueForm({ wcEventEnabled = false }: { wcEventEnabled?: boolean }) {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [pl, setPl] = useState(true)
  const [wc, setWc] = useState(false)
  const [saving, setSaving] = useState(false)
  const wcEnabled = wcEventEnabled

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const competitions: CompetitionCode[] = []
    if (pl) competitions.push("PL")
    if (wc && wcEnabled) competitions.push("WC")
    if (competitions.length === 0) {
      toast({ title: "Select a competition", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const league = await createPrivateLeagueAction({ name, competitions })
      toast({ title: "League created", description: "Share your invite link with friends." })
      router.push(`/leagues/${league.id}`)
    } catch (err) {
      toast({
        title: "Could not create league",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="league-name">League name</Label>
        <Input
          id="league-name"
          placeholder="e.g. Work mates 2026"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          maxLength={80}
        />
      </div>

      <div className="space-y-2">
        <Label>Competitions</Label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={pl} onCheckedChange={(v) => setPl(v === true)} />
            {COMPETITIONS.PL.displayName}
          </label>
          {wcEnabled && (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={wc} onCheckedChange={(v) => setWc(v === true)} />
              {COMPETITIONS.WC.displayName}
            </label>
          )}
        </div>
      </div>

      <Button type="submit" disabled={saving} className="bg-pl-purple hover:bg-pl-purple/90 text-white">
        {saving ? "Creating..." : "Create league"}
      </Button>
    </form>
  )
}
