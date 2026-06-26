import Link from "next/link"
import { AuthRequiredPrompt } from "@/components/auth-required-prompt"
import { CreateLeagueForm } from "@/components/create-league-form"
import { JoinLeagueForm } from "@/components/join-league-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSessionUser } from "@/lib/auth"
import { getPrivateLeaguesForUser } from "@/lib/private-leagues"
import { isWcEventEnabled } from "@/lib/competition-config"
import { Users, Trophy } from "lucide-react"

export default async function LeaguesPage() {
  const user = await getSessionUser()
  if (!user) {
    return (
      <AuthRequiredPrompt
        title="My Leagues"
        description="Create a league and invite friends to compete"
        returnTo="/leagues"
      />
    )
  }

  const leagues = await getPrivateLeaguesForUser(user.id)
  const wcEventEnabled = isWcEventEnabled()

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Leagues</h1>
        <p className="text-muted-foreground">
          Create a private league, invite friends, and compare standings
        </p>
      </div>

      {leagues.length > 0 && (
        <div className="grid gap-3">
          {leagues.map((league) => (
            <Link key={league.id} href={`/leagues/${league.id}`}>
              <Card className="pl-card hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-pl-purple" />
                    {league.name}
                  </CardTitle>
                  <CardDescription>
                    {league.memberCount} member{league.memberCount === 1 ? "" : "s"} ·{" "}
                    {league.competitions.join(", ")}
                    {league.role === "owner" ? " · Owner" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="outline" size="sm" className="min-h-9" asChild>
                    <span>
                      <Trophy className="h-4 w-4 mr-1" />
                      View leaderboard
                    </span>
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="pl-card">
          <CardHeader>
            <CardTitle>Create a league</CardTitle>
            <CardDescription>Start a new private league and get an invite link</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateLeagueForm wcEventEnabled={wcEventEnabled} />
          </CardContent>
        </Card>

        <Card className="pl-card">
          <CardHeader>
            <CardTitle>Join with code</CardTitle>
            <CardDescription>Enter an invite code from a friend</CardDescription>
          </CardHeader>
          <CardContent>
            <JoinLeagueForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
