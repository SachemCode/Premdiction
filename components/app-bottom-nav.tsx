import BottomNav from "@/components/bottom-nav"
import { isWcEventEnabled } from "@/lib/competition-config"

export default function AppBottomNav() {
  return <BottomNav wcEventEnabled={isWcEventEnabled()} />
}
