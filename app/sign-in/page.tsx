"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { loginAction } from "@/app/auth/actions"
import { Mail, Lock } from "lucide-react"
import { APP_NAME } from "@/lib/brand"
import { BrandLogo } from "@/components/brand-logo"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams?.get("next") ?? null
  const { refreshUser } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await loginAction({ email, password })

    if (result.success) {
      await refreshUser()
      toast({
        title: "Welcome back!",
        description: "You've signed in successfully",
      })
      router.push(next && next.startsWith("/") ? next : "/")
    } else {
      toast({
        title: "Sign in failed",
        description: result.error ?? "Invalid email or password",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
      <Card className="w-full max-w-md pl-card">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <BrandLogo variant="card" source="full" />
          </div>
          <CardTitle className="text-2xl text-center">Sign in to {APP_NAME}</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to continue predicting
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSignIn}>
          <CardContent className="space-y-4">
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
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href={next ? `/sign-up?next=${encodeURIComponent(next)}` : "/sign-up"}
                className="text-pl-purple font-medium hover:underline"
              >
                Create account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
