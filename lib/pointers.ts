/**
 * Pointers System
 * 
 * This module manages the special event prediction system (pointers) for matches.
 * Pointers are special events that users can predict for each match, with associated
 * rewards and penalties based on correct/incorrect predictions.
 * 
 * Features:
 * - Pointer definitions with rewards/penalties
 * - User pointer selection management
 * - Match pointer outcome tracking
 * - Points calculation for pointer predictions
 * 
 * Data Structures:
 * - PointerDefinition: Defines a pointer type with its properties
 * - UserPointerSelection: Tracks user's pointer selections for matches
 * - MatchPointerOutcome: Records actual pointer outcomes for matches
 * 
 * Key Functions:
 * - calculatePointerPoints: Calculates points earned from pointer predictions
 * - getUserPointerSelections: Retrieves a user's pointer selections
 * - getMatchPointerOutcomes: Gets actual pointer outcomes for a match
 */

// Types of pointers available in the game
export type PointerType =
  | "red_card"
  | "penalty_goal"
  | "no_yellow_cards"
  | "own_goal"
  | "goalkeeper_goal"
  | "hat_trick"
  | "motm"

// Definition of a pointer with its rewards and penalties
export interface PointerDefinition {
  id: PointerType
  name: string
  description: string
  pointsIfCorrect: number
  pointsIfWrong: number
  icon: string // Lucide icon name
  requiresDetails?: boolean // Whether this pointer requires additional details
}

// A user's pointer selection for a specific match
export interface UserPointerSelection {
  userId: string
  matchId: string
  selectedPointers: PointerType[]
  details?: Record<string, string> // Additional details for pointers that require them
  timestamp: Date
}

// The outcome of pointers for a specific match
export interface MatchPointerOutcome {
  matchId: string
  pointerOutcomes: {
    pointerId: PointerType
    occurred: boolean
    details?: string // Optional details (e.g., player name for MOTM)
  }[]
}

/**
 * Available match pointers with their definitions
 * Each pointer has:
 * - Unique identifier
 * - Display name
 * - Description
 * - Points for correct/incorrect predictions
 * - Associated icon
 * - Optional requirement for additional details
 */
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
    description: "A goal will be scored from a penalty kick",
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
]

// In-memory storage for user pointer selections
const userPointerSelections: UserPointerSelection[] = []

// In-memory storage for match pointer outcomes
const matchPointerOutcomes: MatchPointerOutcome[] = []

// Function to get all available match pointers
export function getMatchPointers() {
  return MATCH_POINTERS
}

// Function to save a user's pointer selections for a match
export function saveUserPointerSelections(
  userId: string,
  matchId: string,
  selectedPointers: PointerType[],
  details?: Record<string, string>,
): UserPointerSelection {
  // Check if user already has selections for this match
  const existingIndex = userPointerSelections.findIndex(
    (selection) => selection.userId === userId && selection.matchId === matchId,
  )

  const newSelection = {
    userId,
    matchId,
    selectedPointers,
    details,
    timestamp: new Date(),
  }

  if (existingIndex >= 0) {
    userPointerSelections[existingIndex] = newSelection
  } else {
    userPointerSelections.push(newSelection)
  }

  return newSelection
}

// Function to get a user's pointer selections for a match
export function getUserPointerSelections(userId: string, matchId: string): UserPointerSelection | undefined {
  return userPointerSelections.find((selection) => selection.userId === userId && selection.matchId === matchId)
}

// Function to get all user pointer selections for a matchweek
export function getUserPointerSelectionsByMatchweek(userId: string, _matchweekId: string): UserPointerSelection[] {
  return userPointerSelections.filter((selection) => selection.userId === userId)
}

// Function to save pointer outcomes for a match
export function saveMatchPointerOutcomes(
  matchId: string,
  outcomes: { pointerId: PointerType; occurred: boolean; details?: string }[],
): MatchPointerOutcome {
  const existingIndex = matchPointerOutcomes.findIndex((outcome) => outcome.matchId === matchId)

  const newOutcome = {
    matchId,
    pointerOutcomes: outcomes,
  }

  if (existingIndex >= 0) {
    matchPointerOutcomes[existingIndex] = newOutcome
  } else {
    matchPointerOutcomes.push(newOutcome)
  }

  return newOutcome
}

// Function to get pointer outcomes for a match
export function getMatchPointerOutcomes(matchId: string): MatchPointerOutcome | undefined {
  return matchPointerOutcomes.find((outcome) => outcome.matchId === matchId)
}

/**
 * Calculates pointer points for a user for a specific match
 * 
 * @param userId - The ID of the user
 * @param matchId - The ID of the match
 * @returns Object containing total points and detailed results for each pointer
 */
export function calculatePointerPoints(
  userId: string,
  matchId: string,
): {
  totalPoints: number
  pointerResults: {
    pointerId: PointerType
    points: number
    correct: boolean
  }[]
} {
  // Get user's pointer selections
  const userSelections = getUserPointerSelections(userId, matchId)

  if (!userSelections || userSelections.selectedPointers.length === 0) {
    return { totalPoints: 0, pointerResults: [] }
  }

  // Get match outcomes
  const matchOutcomes = getMatchPointerOutcomes(matchId)

  if (!matchOutcomes) {
    return { totalPoints: 0, pointerResults: [] }
  }

  let totalPoints = 0
  const pointerResults: {
    pointerId: PointerType
    points: number
    correct: boolean
  }[] = []

  // For each selected pointer, check if it occurred in the match
  for (const pointerId of userSelections.selectedPointers) {
    const outcome = matchOutcomes.pointerOutcomes.find((o) => o.pointerId === pointerId)
    let pointerOccurred = outcome?.occurred || false

    // For MOTM, check if the player name matches
    if (pointerId === "motm" && outcome?.occurred && userSelections.details?.motm) {
      // Case-insensitive comparison of player names
      pointerOccurred = userSelections.details.motm.toLowerCase() === (outcome.details || "").toLowerCase()
    }

    // Find the pointer definition
    const pointerDef = MATCH_POINTERS.find((p) => p.id === pointerId)

    if (pointerDef) {
      const points = pointerOccurred ? pointerDef.pointsIfCorrect : pointerDef.pointsIfWrong
      totalPoints += points

      pointerResults.push({
        pointerId,
        points,
        correct: pointerOccurred,
      })
    }
  }

  return { totalPoints, pointerResults }
}

// Function to calculate total pointer points for a user for a matchweek
export function calculateMatchweekPointerPoints(userId: string, _matchweekId: string): number {
  const userSelections = userPointerSelections.filter((selection) => selection.userId === userId)

  let totalPoints = 0

  for (const selection of userSelections) {
    const { totalPoints: matchPoints } = calculatePointerPoints(userId, selection.matchId)
    totalPoints += matchPoints
  }

  return totalPoints
}

// Function to get all user pointer selections
export function getAllUserPointerSelections(): UserPointerSelection[] {
  return userPointerSelections
}

// Function to get all match pointer outcomes
export function getAllMatchPointerOutcomes(): MatchPointerOutcome[] {
  return matchPointerOutcomes
}
