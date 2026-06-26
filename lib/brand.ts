export const APP_NAME = "Premdiction"
export const APP_DESCRIPTION = "Premier League prediction game for friends"
export const APP_TITLE = `${APP_NAME} - Premier League Predictions`

/** Bump when replacing logo assets so browsers and Next.js image cache refresh. */
export const LOGO_VERSION = "10"

export const LOGO_FULL_PATH = "/premdiction-logo-full.png"
export const LOGO_ICON_PATH = "/premdiction-logo-icon.png"
export const LOGO_HOME_PATH = "/premdiction-logo-home.png"
export const LOGO_HERO_PATH = "/premdiction-logo-hero.png"
export const LOGO_SPHERE_PATH = "/premdiction-sphere.png"
export const LOGO_SPHERE_BADGE_PATH = "/premdiction-sphere-badge.png"

export function logoUrlFull(): string {
  return `${LOGO_FULL_PATH}?v=${LOGO_VERSION}`
}

export function logoUrlIcon(): string {
  return `${LOGO_ICON_PATH}?v=${LOGO_VERSION}`
}

export function logoUrlHome(): string {
  return `${LOGO_HOME_PATH}?v=${LOGO_VERSION}`
}

export function logoUrlHero(): string {
  return `${LOGO_HERO_PATH}?v=${LOGO_VERSION}`
}

export function logoUrlSphere(): string {
  return `${LOGO_SPHERE_PATH}?v=${LOGO_VERSION}`
}

export function logoUrlSphereBadge(): string {
  return `${LOGO_SPHERE_BADGE_PATH}?v=${LOGO_VERSION}`
}

export const LOGO_SIZES = {
  /** Home hero wordmark */
  full: { width: 280, height: 280 },
  /** Navbar ball icon */
  nav: { width: 40, height: 40 },
  /** Sign-in / sign-up wordmark */
  card: { width: 220, height: 220 },
} as const

/** @deprecated Use logoUrlFull() or logoUrlIcon() */
export function logoUrl(): string {
  return logoUrlFull()
}
