import {
  WC_BRACKET_CONNECTOR_WIDTH,
  getMatchCenterY,
  getRoundColumnHeight,
} from "@/lib/wc-bracket-layout"

type WcBracketConnectorsProps = {
  prevRoundIndex: number
  prevMatchCount: number
  nextMatchCount: number
  headerOffset?: number
}

export function WcBracketConnectors({
  prevRoundIndex,
  prevMatchCount,
  nextMatchCount,
  headerOffset = 44,
}: WcBracketConnectorsProps) {
  const height =
    Math.max(
      getRoundColumnHeight(prevMatchCount, prevRoundIndex),
      getRoundColumnHeight(nextMatchCount, prevRoundIndex + 1)
    ) + headerOffset

  const pairCount = Math.floor(prevMatchCount / 2)
  const midX = WC_BRACKET_CONNECTOR_WIDTH / 2

  const paths: string[] = []
  for (let k = 0; k < pairCount; k++) {
    const y1 = headerOffset + getMatchCenterY(prevRoundIndex, k * 2)
    const y2 = headerOffset + getMatchCenterY(prevRoundIndex, k * 2 + 1)
    const mergeY = (y1 + y2) / 2

    paths.push(
      `M 0 ${y1} H ${midX} M 0 ${y2} H ${midX} M ${midX} ${y1} V ${y2} M ${midX} ${mergeY} H ${WC_BRACKET_CONNECTOR_WIDTH}`
    )
  }

  if (pairCount === 0) return null

  return (
    <svg
      width={WC_BRACKET_CONNECTOR_WIDTH}
      height={height}
      className="shrink-0 hidden md:block text-green-800/50 dark:text-green-200/40"
      aria-hidden
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}
