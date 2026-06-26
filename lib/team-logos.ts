// This file maps team IDs to their logo paths
// Replace the placeholder URLs with actual logo paths once you have them

export const teamLogos: Record<string, string> = {
  // Premier League Teams
  team_1: "/teams/Arsenal-FC-logo.png",
  team_2: "/teams/Aston-Villa-FC-logo-.png",
  team_3: "/teams/AFC-Bournemouth-logo.png",
  team_4: "/teams/Brentford-FC-logo.png",
  team_5: "/teams/Brighton-Hove-Albion-logo.png",
  team_6: "/teams/Chelsea-FC-logo.png",
  team_7: "/teams/Crystal-Palace-FC-logo.png",
  team_8: "/teams/Everton-FC-logo.png",
  team_9: "/teams/Fulham-FC-logo.png",
  team_10: "/teams/Liverpool-FC-Logo.png",
  team_11: "/teams/Manchester-City-FC-logo.png",
  team_12: "/teams/Manchester-United-FC-logo.png",
  team_13: "/teams/Newcastle-United-logo.png",
  team_14: "/teams/Nottingham-Forest-FC-logo.png",
  team_15: "/teams/Sheffield-United-FC-logo.webp",
  team_16: "/teams/Tottenham-Hotspur-logo.png",
  team_17: "/teams/West-Ham-United-FC-logo.png",
  team_18: "/teams/Wolverhampton-Wanderers-logo.png",
  team_19: "/teams/Ipswich-Town-FC-logo.png",
  team_20: "/teams/Leicester-City-FC-logo.png",
}

// Function to get a team logo with fallback
export function getTeamLogo(teamId: string): string {
  return teamLogos[teamId] || `/placeholder.svg?height=100&width=100&text=${teamId}`
}
