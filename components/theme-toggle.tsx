"use client"

import { useState } from "react"
import { Check, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme, mounted } = useTheme()
  const [open, setOpen] = useState(false)

  const chooseTheme = (next: "light" | "dark") => {
    setTheme(next)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 shrink-0 rounded-full"
          aria-label="Choose theme"
        >
          {mounted ? (
            <>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </>
          ) : (
            <Sun className="h-4 w-4" />
          )}
          <span className="sr-only">Choose theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="z-[100] w-36 p-2">
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn("w-full justify-start", theme === "light" && "bg-accent")}
            onClick={() => chooseTheme("light")}
          >
            <Sun className="mr-2 h-4 w-4" />
            Light
            {theme === "light" && <Check className="ml-auto h-4 w-4" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn("w-full justify-start", theme === "dark" && "bg-accent")}
            onClick={() => chooseTheme("dark")}
          >
            <Moon className="mr-2 h-4 w-4" />
            Dark
            {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
