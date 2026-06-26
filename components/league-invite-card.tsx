"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Check, Copy } from "lucide-react"

export function LeagueInviteCard({ inviteCode }: { inviteCode: string }) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const joinPath = `/join/${inviteCode}`
  const fullUrl =
    typeof window !== "undefined" ? `${window.location.origin}${joinPath}` : joinPath

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      toast({ title: "Invite link copied" })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: "Could not copy", variant: "destructive" })
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div>
        <p className="text-sm font-medium">Invite friends</p>
        <p className="text-xs text-muted-foreground mt-1">
          Share this link — friends sign in and join automatically
        </p>
      </div>
      <p className="text-sm font-mono break-all bg-muted rounded px-3 py-2">{fullUrl}</p>
      <Button type="button" variant="outline" size="sm" onClick={copyLink} className="min-h-9">
        {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
        {copied ? "Copied" : "Copy invite link"}
      </Button>
    </div>
  )
}
