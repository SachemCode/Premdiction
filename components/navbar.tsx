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
import { User, LogOut, Trophy, Home, Calendar, ShieldCheck } from "lucide-react"
import { WorldCupEntryLink } from "@/components/world-cup-entry"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Team } from "@/lib/types"

/**
 * Navbar Component
 *
 * This component renders the main navigation bar of the application.
 * It includes the logo, main navigation links, theme toggle, and user dropdown menu.
 *
 * Features:
 * - Responsive design with mobile menu
 * - User authentication status display
 * - Theme toggle
 * - Background changes on scroll
 * - User profile dropdown with team support
 * - Mobile-friendly navigation
 *
 * State Management:
 * - Tracks scroll position for dynamic styling
 * - Uses authentication context for user state
 * - Manages active link highlighting
 *
 * @returns The main navigation bar component
 */
export default function Navbar({ wcEventEnabled = false }: { wcEventEnabled?: boolean }) {
  // Get authentication context for user state and sign out functionality
  const { user, signOut } = useAuth()
  
  // Get current path for active link highlighting
  const pathname = usePathname()
  
  // Track scroll position for navbar styling
  const [scrolled, setScrolled] = useState(false)
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

  // Add scroll event listener to change navbar appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-sm shadow-md dark:bg-pl-purple/95" : "bg-white dark:bg-pl-purple"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left side: Logo and main navigation */}
        <div className="flex items-center gap-6">
          {/* Logo with gradient background */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <BrandLogo variant="nav" source="badge" className="h-9 w-9" />
            <span className="text-sm sm:text-xl font-bold text-pl-purple dark:text-white truncate max-w-[7rem] sm:max-w-none">
              {APP_NAME}
            </span>
          </Link>
          
          {/* Desktop navigation links - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={`pl-nav-link ${pathname === "/" ? "pl-nav-link-active" : ""}`}>
              Home
            </Link>
            <Link
              href="/predictions"
              className={`pl-nav-link ${pathname?.startsWith("/predictions") ? "pl-nav-link-active" : ""}`}
            >
              Predictions
            </Link>
            <Link
              href="/leaderboard"
              className={`pl-nav-link ${pathname?.startsWith("/leaderboard") ? "pl-nav-link-active" : ""}`}
            >
              Leaderboard
            </Link>
            {wcEventEnabled && (
              <WorldCupEntryLink
                variant="nav"
                active={pathname?.startsWith("/events/world-cup") ?? false}
              />
            )}
            <Link href="/info" className={`pl-nav-link ${pathname?.startsWith("/info") ? "pl-nav-link-active" : ""}`}>
              Info
            </Link>
          </nav>
        </div>

        {/* Right side: Theme toggle, user menu, mobile menu */}
        <div className="flex items-center gap-4">
          {/* Theme toggle button for light/dark mode */}
          <div className="relative z-[60] shrink-0">
            <ThemeToggle />
          </div>

          {/* User dropdown menu or sign in button based on auth state */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profilePicture || "/placeholder.svg"} />
                    <AvatarFallback className="bg-pl-purple text-white">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* User info section */}
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    {/* Display user's supported team if available */}
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
                
                {/* Profile link */}
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                
                {/* Admin link - Only shown for admin users */}
                {user.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                
                {/* Sign out button */}
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Sign in button for unauthenticated users
            <Button asChild className="bg-pl-purple hover:bg-pl-purple/90 text-white">
              <Link href="/sign-in">Access Game</Link>
            </Button>
          )}

          {/* Mobile menu - hidden; bottom nav handles mobile wayfinding */}
          <div className="hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
                  <span className="sr-only">Open menu</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Mobile navigation links */}
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/predictions">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Predictions</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/leaderboard">
                    <Trophy className="mr-2 h-4 w-4" />
                    <span>Leaderboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/info">
                    <Trophy className="mr-2 h-4 w-4" />
                    <span>Info</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {/* Gradient line at the bottom of the navbar for visual separation */}
      <div className="h-1 w-full bg-pl-gradient"></div>
    </header>
  )
}
