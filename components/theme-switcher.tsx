"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Leaf, Cloud } from "lucide-react"

const themes = [
  { name: "alley", icon: Leaf, label: "숲" },
  { name: "sky", icon: Cloud, label: "하늘" },
]

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="bottom-4 left-4 grid grid-cols-2 gap-3">
      {themes.map((t) => {
        const Icon = t.icon
        return (
          <Button
            key={t.name}
            variant={theme === t.name ? "default" : "outline"}
            className="flex flex-col items-center justify-center w-24 h-24 gap-2"
            onClick={() => setTheme(t.name)}
          >
            <Icon className="h-6 w-6" />
            <span>{t.label}</span>
          </Button>
        )
      })}
    </div>
  )
}
