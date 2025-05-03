"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Rocket, Cloud, Rabbit, Dog, Waves } from "lucide-react"

const themes = [
  { name: "space", icon: Rocket, label: "우주" },
  { name: "sky", icon: Cloud, label: "하늘" },
  { name: "rabbit", icon: Rabbit, label: "토끼" },
  { name: "dog", icon: Dog, label: "강아지" },
  { name: "ocean", icon: Waves, label: "바다" },
]

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      {themes.map((t) => {
        const Icon = t.icon
        return (
          <Button
            key={t.name}
            variant={theme === t.name ? "default" : "outline"}
            className="flex flex-col items-center justify-center h-24 gap-2"
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
