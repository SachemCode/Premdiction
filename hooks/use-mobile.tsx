/**
 * useMobile Hook
 * 
 * A custom React hook that detects whether the current viewport is mobile-sized.
 * Uses a breakpoint of 768px to determine mobile status.
 * 
 * Features:
 * - Responsive viewport detection
 * - Automatic updates on window resize
 * - SSR-safe implementation
 * 
 * @returns boolean indicating if the current viewport is mobile-sized
 */

"use client"

import { useState, useEffect } from "react"

export function useMobile() {
  // Initialize state with null to handle SSR
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    // Function to check if viewport is mobile-sized
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkMobile()

    // Add resize listener
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}
