/**
 * Pointer definitions and outcome scoring (selections persisted via lib/pointers-store.ts).
 */

export type PointerType =
  | "red_card"
  | "penalty_goal"
  | "no_yellow_cards"
  | "own_goal"
  | "goalkeeper_goal"
  | "hat_trick"
  | "motm"
  | "penalty_shootout"

export interface PointerDefinition {
  id: PointerType
  name: string
  description: string
  pointsIfCorrect: number
  pointsIfWrong: number
  icon: string
  requiresDetails?: boolean
  knockoutOnly?: boolean
}

export interface UserPointerSelection {
  userId: string
  matchId: string
  selectedPointers: PointerType[]
  details?: Record<string, string>
  timestamp: Date
}

export interface MatchPointerOutcome {
  matchId: string
  pointerOutcomes: {
    pointerId: PointerType
    occurred: boolean
    details?: string
  }[]
}

export const MATCH_POINTERS: PointerDefinition[] = [
  {
    id: "red_card",
    name: "Red Card",
    description: "A red card will be shown during the match",
    pointsIfCorrect: 2,
    pointsIfWrong: -1,
    icon: "square",
  },
  {
    id: "penalty_goal",
    name: "Penalty Goal",
    description: "A goal will be scored from a penalty kick during open play",
    pointsIfCorrect: 2,
    pointsIfWrong: -1,
    icon: "target",
  },
  {
    id: "no_yellow_cards",
    name: "No Yellow Cards",
    description: "No yellow cards will be shown during the match",
    pointsIfCorrect: 5,
    pointsIfWrong: -3,
    icon: "ban",
  },
  {
    id: "own_goal",
    name: "Own Goal",
    description: "An own goal will be scored during the match",
    pointsIfCorrect: 2,
    pointsIfWrong: -1,
    icon: "arrow-left-right",
  },
  {
    id: "goalkeeper_goal",
    name: "Goalkeeper Goal",
    description: "A goalkeeper will score a goal",
    pointsIfCorrect: 10,
    pointsIfWrong: -5,
    icon: "hand",
  },
  {
    id: "hat_trick",
    name: "Hat Trick",
    description: "A player will score a hat trick (3+ goals)",
    pointsIfCorrect: 4,
    pointsIfWrong: -2,
    icon: "trophy",
  },
  {
    id: "motm",
    name: "Man of the Match",
    description: "Predict the Man of the Match",
    pointsIfCorrect: 3,
    pointsIfWrong: -1,
    icon: "medal",
    requiresDetails: true,
  },
  {
    id: "penalty_shootout",
    name: "Penalty Shootout",
    description: "The match will be decided by a penalty shootout after extra time",
    pointsIfCorrect: 3,
    pointsIfWrong: -1,
    icon: "target",
    requiresDetails: true,
    knockoutOnly: true,
  },
]

const KNOCKOUT_POINTER_IDS: PointerType[] = [
  "penalty_shootout",
  "red_card",
  "penalty_goal",
  "hat_trick",
  "motm",
]

export function getMatchPointers(): PointerDefinition[] {
  return MATCH_POINTERS.filter((p) => !p.knockoutOnly)
}

export function getKnockoutPointers(): PointerDefinition[] {
  return KNOCKOUT_POINTER_IDS.map((id) => MATCH_POINTERS.find((p) => p.id === id)!).filter(Boolean)
}

export function isPointerType(value: string): value is PointerType {
  return MATCH_POINTERS.some((p) => p.id === value)
}

const matchPointerOutcomes: MatchPointerOutcome[] = []

export function saveMatchPointerOutcomes(
  matchId: string,
  outcomes: { pointerId: PointerType; occurred: boolean; details?: string }[]
): MatchPointerOutcome {
  const existingIndex = matchPointerOutcomes.findIndex((outcome) => outcome.matchId === matchId)
  const newOutcome = { matchId, pointerOutcomes: outcomes }

  if (existingIndex >= 0) {
    matchPointerOutcomes[existingIndex] = newOutcome
  } else {
    matchPointerOutcomes.push(newOutcome)
  }

  return newOutcome
}

export function getMatchPointerOutcomes(matchId: string): MatchPointerOutcome | undefined {
  return matchPointerOutcomes.find((outcome) => outcome.matchId === matchId)
}

export function getAllMatchPointerOutcomes(): MatchPointerOutcome[] {
  return matchPointerOutcomes
}

function isPointerCorrect(
  pointerId: PointerType,
  outcome: { occurred: boolean; details?: string } | undefined,
  userDetails?: Record<string, string>
): boolean {
  if (!outcome?.occurred) return false

  if (pointerId === "motm" && userDetails?.motm) {
    return userDetails.motm.toLowerCase() === (outcome.details || "").toLowerCase()
  }

  if (pointerId === "penalty_shootout" && userDetails?.penalty_shootout_winner) {
    return userDetails.penalty_shootout_winner === (outcome.details || "")
  }

  return true
}

export function calculatePointerPointsFromSelection(
  userSelections: UserPointerSelection,
  matchOutcomes: MatchPointerOutcome | undefined
): {
  totalPoints: number
  pointerResults: { pointerId: PointerType; points: number; correct: boolean }[]
} {
  if (!userSelections.selectedPointers.length) {
    return { totalPoints: 0, pointerResults: [] }
  }

  if (!matchOutcomes) {
    return { totalPoints: 0, pointerResults: [] }
  }

  let totalPoints = 0
  const pointerResults: { pointerId: PointerType; points: number; correct: boolean }[] = []

  for (const pointerId of userSelections.selectedPointers) {
    const outcome = matchOutcomes.pointerOutcomes.find((o) => o.pointerId === pointerId)
    const correct = isPointerCorrect(pointerId, outcome, userSelections.details)
    const pointerDef = MATCH_POINTERS.find((p) => p.id === pointerId)

    if (pointerDef) {
      const points = correct ? pointerDef.pointsIfCorrect : pointerDef.pointsIfWrong
      totalPoints += points
      pointerResults.push({ pointerId, points, correct })
    }
  }

  return { totalPoints, pointerResults }
}

/** @deprecated Use getUserPointerSelectionsFromDb via server action */
export function getUserPointerSelections(_userId: string, _matchId: string): UserPointerSelection | undefined {
  return undefined
}

/** @deprecated Selections are stored in the database */
export function saveUserPointerSelections(
  userId: string,
  matchId: string,
  selectedPointers: PointerType[],
  details?: Record<string, string>
): UserPointerSelection {
  return { userId, matchId, selectedPointers, details, timestamp: new Date() }
}

/** @deprecated Use getUserPointerSelectionsForUserFromDb on the server */
export function getAllUserPointerSelections(): UserPointerSelection[] {
  return []
}

export function calculatePointerPoints(
  userId: string,
  matchId: string
): ReturnType<typeof calculatePointerPointsFromSelection> {
  const userSelections = getUserPointerSelections(userId, matchId)
  if (!userSelections) return { totalPoints: 0, pointerResults: [] }
  return calculatePointerPointsFromSelection(userSelections, getMatchPointerOutcomes(matchId))
}

export function calculateMatchweekPointerPoints(_userId: string, _matchweekId: string): number {
  return 0
}

export function getUserPointerSelectionsByMatchweek(_userId: string, _matchweekId: string): UserPointerSelection[] {
  return []
}
