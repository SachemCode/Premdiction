import { formatDateTimeDDMMYYYY } from "@/lib/date-format"

const OPEN_DAYS_BEFORE = 7
const CLOSE_HOURS_BEFORE = 2

export const SCORE_WHEEL_MAX = 15
export const SCORE_INPUT_MAX = 1000
export const SCORE_RANDOM_MAX = 7

export type PredictionWindow = {
  opensAt: Date
  closesAt: Date
}

export type PredictionWindowStatus = "not_open" | "open" | "closed"

export function getFirstKickoff(matches: { kickoff: Date | string }[]): Date | null {
  if (matches.length === 0) return null
  const times = matches.map((m) => new Date(m.kickoff).getTime())
  return new Date(Math.min(...times))
}

export function getPredictionWindow(
  startDate: Date | string,
  firstKickoff: Date | string | null
): PredictionWindow | null {
  if (!firstKickoff) return null

  const opensAt = new Date(startDate)
  opensAt.setDate(opensAt.getDate() - OPEN_DAYS_BEFORE)

  const closesAt = new Date(firstKickoff)
  closesAt.setHours(closesAt.getHours() - CLOSE_HOURS_BEFORE)

  return { opensAt, closesAt }
}

export function getPredictionWindowStatus(
  now: Date,
  window: PredictionWindow | null
): PredictionWindowStatus {
  if (!window) return "closed"

  if (now < window.opensAt) return "not_open"
  if (now >= window.closesAt) return "closed"
  return "open"
}

export function formatPredictionWindowMessage(
  status: PredictionWindowStatus,
  window: PredictionWindow | null
): string {
  if (!window) return "Prediction window unavailable"

  switch (status) {
    case "not_open":
      return `Predictions open on ${formatDateTimeDDMMYYYY(window.opensAt)}`
    case "open":
      return `Deadline: ${formatDateTimeDDMMYYYY(window.closesAt)}`
    case "closed":
      return "Prediction window closed"
  }
}

export function randomScore(max = SCORE_RANDOM_MAX): number {
  return Math.floor(Math.random() * (max + 1))
}

export const KNOCKOUT_CLOSE_MINUTES_BEFORE = 30

export function isTbdTeamId(teamId: string): boolean {
  return teamId.startsWith("tbd_")
}

export function bothKnockoutTeamsKnown(homeTeamId: string, awayTeamId: string): boolean {
  return !isTbdTeamId(homeTeamId) && !isTbdTeamId(awayTeamId)
}

export function getKnockoutMatchWindow(
  kickoff: Date | string,
  bothTeamsKnown: boolean
): PredictionWindow | null {
  if (!bothTeamsKnown) return null

  const closesAt = new Date(kickoff)
  closesAt.setMinutes(closesAt.getMinutes() - KNOCKOUT_CLOSE_MINUTES_BEFORE)

  return {
    opensAt: new Date(0),
    closesAt,
  }
}

export function getKnockoutMatchWindowStatus(
  now: Date,
  kickoff: Date | string,
  bothTeamsKnown: boolean
): PredictionWindowStatus {
  if (!bothTeamsKnown) return "not_open"

  const window = getKnockoutMatchWindow(kickoff, bothTeamsKnown)
  if (!window) return "closed"

  if (now >= window.closesAt) return "closed"
  return "open"
}

export function formatKnockoutPredictionWindowMessage(
  status: PredictionWindowStatus,
  kickoff: Date | string,
  bothTeamsKnown: boolean
): string {
  if (!bothTeamsKnown) return "Waiting for both teams to be confirmed"

  const window = getKnockoutMatchWindow(kickoff, bothTeamsKnown)
  if (!window) return "Prediction window unavailable"

  switch (status) {
    case "not_open":
      return "Predictions are not open yet"
    case "open":
      return `Deadline: ${formatDateTimeDDMMYYYY(window.closesAt)} (30 min before kickoff)`
    case "closed":
      return "Prediction window closed"
  }
}
