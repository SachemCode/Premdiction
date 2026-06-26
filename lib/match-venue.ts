export function getMatchStadium(
  match: { venue?: string | null },
  homeTeam?: { venue?: string } | null
): string | null {
  return match.venue ?? homeTeam?.venue ?? null
}
