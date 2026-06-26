"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export const THEME_STORAGE_KEY = "premdiction-theme"

export type Theme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function applyThemeToDocument(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light"
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored === "dark" ? "dark" : "light"
  } catch {
    return "light"
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const initial = readStoredTheme()
    applyThemeToDocument(initial)
    setThemeState(initial)
    setMounted(true)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // ignore storage errors
    }
    applyThemeToDocument(next)
    setThemeState(next)
  }, [])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      mounted,
    }),
    [theme, setTheme, mounted]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
