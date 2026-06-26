import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type StatTileProps = {
  icon: LucideIcon
  label: string
  value: string | number
  className?: string
}

export function StatTile({ icon: Icon, label, value, className }: StatTileProps) {
  return (
    <div className={cn("game-card p-4 flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  )
}
