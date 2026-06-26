"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KeyRound, ShieldCheck } from "lucide-react"

export default function AccessKeysList() {
  // Admin keys
  const adminKeys = [
    { key: "A7b@9X2z", name: "Admin 1" },
    { key: "K3$pR8vT", name: "Admin 2" },
    { key: "E5!mQ9yL", name: "Admin 3" },
    { key: "W4#dF6gH", name: "Admin 4" },
    { key: "Z8*jN2cV", name: "Admin 5" },
  ]

  // Regular user keys
  const userKeys = [
    { key: "P3r$0n1x", name: "Player 1" },
    { key: "B7t@5M3s", name: "Player 2" },
    { key: "C9q#2D4f", name: "Player 3" },
    { key: "G6h!8J1k", name: "Player 4" },
    { key: "L5m*7N3p", name: "Player 5" },
    { key: "Q2w$4R6t", name: "Player 6" },
    { key: "S8x@0V2y", name: "Player 7" },
    { key: "T4z#6B8n", name: "Player 8" },
    { key: "U1a!3C5d", name: "Player 9" },
    { key: "Y7f*9H1j", name: "Player 10" },
    { key: "I2k$4L6m", name: "Player 11" },
    { key: "O8n@0P2q", name: "Player 12" },
    { key: "X4r#6S8t", name: "Player 13" },
    { key: "D1u!3V5w", name: "Player 14" },
    { key: "F7x*9Y1z", name: "Player 15" },
    { key: "H2a$4C6d", name: "Player 16" },
    { key: "J8e@0F2g", name: "Player 17" },
    { key: "M4h#6I8j", name: "Player 18" },
    { key: "N1k!3L5m", name: "Player 19" },
    { key: "R7n*9O1p", name: "Player 20" },
    { key: "V2q$4S6t", name: "Player 21" },
    { key: "A8u@0W2x", name: "Player 22" },
    { key: "B4y#6Z8a", name: "Player 23" },
    { key: "C1b!3D5e", name: "Player 24" },
    { key: "E7f*9G1h", name: "Player 25" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-600" />
            Admin Access Keys
          </CardTitle>
          <CardDescription>These keys provide full administrative access to the game</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {adminKeys.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <KeyRound className="h-5 w-5 text-amber-600" />
                <div className="font-medium">{item.name}:</div>
                <div className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded border border-amber-200 dark:border-amber-800">
                  {item.key}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Access Keys</CardTitle>
          <CardDescription>These keys provide standard user access to the game</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {userKeys.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <KeyRound className="h-5 w-5 text-blue-600" />
                <div className="font-medium">{item.name}:</div>
                <div className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded border border-blue-200 dark:border-blue-800">
                  {item.key}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
