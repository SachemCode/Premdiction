export type FootballDataTeam = {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string
  venue?: string
}

export type FootballDataTeamsResponse = {
  teams: FootballDataTeam[]
  count?: number
}

export type FootballDataMatchTeam = {
  id: number | null
  name?: string | null
  shortName?: string | null
  tla?: string | null
}

export type FootballDataMatch = {
  id: number
  utcDate: string
  status: string
  matchday: number
  stage?: string | null
  venue?: string | null
  homeTeam: FootballDataMatchTeam
  awayTeam: FootballDataMatchTeam
  score?: {
    fullTime?: {
      home: number | null
      away: number | null
    }
    regularTime?: {
      home: number | null
      away: number | null
    }
  }
}

export type FootballDataMatchesResponse = {
  matches: FootballDataMatch[]
  count?: number
  resultSet?: { count: number }
}
