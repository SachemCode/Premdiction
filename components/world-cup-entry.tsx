import Link from "next/link"
import { cn } from "@/lib/utils"

const WC_HREF = "/events/world-cup"

const wcButtonBg =
  "bg-[linear-gradient(to_right,#14532d_0%,#14532d_10%,#ca8a04_10%,#eab308_50%,#ca8a04_90%,#14532d_90%,#14532d_100%)]"

const trophyClip =
  "[clip-path:polygon(8%_0%,92%_0%,100%_18%,100%_72%,88%_100%,12%_100%,0%_72%,0%_18%)]"

function FifaWorldCupLabel({ size = "base" }: { size?: "sm" | "base" }) {
  return (
    <span
      className={cn(
        "font-bold tracking-wide uppercase text-green-950",
        size === "sm" ? "text-xs" : "text-sm sm:text-base"
      )}
    >
      FIFA World Cup
    </span>
  )
}

type WorldCupEntryProps = {
  variant: "hero" | "nav" | "promo"
  className?: string
  active?: boolean
}

export function WorldCupEntryLink({ variant, className, active = false }: WorldCupEntryProps) {
  if (variant === "hero") {
    return (
      <Link
        href={WC_HREF}
        className={cn(
          "flex flex-col items-center justify-center gap-1 min-h-11 flex-1 sm:flex-none px-5 py-3 shadow-md hover:opacity-95 transition-opacity text-center",
          wcButtonBg,
          trophyClip,
          className
        )}
      >
        <FifaWorldCupLabel />
        <span className="text-green-950/80 text-xs font-medium">Limited time event</span>
      </Link>
    )
  }

  if (variant === "promo") {
    return (
      <Link
        href={WC_HREF}
        className={cn(
          "inline-flex flex-col items-center justify-center gap-0.5 min-h-11 shrink-0 px-5 py-2.5 shadow-sm hover:opacity-95 transition-opacity text-center",
          wcButtonBg,
          trophyClip,
          className
        )}
      >
        <FifaWorldCupLabel size="sm" />
        <span className="text-green-950/80 text-[10px] font-medium">Limited time</span>
      </Link>
    )
  }

  return (
    <Link
      href={WC_HREF}
      className={cn(
        "pl-nav-bar-link inline-flex items-center gap-1 rounded-sm px-1.5 -mx-0.5",
        "text-amber-200 hover:text-amber-100 font-semibold tracking-wide uppercase text-[10px] md:text-xs",
        active && "pl-nav-bar-link-active text-amber-100",
        className
      )}
    >
      <span>FIFA World Cup</span>
    </Link>
  )
}
