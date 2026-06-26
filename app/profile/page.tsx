import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import UserStats from "@/components/user-stats"
import UserPredictionHistory from "@/components/user-prediction-history"
import { Edit } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground">View your prediction stats and history</p>
        </div>
        <Button asChild className="bg-pl-purple hover:bg-pl-purple/90 text-white">
          <Link href="/profile/edit">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="stats" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="history">Prediction History</TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Your Stats</CardTitle>
              <CardDescription>See how you've performed in the prediction game</CardDescription>
            </CardHeader>
            <CardContent>
              <UserStats />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Prediction History</CardTitle>
              <CardDescription>All your past predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <UserPredictionHistory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
