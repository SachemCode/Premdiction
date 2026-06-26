import { Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AdminPreviewOnly({
  title = "Admin preview only",
  description = "This feature is not open during the World Cup beta. Focus on the WC Event for now.",
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="max-w-lg mx-auto min-w-0">
      <Card className="pl-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-pl-purple/10">
            <Users className="h-6 w-6 text-pl-purple" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild className="bg-pl-purple hover:bg-pl-purple/90 text-white min-h-11">
            <Link href="/events/world-cup">Go to WC Event</Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11">
            <Link href="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
