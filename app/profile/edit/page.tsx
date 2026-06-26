"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/hooks/use-toast"
import type { Team } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Mail } from "lucide-react"

export default function EditProfilePage() {
  const router = useRouter()
  const { user, updateProfile } = useAuth()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [profilePicture, setProfilePicture] = useState<string | undefined>("")
  const [supportedTeam, setSupportedTeam] = useState<string | undefined>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (user) {
      setName(user.name)
      setProfilePicture(user.profilePicture)
      setSupportedTeam(user.supportedTeam ?? "none")
    } else {
      router.push("/sign-in")
    }
  }, [user, router])

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicture(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateProfile({
        name,
        profilePicture,
        supportedTeam: supportedTeam === "none" ? null : supportedTeam,
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })

      router.push("/profile")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-muted-foreground">Update your personal information</p>
      </div>

      <Card className="pl-card">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your profile details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24 border-2 border-pl-purple">
                  <AvatarImage src={profilePicture || "/placeholder.svg"} />
                  <AvatarFallback className="bg-pl-purple text-white text-xl">{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <label
                  htmlFor="profile-picture"
                  className="absolute bottom-0 right-0 bg-pl-purple text-white p-1.5 rounded-full cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                </label>
                <input
                  id="profile-picture"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureChange}
                />
              </div>
              <p className="text-sm text-muted-foreground">Click the camera icon to upload a profile picture</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" value={user.email} disabled className="pl-10 bg-muted" />
              </div>
              <p className="text-xs text-muted-foreground">Use this email to sign in</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supported-team">Supported Team</Label>
              <Select value={supportedTeam} onValueChange={setSupportedTeam}>
                <SelectTrigger id="supported-team">
                  <SelectValue placeholder="Select your favorite team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 flex-shrink-0">
                          <img
                            src={team.logo || `/placeholder.svg?height=20&width=20`}
                            alt={team.name}
                            className="max-w-full max-h-full"
                          />
                        </div>
                        <span>{team.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="bg-pl-purple hover:bg-pl-purple/90 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
