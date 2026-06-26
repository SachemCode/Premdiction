"use client"

import { useState, type ReactNode } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Matchweek } from "@/lib/types"
import type { CompetitionCode } from "@/lib/competition-config"
import { getMatchweekTabLabel } from "@/lib/competition-config"
import MainLeaderboard, { type MainLeaderboardInitialData } from "@/components/main-leaderboard"
import LeaderboardTable from "@/components/leaderboard-table"
import { cn } from "@/lib/utils"

const CHIP_LIMIT = 6

type LeaderboardTabsProps = {
  visibleMatchweeks: Matchweek[]
  competition?: CompetitionCode
  initialOverallData?: MainLeaderboardInitialData
}

function TabChip({
  active,
  onClick,
  children,
  isWc = false,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  isWc?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "snap-start shrink-0 px-3 py-2 rounded-full text-sm font-medium min-h-11 transition-colors",
        active
          ? isWc
            ? "bg-green-900 text-white"
            : "bg-pl-purple text-white"
          : isWc
            ? "bg-white/60 hover:bg-white/80 dark:bg-green-950/40 dark:hover:bg-green-950/60"
            : "bg-muted hover:bg-muted/80"
      )}
    >
      {children}
    </button>
  )
}

export default function LeaderboardTabs({
  visibleMatchweeks,
  competition = "PL",
  initialOverallData,
}: LeaderboardTabsProps) {
  const [activeTab, setActiveTab] = useState("main")

  const chipMatchweeks = visibleMatchweeks.slice(0, CHIP_LIMIT)
  const overflowMatchweeks = visibleMatchweeks.slice(CHIP_LIMIT)
  const showOverflowSelect = overflowMatchweeks.length > 0
  const roundUnit = competition === "WC" ? "round" : "matchweek"
  const isWc = competition === "WC"

  const activeMatchweek = visibleMatchweeks.find((mw) => mw.id === activeTab)

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory flex-1">
          <TabChip active={activeTab === "main"} onClick={() => setActiveTab("main")} isWc={isWc}>
            Overall
          </TabChip>
          {chipMatchweeks.map((matchweek) => (
            <TabChip
              key={matchweek.id}
              active={activeTab === matchweek.id}
              onClick={() => setActiveTab(matchweek.id)}
              isWc={isWc}
            >
              {getMatchweekTabLabel(matchweek, competition)}
            </TabChip>
          ))}
        </div>
        {showOverflowSelect && (
          <Select
            value={overflowMatchweeks.some((mw) => mw.id === activeTab) ? activeTab : ""}
            onValueChange={setActiveTab}
          >
            <SelectTrigger className="w-[140px] min-h-11 shrink-0">
              <SelectValue placeholder={`Earlier ${roundUnit}s`} />
            </SelectTrigger>
            <SelectContent>
              {overflowMatchweeks.map((matchweek) => (
                <SelectItem key={matchweek.id} value={matchweek.id}>
                  {getMatchweekTabLabel(matchweek, competition)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {activeTab === "main" && (
        <div>
          {visibleMatchweeks.length === 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              {competition === "WC"
                ? "Round tables appear here once games are played and scored."
                : "Matchweek tables appear here once games are played and scored."}
            </p>
          )}
          <MainLeaderboard initialData={initialOverallData} competition={competition} />
        </div>
      )}

      {activeMatchweek && activeTab === activeMatchweek.id && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {new Date(activeMatchweek.startDate).toLocaleDateString()} –{" "}
            {new Date(activeMatchweek.endDate).toLocaleDateString()}
          </p>
          <LeaderboardTable matchweekId={activeMatchweek.id} competition={competition} />
        </div>
      )}
    </div>
  )
}
