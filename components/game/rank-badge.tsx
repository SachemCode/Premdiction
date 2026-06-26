import { Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

type RankBadgeProps = {
  rank: number
  className?: string
}

export function RankBadge({ rank, className }: RankBadgeProps) {
  if (rank === 1) {
    return (
      <div
        className={cn(
          "w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center",
          className
        )}
      >
        <Trophy className="h-4 w-4 text-yellow-600" />
      </div>
    )
  }

  const bg =
    rank === 2
      ? "bg-gray-100 dark:bg-gray-800/30"
      : rank === 3
        ? "bg-amber-100 dark:bg-amber-900/30"
        : "bg-muted"

  return (
    <div
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
        bg,
        className
      )}
    >
      {rank}
    </div>
  )
}
