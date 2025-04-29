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

  let backgroundContent = null

  if (theme === "space" || theme === "sky" || theme === "ocean") {
    if (isHomePage) {
      // 홈에서는 video 재생
      backgroundContent = (
        <video
          autoPlay
          muted
          loop
          playsInline
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
          <source src={'/${theme}.mp4'} type="video/mp4" />
        </video>
      )
    } else {
      // 다른 페이지는 고정 이미지
      backgroundContent = (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "url('/${theme}.jpg') center/cover no-repeat fixed",
            zIndex: -1,
          }}
        />
      )
    }
  } else if (theme === "rabbit" || theme === "dog") {
    // 반복 패턴 배경
    backgroundContent = (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "url('/${theme}.png') repeat",
          backgroundSize: "150px 150px", // 패턴 크기 조정
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
