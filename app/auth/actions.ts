"use server"

import { prisma } from "@/lib/prisma"
import {
  canRegister,
  createSession,
  deleteSession,
  getSessionUser,
  hashPassword,
  normalizeEmail,
  validateEmail,
  validatePassword,
  verifyPassword,
} from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function registerAction(data: {
  name: string
  email: string
  password: string
}) {
  const name = data.name.trim()
  const email = normalizeEmail(data.email)

  if (!name) {
    return { success: false, error: "Name is required" }
  }

  const emailError = validateEmail(email)
  if (emailError) return { success: false, error: emailError }

  const passwordError = validatePassword(data.password)
  if (passwordError) return { success: false, error: passwordError }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { success: false, error: "An account with this email already exists. Please sign in instead." }
  }

  if (!(await canRegister())) {
    return { success: false, error: "Registration is closed or the league is full." }
  }

  const userCount = await prisma.user.count()
  const passwordHash = await hashPassword(data.password)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      isAdmin: userCount === 0,
    },
  })

  await createSession(user.id)

  revalidatePath("/")
  return { success: true }
}

export async function loginAction(data: { email: string; password: string }) {
  const email = normalizeEmail(data.email)

  const emailError = validateEmail(email)
  if (emailError) return { success: false, error: emailError }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { success: false, error: "Invalid email or password" }
  }

  const valid = await verifyPassword(data.password, user.passwordHash)
  if (!valid) {
    return { success: false, error: "Invalid email or password" }
  }

  await createSession(user.id)

  revalidatePath("/")
  return { success: true }
}

export async function logoutAction() {
  await deleteSession()
  revalidatePath("/")
  return { success: true }
}

export async function updateProfileAction(data: {
  name?: string
  profilePicture?: string | null
  supportedTeam?: string | null
}) {
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    return { success: false, error: "Not authenticated" }
  }

  const name = data.name?.trim()
  if (name !== undefined && !name) {
    return { success: false, error: "Name cannot be empty" }
  }

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(data.profilePicture !== undefined ? { profilePicture: data.profilePicture } : {}),
      ...(data.supportedTeam !== undefined ? { supportedTeam: data.supportedTeam } : {}),
    },
  })

  revalidatePath("/profile")
  revalidatePath("/profile/edit")
  revalidatePath("/leaderboard")
  return { success: true }
}

export async function updateRegistrationSettingsAction(data: { registrationOpen: boolean }) {
  const sessionUser = await getSessionUser()
  if (!sessionUser?.isAdmin) {
    return { success: false, error: "Admin access required" }
  }

  const { updateAppSettings } = await import("@/lib/auth/registration")
  await updateAppSettings({
    registrationOpen: data.registrationOpen,
  })

  revalidatePath("/admin/registration")
  revalidatePath("/sign-up")
  return { success: true }
}
