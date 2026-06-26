"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, Trophy, User, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-provider"

type NavItem = {
  href: string
  label: string
  icon: typeof Home
  match: (p: string) => boolean
  isWc?: boolean
}

function bottomNavItemClass(active: boolean, isWc?: boolean) {
  if (!active) return "pl-bottom-nav-item"
  if (isWc) return "pl-bottom-nav-item pl-bottom-nav-item-wc-active"
  return "pl-bottom-nav-item pl-bottom-nav-item-active"
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
      className="pl-bottom-nav fixed bottom-0 left-0 right-0 z-50 md:hidden pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_rgba(0,0,0,0.15)]"
      aria-label="Main navigation"
    >
      <div className="h-0.5 w-full bg-pl-nav-hero" />
      <div className="grid h-16" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {navItems.map(({ href, label, icon: Icon, match, isWc }) => {
          const active = match(pathname)
          return (
            <Link
              key={href}
              href={href}
              className={bottomNavItemClass(active, isWc)}
            >
              <Icon className={cn("h-5 w-5", active && "scale-110")} />
              <span className="truncate max-w-full px-0.5">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
