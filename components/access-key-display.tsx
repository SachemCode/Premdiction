"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Eye, EyeOff } from "lucide-react"

export default function AccessKeyDisplay() {
  const [revealed, setRevealed] = useState(false)
  // This would normally come from your database or API
  const accessKey = "vs_1234567890abcdef"

  const toggleReveal = () => {
    setRevealed(!revealed)
  }

  return (
    <div className="space-y-4">
      <Alert
        variant="destructive"
        className="bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800/30"
      >
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your access key is sensitive and private, please do not share it with anyone else
        </AlertDescription>
      </Alert>

      <div className="flex items-center gap-4">
        <div className="flex-1 font-mono p-3 bg-muted rounded-md">
          {revealed ? accessKey : "•".repeat(accessKey.length)}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleReveal}
          aria-label={revealed ? "Hide access key" : "Show access key"}
        >
          {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
