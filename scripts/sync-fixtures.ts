import { config } from "dotenv"
import { resolve } from "path"
import { syncFixtures } from "../lib/football-data/sync-fixtures"

config({ path: resolve(process.cwd(), ".env.local") })

async function main() {
  console.log("Syncing EPL fixtures from football-data.org...")
  const result = await syncFixtures()
  console.log(
    `Synced ${result.matchCount} matches across ${result.matchweekCount} matchweeks for ${result.competition} ${result.season}`
  )
}

main().catch((error) => {
  console.error("Fixture sync failed:", error)
  process.exit(1)
})
