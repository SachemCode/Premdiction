export type SessionUser = {
  id: string
  name: string
  email: string
  isAdmin: boolean
  profilePicture?: string | null
  supportedTeam?: string | null
}

export type RegistrationStatus = {
  canRegister: boolean
  registrationOpen: boolean
  userCount: number
  reason?: string
}
