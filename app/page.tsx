/**
 * Home Page Component
 */

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Info, UserPlus } from "lucide-react"
import { HomeHeroActions } from "@/components/home-hero-actions"
import { HomeHeroLogo } from "@/components/home-hero-logo"
import { HomeHowItWorksFlow } from "@/components/home-how-it-works-flow"
import { WorldCupEntryLink } from "@/components/world-cup-entry"
import { APP_NAME } from "@/lib/brand"
import { isWcEventEnabled } from "@/lib/competition-config"

export default async function Home() {
  const wcEventEnabled = isWcEventEnabled()

  return (
    <div className="space-y-8 md:space-y-16">
      <section className="relative py-12 md:py-20 -mt-6 rounded-b-3xl overflow-hidden">
        <div className="absolute inset-0 bg-pl-lavender-stripes dark:bg-pl-gradient dark:opacity-10 pointer-events-none"></div>
        <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center">
          <HomeHeroLogo />

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Predict the beautiful game&apos;s matches with your friends and see who comes out on top
          </p>

          <HomeHeroActions wcEventEnabled={wcEventEnabled} />

          <HomeHowItWorksFlow />
        </div>
      </section>

      {wcEventEnabled && (
        <section className="container mx-auto px-4">
          <div className="game-card p-6 md:p-8 border-border bg-gradient-to-br from-neutral-100 to-white dark:from-neutral-900 dark:to-neutral-800">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[linear-gradient(to_right,#14532d_0%,#14532d_10%,#ca8a04_10%,#eab308_50%,#ca8a04_90%,#14532d_90%,#14532d_100%)] text-xs font-semibold uppercase tracking-wide">
                  <span className="text-green-950 font-bold">FIFA</span>
                  <span className="text-green-950/90">Limited event</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold">World Cup 2026 Knockouts</h2>
                <p className="text-muted-foreground text-sm md:text-base max-w-xl">
                  A side game alongside the Premier League season. Predict knockout scores from the
                  Round of 32 through the Final — separate leaderboard, same friends.
                </p>
              </div>
              <WorldCupEntryLink variant="promo" />
            </div>
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 py-4 md:py-8">
        <div className="game-card p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Invite Your Friends</h2>
          <p className="text-muted-foreground mb-4 text-sm md:text-base">
            Share the sign-up link with friends: <span className="font-medium">/sign-up</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="bg-pl-purple hover:bg-pl-purple/90 text-white min-h-11">
              <Link href="/info">
                <Info className="mr-2 h-4 w-4" />
                How It Works
              </Link>
            </Button>
            <Button asChild variant="outline" className="min-h-11">
              <Link href="/sign-up">
                <UserPlus className="mr-2 h-4 w-4" />
                Create account
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
