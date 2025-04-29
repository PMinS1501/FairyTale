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
        background: "url('/space.mp4') center/cover no-repeat fixed",
      }
    } else {
      backgroundStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        background: "url('/space.jpg') center/cover no-repeat fixed",
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
        background: "url('/sky.mp4') center/cover no-repeat fixed",
      }
    } else {
      backgroundStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        background: "url('/sky.jpg') center/cover no-repeat fixed",
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
      background: "url('/rabbit.png') center/cover no-repeat fixed",
    }
  } else if (theme === "dog") {
    backgroundStyle = {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: -1,
      background: "url('/dog.png') center/cover no-repeat fixed",
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
        background: "url('/ocean.mp4') center/cover no-repeat fixed",
      }
    } else {
      backgroundStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        background: "url('/ocean.jpg') center/cover no-repeat fixed",
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
