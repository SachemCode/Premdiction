import { config } from "dotenv"
import { resolve } from "path"
import { syncTeams } from "../lib/football-data/sync-teams"

config({ path: resolve(process.cwd(), ".env.local") })

async function main() {
  console.log("Syncing EPL teams from football-data.org...")
  const result = await syncTeams()
  console.log(`Synced ${result.count} teams for ${result.competition} ${result.season}`)
  result.teams.forEach((team) => {
    console.log(`  - ${team.name} (${team.tla})`)
  })
}

main().catch((error) => {
  console.error("Team sync failed:", error)
  process.exit(1)
})
