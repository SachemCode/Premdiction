"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase-browser"

export function useMatchweekUpdates() {
  useEffect(() => {
    const channel = supabase
      .channel("matchweeks-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matchweeks" },
        (payload) => {
          console.log("Matchweek change:", payload)
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])
}

export function useMatchUpdates() {
  useEffect(() => {
    const channel = supabase
      .channel("matches-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        (payload) => {
          console.log("Match change:", payload)
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])
}
