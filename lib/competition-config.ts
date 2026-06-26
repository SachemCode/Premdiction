export type CompetitionCode = "PL" | "WC"

export type CompetitionType = "league" | "knockout"

export type CompetitionDefinition = {
  code: CompetitionCode
  displayName: string
  type: CompetitionType
  expectedMatchweeks?: number
  expectedMatches?: number
  knockoutStages?: readonly string[]
}

export const KNOCKOUT_STAGES = [
  "LAST_32",
  "LAST_16",
  "QUARTER_FINALS",
  "SEMI_FINALS",
  "THIRD_PLACE",
  "FINAL",
] as const

export type KnockoutStage = (typeof KNOCKOUT_STAGES)[number]

const STAGE_LABELS: Record<KnockoutStage, string> = {
  LAST_32: "Round of 32",
  LAST_16: "Round of 16",
  QUARTER_FINALS: "Quarter-finals",
  SEMI_FINALS: "Semi-finals",
  THIRD_PLACE: "Third-place play-off",
  FINAL: "Final",
}

const STAGE_ORDER: Record<KnockoutStage, number> = {
  LAST_32: 1,
  LAST_16: 2,
  QUARTER_FINALS: 3,
  SEMI_FINALS: 4,
  THIRD_PLACE: 5,
  FINAL: 6,
}

export const COMPETITIONS: Record<CompetitionCode, CompetitionDefinition> = {
  PL: {
    code: "PL",
    displayName: "Premier League",
    type: "league",
    expectedMatchweeks: 38,
    expectedMatches: 380,
  },
  WC: {
    code: "WC",
    displayName: "World Cup 2026",
    type: "knockout",
    expectedMatchweeks: 6,
    expectedMatches: 32,
    knockoutStages: KNOCKOUT_STAGES,
  },
}

export const DEFAULT_COMPETITION: CompetitionCode = "PL"

export function getDefaultCompetitionCode(): CompetitionCode {
  return DEFAULT_COMPETITION
}

export function getCompetitionCodeFromContext(competition?: CompetitionCode): CompetitionCode {
  return competition ?? DEFAULT_COMPETITION
}

/** @deprecated Use getDefaultCompetitionCode() or pass competition explicitly */
export function getActiveCompetitionCode(): CompetitionCode {
  return getDefaultCompetitionCode()
}

export function getCompetition(competition?: CompetitionCode): CompetitionDefinition {
  return COMPETITIONS[getCompetitionCodeFromContext(competition)]
}

/** @deprecated Use getCompetition() */
export function getActiveCompetition(): CompetitionDefinition {
  return getCompetition()
}

export function getCompetitionDisplayName(competition?: CompetitionCode): string {
  if (competition) return COMPETITIONS[competition].displayName
  return process.env.COMPETITION_DISPLAY_NAME ?? COMPETITIONS.PL.displayName
}

export function isWcEventEnabled(): boolean {
  const raw = process.env.EVENT_WC_ENABLED
  if (raw === "false" || raw === "0") return false
  return raw === "true" || raw === "1" || raw === undefined
}

export function isKnockoutCompetition(code?: CompetitionCode): boolean {
  const c = getCompetitionCodeFromContext(code)
  return COMPETITIONS[c].type === "knockout"
}

const NUMBER_TO_STAGE: Record<number, KnockoutStage> = {
  1: "LAST_32",
  2: "LAST_16",
  3: "QUARTER_FINALS",
  4: "SEMI_FINALS",
  5: "THIRD_PLACE",
  6: "FINAL",
}

export function getKnockoutRoundName(matchweek: { number: number; label?: string }): string {
  if (matchweek.label?.trim()) return matchweek.label.trim()
  const stage = NUMBER_TO_STAGE[matchweek.number]
  if (stage) return STAGE_LABELS[stage]
  return STAGE_LABELS.LAST_32
}

export function getMatchweekTabLabel(matchweek: { number: number; label?: string }, competition?: CompetitionCode): string {
  if (isKnockoutCompetition(competition)) {
    return getKnockoutRoundName(matchweek)
  }
  return `MW ${matchweek.number}`
}

export function isKnockoutStage(stage: string | null | undefined): stage is KnockoutStage {
  return !!stage && (KNOCKOUT_STAGES as readonly string[]).includes(stage)
}

export function getKnockoutStageLabel(stage: string | null | undefined): string | null {
  if (!stage || !isKnockoutStage(stage)) return null
  return STAGE_LABELS[stage]
}

export function getKnockoutStageOrder(stage: string): number {
  if (isKnockoutStage(stage)) return STAGE_ORDER[stage]
  return 999
}

export function getSeasonSyncWarning(
  competition: CompetitionCode,
  matchweekCount: number,
  matchCount: number
): string | null {
  const def = COMPETITIONS[competition]
  const expectedMw = def.expectedMatchweeks
  const expectedMatches = def.expectedMatches
  if (expectedMw == null || expectedMatches == null) return null

  if (matchweekCount === expectedMw && matchCount === expectedMatches) return null

  const parts: string[] = []
  if (matchweekCount !== expectedMw) {
    parts.push(`${matchweekCount}/${expectedMw} rounds`)
  }
  if (matchCount !== expectedMatches) {
    parts.push(`${matchCount}/${expectedMatches} matches`)
  }

  const unit = def.type === "knockout" ? "knockout rounds" : "matchweeks"
  return `Synced ${parts.join(" · ")}. Re-run fixture sync when the full ${def.displayName} schedule is available.`
}
