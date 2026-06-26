const DATE_OPTS: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
}

const TIME_OPTS: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value)
}

export function formatDateDDMMYYYY(date: Date | string): string {
  return toDate(date).toLocaleDateString("en-GB", DATE_OPTS)
}

export function formatDateTimeDDMMYYYY(date: Date | string): string {
  const d = toDate(date)
  return `${d.toLocaleDateString("en-GB", DATE_OPTS)}, ${d.toLocaleTimeString("en-GB", TIME_OPTS)}`
}

export function formatTimeHHMM(date: Date | string): string {
  return toDate(date).toLocaleTimeString("en-GB", TIME_OPTS)
}

const BRACKET_KICKOFF_OPTS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
}

export function formatBracketKickoff(date: Date | string): string {
  return toDate(date).toLocaleString("en-GB", BRACKET_KICKOFF_OPTS)
}
