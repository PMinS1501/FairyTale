"use client"

import type React from "react"

import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function ThemeBackground({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <>{children}</>

  const isHomePage = pathname === "/"

  let backgroundStyle = {}

  if (theme === "space") {
    if (isHomePage) {
      backgroundStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        background: "url('/placeholder.svg?height=1080&width=1920&text=space.mp4') center/cover no-repeat fixed",
      }
    } else {
      backgroundStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        background: "url('/placeholder.svg?height=1080&width=1920&text=space.jpg') center/cover no-repeat fixed",
      }
    }
  } else if (theme === "sky") {
    if (isHomePage) {
      backgroundStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        background: "url('/placeholder.svg?height=1080&width=1920&text=sky.mp4') center/cover no-repeat fixed",
      }
    } else {
      backgroundStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        background: "url('/placeholder.svg?height=1080&width=1920&text=sky.jpg') center/cover no-repeat fixed",
      }
    }
  } else if (theme === "rabbit") {
    backgroundStyle = {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: -1,
      background: "url('/placeholder.svg?height=1080&width=1920&text=rabbit.png') center/cover no-repeat fixed",
    }
  } else if (theme === "dog") {
    backgroundStyle = {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: -1,
      background: "url('/placeholder.svg?height=1080&width=1920&text=dog.png') center/cover no-repeat fixed",
    }
  } else if (theme === "ocean") {
    if (isHomePage) {
      backgroundStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        background: "url('/placeholder.svg?height=1080&width=1920&text=ocean.mp4') center/cover no-repeat fixed",
      }
    } else {
      backgroundStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        background: "url('/placeholder.svg?height=1080&width=1920&text=ocean.jpg') center/cover no-repeat fixed",
      }
    }
  }

  return (
    <>
      <div style={backgroundStyle}></div>
      <div className="relative z-0">{children}</div>
    </>
  )
}
