"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-provider"
import { BrandLogo } from "@/components/brand-logo"
import { APP_NAME } from "@/lib/brand"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, ShieldCheck } from "lucide-react"
import { WorldCupEntryLink } from "@/components/world-cup-entry"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Team } from "@/lib/types"
import { cn } from "@/lib/utils"

function navLinkClass(active: boolean) {
  return cn("pl-nav-bar-link shrink-0", active && "pl-nav-bar-link-active")
}

export default function Navbar({ wcEventEnabled = false }: { wcEventEnabled?: boolean }) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [supportedTeam, setSupportedTeam] = useState<Team | null>(null)

  useEffect(() => {
    if (!user?.supportedTeam) {
      setSupportedTeam(null)
      return
    }
    fetch(`/api/teams/${user.supportedTeam}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((team) => setSupportedTeam(team))
      .catch(() => setSupportedTeam(null))
  }, [user?.supportedTeam])

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Brand bar — gradient hero strip */}
      <div className="relative h-14 md:h-16 overflow-hidden bg-pl-nav-hero">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 md:w-2/5 opacity-30"
          aria-hidden
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 24 L12 12 L24 24 L36 12 L48 24 L48 48 L36 36 L24 48 L12 36 L0 48 Z' fill='%2300FF87' fill-opacity='0.35'/%3E%3C/svg%3E")`,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative container mx-auto flex h-full items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5 md:gap-3 shrink-0 min-w-0">
            <BrandLogo variant="nav" source="badge" className="h-9 w-9 md:h-10 md:w-10" />
            <span className="text-2xl md:text-3xl font-bold tracking-tight leading-none text-pl-purple dark:text-white truncate">
              {APP_NAME}
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="relative z-[60]">
              <ThemeToggle />
            </div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full hover:bg-pl-purple/10"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-pl-purple/20">
                      <AvatarImage src={user.profilePicture || "/placeholder.svg"} />
                      <AvatarFallback className="bg-pl-purple text-white">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      {supportedTeam && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <div className="w-3 h-3">
                            <img
                              src={supportedTeam.logo || `/placeholder.svg?height=12&width=12`}
                              alt={supportedTeam.name}
                              className="max-w-full max-h-full"
                            />
                          </div>
                          <span>{supportedTeam.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        <span>Admin</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                size="sm"
                className="bg-pl-purple hover:bg-pl-purple/90 text-white text-xs sm:text-sm"
              >
                <Link href="/sign-in">Access Game</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Nav bar — dark link row (all breakpoints) */}
      <nav className="pl-nav-bar">
        <div className="container mx-auto flex h-10 md:h-11 items-stretch px-4 gap-3 md:gap-6 overflow-x-auto scrollbar-none">
          <Link href="/" className={navLinkClass(pathname === "/")}>
            Home
          </Link>
          <Link
            href="/predictions"
            className={navLinkClass(pathname?.startsWith("/predictions") ?? false)}
          >
            Predictions
          </Link>
          <Link
            href="/leaderboard"
            className={navLinkClass(pathname?.startsWith("/leaderboard") ?? false)}
          >
            Leaderboard
          </Link>
          {wcEventEnabled && (
            <WorldCupEntryLink
              variant="nav"
              active={pathname?.startsWith("/events/world-cup") ?? false}
            />
          )}
          <Link href="/info" className={navLinkClass(pathname?.startsWith("/info") ?? false)}>
            Info
          </Link>
        </div>
      </nav>
    </header>
  )
}
