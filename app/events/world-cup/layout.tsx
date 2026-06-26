import { APP_NAME } from "@/lib/brand"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: `${APP_NAME} - World Cup 2026 Event`,
  description: "World Cup 2026 knockout predictions — a limited side event on Premdiction",
}

export default function WorldCupEventLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="wc-event-shell space-y-4 text-green-950 dark:text-green-50">
      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-green-950/70 hover:text-green-950 dark:text-green-100/80 dark:hover:text-green-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Premier League
        </Link>
        <span className="text-green-950/40 dark:text-green-100/40">·</span>
        <span className="px-2 py-0.5 rounded-full bg-green-900/15 text-green-900 dark:bg-green-100/15 dark:text-green-100 text-xs font-semibold border border-amber-500/30">
          Event
        </span>
      </div>
      {children}
    </div>
  )
}
