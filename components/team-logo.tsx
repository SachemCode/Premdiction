import Image from "next/image"
import { Shield } from "lucide-react"
import { cn } from "@/lib/utils"

export function isTbdTeam(teamId: string): boolean {
  return teamId.startsWith("tbd_")
}

interface TeamLogoProps {
  teamId: string
  logo?: string | null
  alt?: string
  size?: number
  className?: string
}

export function TeamLogo({ teamId, logo, alt, size = 40, className = "" }: TeamLogoProps) {
  const isTbd = isTbdTeam(teamId) || !logo?.trim()

  if (isTbd) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-muted/40 text-muted-foreground",
          className
        )}
        style={{ width: size, height: size }}
      >
        <Shield className="h-3/5 w-3/5" strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <Image
        src={logo}
        alt={alt || `Team logo ${teamId}`}
        width={size}
        height={size}
        className="object-contain"
      />
    </div>
  )
}
