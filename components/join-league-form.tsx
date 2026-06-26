"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { joinPrivateLeagueAction } from "@/app/leagues/actions"

export function JoinLeagueForm({ defaultCode = "" }: { defaultCode?: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [code, setCode] = useState(defaultCode)
  const [joining, setJoining] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setJoining(true)
    try {
      const league = await joinPrivateLeagueAction(code.trim())
      toast({ title: "Joined league", description: league.name })
      router.push(`/leagues/${league.id}`)
    } catch (err) {
      toast({
        title: "Could not join",
        description: err instanceof Error ? err.message : "Check the invite code",
        variant: "destructive",
      })
    } finally {
      setJoining(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invite-code">Invite code</Label>
        <Input
          id="invite-code"
          placeholder="Paste invite code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={joining} variant="outline" className="w-full">
        {joining ? "Joining..." : "Join league"}
      </Button>
    </form>
  )
}
