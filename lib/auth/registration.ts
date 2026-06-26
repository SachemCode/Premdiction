import { prisma } from "@/lib/prisma"
import type { RegistrationStatus } from "./types"

async function ensureAppSettings() {
  const existing = await prisma.appSettings.findUnique({ where: { id: "default" } })
  if (existing) return existing

  const registrationOpen = process.env.REGISTRATION_OPEN !== "false"

  return prisma.appSettings.create({
    data: {
      id: "default",
      registrationOpen,
      maxUsers: 0,
    },
  })
}

export async function getRegistrationStatus(): Promise<RegistrationStatus> {
  const [settings, userCount] = await Promise.all([
    ensureAppSettings(),
    prisma.user.count(),
  ])

  if (!settings.registrationOpen) {
    return {
      canRegister: false,
      registrationOpen: false,
      userCount,
      reason: "Registration is currently closed",
    }
  }

  return {
    canRegister: true,
    registrationOpen: true,
    userCount,
  }
}

export async function canRegister(): Promise<boolean> {
  const status = await getRegistrationStatus()
  return status.canRegister
}

export async function getAppSettings() {
  return ensureAppSettings()
}

export async function updateAppSettings(data: { registrationOpen?: boolean }) {
  await ensureAppSettings()
  return prisma.appSettings.update({
    where: { id: "default" },
    data,
  })
}
