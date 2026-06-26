"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { updateRegistrationSettingsAction } from "@/app/auth/actions"
import type { RegistrationStatus } from "@/lib/auth/types"
import { Users } from "lucide-react"

export default function RegistrationSettingsPage() {
  const { toast } = useToast()
  const [status, setStatus] = useState<RegistrationStatus | null>(null)
  const [registrationOpen, setRegistrationOpen] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetch("/api/auth/registration-status")
      .then((res) => res.json())
      .then((data: RegistrationStatus) => {
        setStatus(data)
        setRegistrationOpen(data.registrationOpen)
      })
      .catch(console.error)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    const result = await updateRegistrationSettingsAction({ registrationOpen })
    if (result.success) {
      toast({ title: "Settings saved", description: "Registration settings updated" })
      const res = await fetch("/api/auth/registration-status")
      setStatus(await res.json())
    } else {
      toast({
        title: "Error",
        description: result.error ?? "Failed to save settings",
        variant: "destructive",
      })
    }
    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registration</h1>
        <p className="text-muted-foreground">Control open sign-up for the WC test run</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Sign-up settings
          </CardTitle>
          <CardDescription>
            Share <span className="font-mono text-xs">/sign-up</span> with your group. Close registration when
            the tournament starts if you want to lock the league.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status && (
            <div className="rounded-lg border p-4 bg-muted/30">
              <p className="text-sm font-medium">{status.userCount} accounts registered</p>
              <p className="text-xs text-muted-foreground mt-1">
                {status.canRegister ? "New sign-ups are allowed" : status.reason}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="registrationOpen">Open registration</Label>
              <p className="text-xs text-muted-foreground">Allow new users to create accounts</p>
            </div>
            <Switch
              id="registrationOpen"
              checked={registrationOpen}
              onCheckedChange={setRegistrationOpen}
            />
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="bg-pl-purple hover:bg-pl-purple/90 text-white">
            {isSaving ? "Saving..." : "Save settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
