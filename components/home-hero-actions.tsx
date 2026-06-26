"use client"

import Link from "next/link"
import { ArrowRight, LogIn, Trophy, TrendingUp, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-provider"
import { WorldCupEntryLink } from "@/components/world-cup-entry"

type HomeHeroActionsProps = {
  wcEventEnabled?: boolean
}

export function HomeHeroActions({ wcEventEnabled = false }: HomeHeroActionsProps) {
  const { user } = useAuth()

  if (wcEventEnabled) {
    return (
      <div className="flex flex-col sm:flex-row justify-center gap-3 w-full max-w-3xl">
        <Button asChild size="lg" className="bg-pl-purple hover:bg-pl-purple/90 text-white min-h-11 flex-1 sm:flex-none">
          <Link href="/predictions">
            My Season
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <WorldCupEntryLink variant="hero" className="w-full sm:w-auto" />
      </div>
    )
  }

  return (
    <div className="flex flex-wrap justify-center gap-3 w-full max-w-3xl">
      <Button asChild size="lg" className="bg-pl-purple hover:bg-pl-purple/90 text-white min-h-11">
        <Link href="/predictions">
          Make Predictions
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
      <Button asChild size="lg" className="bg-pl-green hover:bg-pl-green/90 text-pl-purple min-h-11">
        <Link href="/leaderboard">
          <Trophy className="mr-2 h-4 w-4" />
          View Leaderboard
        </Link>
      </Button>
      {user ? (
        <>
          <Button asChild size="lg" className="bg-pl-cyan hover:bg-pl-cyan/90 text-pl-purple min-h-11">
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              View Profile
            </Link>
          </Button>
          <Button asChild size="lg" className="bg-pl-red hover:bg-pl-red/90 text-white min-h-11">
            <Link href="/profile">
              <TrendingUp className="mr-2 h-4 w-4" />
              Your Stats
            </Link>
          </Button>
        </>
      ) : (
        <>
          <Button asChild size="lg" className="bg-pl-cyan hover:bg-pl-cyan/90 text-pl-purple min-h-11">
            <Link href="/sign-up">
              <User className="mr-2 h-4 w-4" />
              Join free
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="min-h-11">
            <Link href="/sign-in">
              <LogIn className="mr-2 h-4 w-4" />
              Sign in
            </Link>
          </Button>
        </>
      )}
    </div>
  )
}
