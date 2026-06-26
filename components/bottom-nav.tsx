"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, Trophy, User, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-provider"

const wcActiveBg =
  "bg-[linear-gradient(to_right,#14532d_0%,#14532d_10%,#ca8a04_10%,#eab308_50%,#ca8a04_90%,#14532d_90%,#14532d_100%)]"

type NavItem = {
  href: string
  label: string
  icon: typeof Home
  match: (p: string) => boolean
  isWc?: boolean
}

export default function BottomNav({ wcEventEnabled = false }: { wcEventEnabled?: boolean }) {
  const pathname = usePathname() ?? ""
  const { user } = useAuth()

  const accountItem: NavItem = user
    ? {
        href: "/profile",
        label: "Profile",
        icon: User,
        match: (p) => p.startsWith("/profile"),
      }
    : {
        href: "/sign-in",
        label: "Sign in",
        icon: LogIn,
        match: (p) => p.startsWith("/sign-in"),
      }

  const navItems: NavItem[] = [
    { href: "/", label: "Home", icon: Home, match: (p) => p === "/" },
    {
      href: "/predictions",
      label: "Predict",
      icon: Calendar,
      match: (p) => p.startsWith("/predictions"),
    },
    {
      href: "/leaderboard",
      label: "Rankings",
      icon: Trophy,
      match: (p) => p.startsWith("/leaderboard"),
    },
    ...(wcEventEnabled
      ? [
          {
            href: "/events/world-cup",
            label: "WC Event",
            icon: Trophy,
            match: (p: string) => p.startsWith("/events/world-cup"),
            isWc: true,
          } as NavItem,
        ]
      : []),
    accountItem,
  ]

  const cols = navItems.length

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-white/95 backdrop-blur-sm dark:bg-pl-purple/95 pb-[env(safe-area-inset-bottom)]"
      aria-label="Main navigation"
    >
      <div className={`grid h-16`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {navItems.map(({ href, label, icon: Icon, match, isWc }) => {
          const active = match(pathname)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-h-11 text-xs font-medium transition-colors",
                isWc && active
                  ? cn(wcActiveBg, "text-green-950")
                  : active
                    ? "text-pl-purple dark:text-pl-green"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && !isWc && "scale-110")} />
              <span className="truncate max-w-full px-0.5">{label}</span>
            </Link>
          )
        })}
      </div>
      <div className="h-0.5 w-full bg-pl-gradient" />
    </nav>
  )
}
