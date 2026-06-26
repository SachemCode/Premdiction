import {
  WC_BRACKET_CARD_HEIGHT,
  getMatchPaddingTop,
  getRoundColumnHeight,
} from "@/lib/wc-bracket-layout"
import { cn } from "@/lib/utils"

type WcBracketRoundColumnProps<T> = {
  roundName: string
  roundIndex: number
  matchCount: number
  matches: T[]
  isCurrent?: boolean
  setColumnRef?: (el: HTMLDivElement | null) => void
  renderMatch: (match: T, matchIndex: number) => React.ReactNode
}

export function WcBracketRoundColumn<T>({
  roundName,
  roundIndex,
  matchCount,
  matches,
  isCurrent,
  setColumnRef,
  renderMatch,
}: WcBracketRoundColumnProps<T>) {
  const columnHeight = getRoundColumnHeight(matchCount, roundIndex)

  return (
    <div
      ref={setColumnRef}
      className={cn(
        "shrink-0 snap-center flex flex-col",
        "w-[88vw] md:w-[72vw] max-w-xl",
        isCurrent && "opacity-100"
      )}
    >
      <h2
        className={cn(
          "text-lg font-bold mb-3 text-green-950 dark:text-green-50",
          isCurrent && "text-green-900 dark:text-amber-100"
        )}
      >
        {roundName}
      </h2>
      <div className="relative" style={{ minHeight: columnHeight || undefined }}>
        {matches.map((match, matchIndex) => (
          <div
            key={matchIndex}
            className="absolute left-0 right-0"
            style={{
              top: getMatchPaddingTop(roundIndex, matchIndex),
              minHeight: WC_BRACKET_CARD_HEIGHT,
            }}
          >
            {renderMatch(match, matchIndex)}
          </div>
        ))}
      </div>
    </div>
  )
}
