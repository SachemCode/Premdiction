"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { registerAction } from "@/app/auth/actions"
import { User, Mail, Lock } from "lucide-react"
import { APP_NAME } from "@/lib/brand"
import { BrandLogo } from "@/components/brand-logo"
import type { RegistrationStatus } from "@/lib/auth/types"

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams?.get("next") ?? null
  const { refreshUser } = useAuth()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus | null>(null)

  useEffect(() => {
    fetch("/api/auth/registration-status")
      .then((res) => res.json())
      .then(setRegistrationStatus)
      .catch(() => undefined)
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const result = await registerAction({ name, email, password })

    if (result.success) {
      await refreshUser()
      toast({
        title: "Account created",
        description: `Welcome to ${APP_NAME}!`,
      })
      router.push(next && next.startsWith("/") ? next : "/events/world-cup")
    } else {
      toast({
        title: "Registration failed",
        description: result.error ?? "Could not create account",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const registrationClosed = registrationStatus && !registrationStatus.canRegister

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
      <Card className="w-full max-w-md pl-card">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <BrandLogo variant="card" source="full" />
          </div>
          <CardTitle className="text-2xl text-center">Join {APP_NAME}</CardTitle>
          <CardDescription className="text-center">
            Create your account to start predicting
          </CardDescription>
        </CardHeader>

        {registrationClosed ? (
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              {registrationStatus?.reason ?? "Registration is currently closed."}
            </p>
            {registrationStatus && (
              <p className="text-sm text-muted-foreground">
                {registrationStatus.userCount} accounts registered so far
              </p>
            )}
            <Button asChild variant="outline" className="w-full">
              <Link href={next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"}>
                Already have an account? Sign in
              </Link>
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    className="pl-10"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-10"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="pl-10"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-pl-purple hover:bg-pl-purple/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href={next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"}
                  className="text-pl-purple font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
