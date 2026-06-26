"use client"

import { useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { SCORE_WHEEL_MAX } from "@/lib/prediction-window"

const ITEM_HEIGHT = 36
const VISIBLE_ITEMS = 3
const PADDING_ITEMS = 1

type ScoreWheelPickerProps = {
  homeScore: number | null
  awayScore: number | null
  min?: number
  max?: number
  disabled?: boolean
  onHomeChange: (value: number) => void
  onAwayChange: (value: number) => void
}

function buildValues(min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i)
}

function WheelColumn({
  label,
  value,
  min,
  max,
  disabled,
  onChange,
}: {
  label: string
  value: number | null
  min: number
  max: number
  disabled?: boolean
  onChange: (value: number) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const values = buildValues(min, max)
  const ignoreScroll = useRef(true)

  const scrollToValue = useCallback(
    (target: number, smooth = false) => {
      const el = scrollRef.current
      if (!el) return
      const index = values.indexOf(target)
      if (index < 0) return
      ignoreScroll.current = true
      el.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: smooth ? "smooth" : "instant",
      })
      window.setTimeout(() => {
        ignoreScroll.current = false
      }, 50)
    },
    [values]
  )

  useEffect(() => {
    if (value !== null) {
      scrollToValue(value)
    } else {
      window.setTimeout(() => {
        ignoreScroll.current = false
      }, 100)
    }
  }, [value, scrollToValue])

  const handleScroll = () => {
    if (ignoreScroll.current) return
    const el = scrollRef.current
    if (!el || disabled) return
    const index = Math.round(el.scrollTop / ITEM_HEIGHT)
    const clamped = Math.max(0, Math.min(values.length - 1, index))
    onChange(values[clamped])
  }

  const handleItemClick = (v: number) => {
    if (disabled) return
    onChange(v)
    scrollToValue(v, true)
  }

  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div
        className={cn(
          "relative w-full rounded-lg border bg-muted/30 overflow-hidden",
          disabled && "opacity-50 pointer-events-none"
        )}
        style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-9 border-y border-pl-purple/30 bg-pl-purple/5 z-10" />
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto scroll-smooth snap-y snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{
            paddingTop: ITEM_HEIGHT * PADDING_ITEMS,
            paddingBottom: ITEM_HEIGHT * PADDING_ITEMS,
          }}
        >
          {values.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => handleItemClick(v)}
              className={cn(
                "flex w-full items-center justify-center snap-center text-lg font-bold transition-colors",
                value === v ? "text-pl-purple scale-110" : "text-muted-foreground"
              )}
              style={{ height: ITEM_HEIGHT }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ScoreWheelPicker({
  homeScore,
  awayScore,
  min = 0,
  max = SCORE_WHEEL_MAX,
  disabled,
  onHomeChange,
  onAwayChange,
}: ScoreWheelPickerProps) {
  return (
    <div className="md:hidden flex items-center gap-3 w-full max-w-[200px] mx-auto mb-2">
      <WheelColumn
        label="Home"
        value={homeScore}
        min={min}
        max={max}
        disabled={disabled}
        onChange={onHomeChange}
      />
      <span className="text-lg font-bold text-muted-foreground pt-5">-</span>
      <WheelColumn
        label="Away"
        value={awayScore}
        min={min}
        max={max}
        disabled={disabled}
        onChange={onAwayChange}
      />
    </div>
  )
}
