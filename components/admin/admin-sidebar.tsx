"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Trophy, ListChecks, Home, KeyRound, ShieldCheck } from "lucide-react"

/**
 * AdminSidebar Component
 *
 * This component renders the sidebar navigation for the admin panel.
 * It provides links to various admin sections like matchweeks, matches, results, etc.
 *
 * Features:
 * - Highlights the active section
 * - Organizes admin functions into logical groups
 * - Uses icons for better visual recognition
 *
 * @returns The admin sidebar navigation component
 */
export function AdminSidebar() {
  // Get current path to highlight active link
  const pathname = usePathname()

  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 h-full border-r dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Admin Panel
        </h2>
      </div>

      <div className="flex flex-col p-4 gap-1 flex-1">
        {/* Dashboard link */}
        <Link
          href="/admin"
          className={`flex items-center gap-2 px-3 py-2 rounded-md ${
            pathname === "/admin" ? "bg-pl-purple text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <Home className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>

        {/* Section header for Matchweeks */}
        <div className="mt-4 mb-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Matchweeks & Matches
        </div>

        {/* Manage Matchweeks link */}
        <Link
          href="/admin/matchweeks"
          className={`flex items-center gap-2 px-3 py-2 rounded-md ${
            isActive("/admin/matchweeks") ? "bg-pl-purple text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Manage Matchweeks</span>
        </Link>

        {/* Manage Matches link */}
        <Link
          href="/admin/matches"
          className={`flex items-center gap-2 px-3 py-2 rounded-md ${
            isActive("/admin/matches") ? "bg-pl-purple text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <ListChecks className="h-4 w-4" />
          <span>Manage Matches</span>
        </Link>

        {/* Results link */}
        <Link
          href="/admin/results"
          className={`flex items-center gap-2 px-3 py-2 rounded-md ${
            isActive("/admin/results") ? "bg-pl-purple text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <Trophy className="h-4 w-4" />
          <span>Enter Results</span>
        </Link>

        {/* Section header for System */}
        <div className="mt-4 mb-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          System
        </div>

        <Link
          href="/admin/registration"
          className={`flex items-center gap-2 px-3 py-2 rounded-md ${
            isActive("/admin/registration") ? "bg-pl-purple text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <KeyRound className="h-4 w-4" />
          <span>Registration</span>
        </Link>
      </div>

      {/* Footer with version info */}
      <div className="p-4 border-t dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        Premdiction Admin v1.0
      </div>
    </div>
  )
}
