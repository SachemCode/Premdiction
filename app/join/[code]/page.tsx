import Link from "next/link"
import { redirect } from "next/navigation"
import { AuthRequiredPrompt } from "@/components/auth-required-prompt"
import { JoinLeagueForm } from "@/components/join-league-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSessionUser } from "@/lib/auth"
import { joinPrivateLeagueByCode } from "@/lib/private-leagues"

export default async function JoinLeaguePage({
  params,
}: {
  params: { code: string }
}) {
  const user = await getSessionUser()
  const code = params.code?.trim()

  if (!code) {
    redirect("/leagues")
  }

  if (!user) {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Join a league</h1>
          <p className="text-muted-foreground">Sign in to join with invite code</p>
        </div>
        <AuthRequiredPrompt
          title="Join league"
          description="Sign in or create an account to join this league"
          returnTo={`/join/${code}`}
        />
      </div>
    )
  }

  try {
    const league = await joinPrivateLeagueByCode(user.id, code)
    redirect(`/leagues/${league.id}`)
  } catch {
    return (
      <div className="space-y-6 max-w-md mx-auto min-w-0">
        <div>
          <h1 className="text-2xl font-bold">Join a league</h1>
          <p className="text-muted-foreground">Enter your invite code below</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Invite code</CardTitle>
            <CardDescription>Code from link: {code}</CardDescription>
          </CardHeader>
          <CardContent>
            <JoinLeagueForm defaultCode={code} />
          </CardContent>
        </Card>
        <p className="text-sm text-center text-muted-foreground">
          <Link href="/leagues" className="underline">
            Back to my leagues
          </Link>
        </p>
      </div>
    )
  }
}
