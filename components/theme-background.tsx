"use client"

import type React from "react"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function ThemeBackground({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<string | undefined>()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (theme) {
      setCurrentTheme(theme)
    }
  }, [theme])

  if (!mounted || !currentTheme) return <>{children}</>

  const isHomePage = pathname === "/"
  let backgroundContent = null

  if (["alley", "sky"].includes(currentTheme)) {
    backgroundContent = isHomePage ? (
      <video
        autoPlay
        muted
        loop
        playsInline
        key={currentTheme}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      >
        <source src={`/${currentTheme}.mp4`} type="video/mp4" />
        비디오 로딩 오류
      </video>
    ) : (
      <div
        key={currentTheme}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `url('/${currentTheme}.${currentTheme === "sky" ? "jpg" : "png"}') center/cover no-repeat fixed`,
          zIndex: -1,
        }}
      />
    )
  }

  return (
    <>
      {backgroundContent}
      <div className="relative z-0">{children}</div>
    </>
  )
}
