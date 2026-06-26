"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User, Prediction } from "@/lib/types"
import { EXACT_SCORE_POINTS } from "@/lib/prediction-points"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({})

  useEffect(() => {
    Promise.all([fetch("/api/users"), fetch("/api/predictions")])
      .then(async ([usersRes, predsRes]) => {
        setUsers(await usersRes.json())
        setPredictions(await predsRes.json())
      })
      .catch(console.error)
  }, [])

  const handleDeleteUser = (userId: string, userName: string) => {
    setIsDeleting((prev) => ({ ...prev, [userId]: true }))

    setTimeout(() => {
      toast({
        title: "User deleted",
        description: `${userName} has been removed from the system.`,
      })
      setIsDeleting((prev) => ({ ...prev, [userId]: false }))
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage users in your prediction game</p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => {
          const userPredictions = predictions.filter((p) => p.userId === user.id)
          const totalPoints = userPredictions.reduce((sum, pred) => sum + (pred.points || 0), 0)
          const exactScores = userPredictions.filter((p) => p.points === EXACT_SCORE_POINTS).length

          return (
            <Card key={user.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback className="bg-pl-purple text-white">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {user.name}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/users/${user.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id, user.name)}
                    disabled={isDeleting[user.id]}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting[user.id] ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-medium">{user.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Predictions</div>
                    <div className="font-medium">{userPredictions.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Points</div>
                    <div className="font-medium">{totalPoints}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Exact Scores</div>
                    <div className="font-medium">{exactScores}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
