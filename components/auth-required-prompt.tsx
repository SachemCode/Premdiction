import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus, Lock } from "lucide-react"

type AuthRequiredPromptProps = {
  title: string
  description: string
  returnTo?: string
}

export function AuthRequiredPrompt({ title, description, returnTo }: AuthRequiredPromptProps) {
  const signInHref = returnTo ? `/sign-in?next=${encodeURIComponent(returnTo)}` : "/sign-in"
  const signUpHref = returnTo ? `/sign-up?next=${encodeURIComponent(returnTo)}` : "/sign-up"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm md:text-base">{description}</p>
      </div>

      <div className="game-card p-8 md:p-12 text-center max-w-lg mx-auto">
        <Lock className="h-12 w-12 mx-auto mb-4 text-pl-purple/40" />
        <h2 className="text-xl font-semibold mb-2">Sign in to continue</h2>
        <p className="text-muted-foreground mb-6">
          Create an account or sign in to access predictions, leaderboards, and compete with your
          friends.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-pl-purple hover:bg-pl-purple/90 text-white min-h-11">
            <Link href={signInHref}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign in
            </Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11">
            <Link href={signUpHref}>
              <UserPlus className="mr-2 h-4 w-4" />
              Create account
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
