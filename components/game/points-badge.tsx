import { cn } from "@/lib/utils"
import { CORRECT_RESULT_POINTS, EXACT_SCORE_POINTS } from "@/lib/prediction-points"

type PointsBadgeProps = {
  points: number
  className?: string
}

export function PointsBadge({ points, className }: PointsBadgeProps) {
  const variant =
    points === EXACT_SCORE_POINTS
      ? "pl-badge-green"
      : points === CORRECT_RESULT_POINTS
        ? "pl-badge-cyan"
        : "pl-badge-red"
  const label = points > 0 ? `+${points} pts` : "0 pts"

  return <span className={cn("pl-badge", variant, className)}>{label}</span>
}
