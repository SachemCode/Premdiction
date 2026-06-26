export const EXACT_SCORE_POINTS = 4
export const CORRECT_RESULT_POINTS = 2

export function calculatePredictionPoints(
  predHome: number,
  predAway: number,
  actualHome: number,
  actualAway: number
): number {
  if (predHome === actualHome && predAway === actualAway) return EXACT_SCORE_POINTS
  const predResult = Math.sign(predHome - predAway)
  const actualResult = Math.sign(actualHome - actualAway)
  if (predResult === actualResult) return CORRECT_RESULT_POINTS
  return 0
}
