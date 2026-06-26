import Image from "next/image"
import {
  APP_NAME,
  LOGO_SIZES,
  logoUrlFull,
  logoUrlHero,
  logoUrlHome,
  logoUrlIcon,
  logoUrlSphere,
  logoUrlSphereBadge,
} from "@/lib/brand"
import { cn } from "@/lib/utils"

type BrandLogoProps = {
  variant?: keyof typeof LOGO_SIZES
  source?: "full" | "icon" | "home" | "hero" | "sphere" | "badge"
  className?: string
  priority?: boolean
}

export function BrandLogo({
  variant = "full",
  source,
  className,
  priority,
}: BrandLogoProps) {
  const resolvedSource = source ?? (variant === "nav" ? "badge" : "full")
  const { width, height } = LOGO_SIZES[variant]
  const src =
    resolvedSource === "icon"
      ? logoUrlIcon()
      : resolvedSource === "home"
        ? logoUrlHome()
        : resolvedSource === "hero"
          ? logoUrlHero()
          : resolvedSource === "sphere"
            ? logoUrlSphere()
            : resolvedSource === "badge"
              ? logoUrlSphereBadge()
              : logoUrlFull()

  return (
    <Image
      src={src}
      alt={APP_NAME}
      width={width}
      height={height}
      className={cn("object-contain", className)}
      priority={priority}
    />
  )
}
