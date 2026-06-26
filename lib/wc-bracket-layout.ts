/** Fixed bracket geometry — card min-height + gap must match round column styles */
export const WC_BRACKET_CARD_HEIGHT = 96
export const WC_BRACKET_CARD_GAP = 52
export const WC_BRACKET_SLOT_STEP = WC_BRACKET_CARD_HEIGHT + WC_BRACKET_CARD_GAP
export const WC_BRACKET_CONNECTOR_WIDTH = 32

export function getMatchPaddingTop(roundIndex: number, matchIndex: number): number {
  const multiplier = 2 ** roundIndex
  return matchIndex * multiplier * WC_BRACKET_SLOT_STEP + ((multiplier - 1) * WC_BRACKET_SLOT_STEP) / 2
}

export function getMatchCenterY(roundIndex: number, matchIndex: number): number {
  return getMatchPaddingTop(roundIndex, matchIndex) + WC_BRACKET_CARD_HEIGHT / 2
}

export function getRoundColumnHeight(matchCount: number, roundIndex: number): number {
  if (matchCount === 0) return 0
  const lastIndex = matchCount - 1
  return (
    getMatchPaddingTop(roundIndex, lastIndex) + WC_BRACKET_CARD_HEIGHT + WC_BRACKET_CARD_GAP
  )
}
