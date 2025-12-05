"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const themes = [
  {
    name: "Light",
    Icon: Sun,
    value: "light",
  },
  {
    name: "Dark",
    Icon: Moon,
    value: "dark",
  },
  {
    name: "System",
    Icon: Monitor,
    value: "system",
  },
] as const

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { setTheme, theme, resolvedTheme } = useTheme() // theme returns actual theme and resolveTheme returns the theme the user has selected: dark or light or system

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null // prevent hydration error

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {resolvedTheme === "dark" ? <Moon /> : <Sun />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map(({ name, Icon, value }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "cursor-pointer",
              theme === value && "bg-accent text-accent-foreground"
            )}
          >
            <Icon className="size-4" />
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}