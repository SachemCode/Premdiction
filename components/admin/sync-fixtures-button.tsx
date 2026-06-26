"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import type { CompetitionCode } from "@/lib/competition-config"

export function SyncFixturesButton({ competition = "PL" }: { competition?: CompetitionCode }) {
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const label = competition === "WC" ? "Sync WC Fixtures" : "Sync EPL Fixtures"

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const res = await fetch("/api/admin/sync-fixtures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competition }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Sync failed")

      toast({
        title: "Fixtures synced",
        description: `Imported ${data.matchCount} matches across ${data.matchweekCount} matchweeks`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Could not sync fixtures",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Button onClick={handleSync} disabled={isSyncing} className="bg-pl-purple hover:bg-pl-purple/90 text-white">
      <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
      {isSyncing ? "Syncing..." : label}
    </Button>
  )
}
