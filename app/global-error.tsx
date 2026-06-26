"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
            padding: "1.5rem",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "24rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#666", marginBottom: "1.5rem" }}>
              We encountered an unexpected error. Please try again.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: "0.5rem 1rem",
                background: "#38003c",
                color: "#fff",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                marginRight: "0.5rem",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                padding: "0.5rem 1rem",
                color: "#38003c",
                textDecoration: "underline",
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
