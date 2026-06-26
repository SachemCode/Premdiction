export type User = {
  id: string
  name: string
  email: string
  isAdmin?: boolean
  profilePicture?: string
  supportedTeam?: string
  createdAt: Date
}

export type Team = {
  id: string
  name: string
  shortName: string
  logo: string
  venue?: string
}

export type Match = {
  id: string
  matchweekId: string
  homeTeamId: string
  awayTeamId: string
  kickoff: Date
  homeScore: number | null
  awayScore: number | null
  status: "scheduled" | "live" | "completed"
  venue?: string
  matchInfo?: string
  stage?: string
}

export type Matchweek = {
  id: string
  number: number
  startDate: Date
  endDate: Date
  status: "upcoming" | "active" | "completed"
  label?: string
}

export type Prediction = {
  id: string
  userId: string
  matchId: string
  homeScore: number
  awayScore: number
  points: number | null
}
