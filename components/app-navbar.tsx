import Navbar from "@/components/navbar"
import { isWcEventEnabled } from "@/lib/competition-config"

export default function AppNavbar() {
  return <Navbar wcEventEnabled={isWcEventEnabled()} />
}
