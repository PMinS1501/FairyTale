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

  // theme 변경될 때마다 반영
  useEffect(() => {
    if (theme) {
      setCurrentTheme(theme)
    }
  }, [theme])

  if (!mounted || !currentTheme) return <>{children}</>

  const isHomePage = pathname === "/"

  let backgroundContent = null
  if (["alley", "sky", "ocean"].includes(currentTheme)) {
    backgroundContent = isHomePage ? (
      <video
        autoPlay
        muted
        loop
        playsInline
        key={currentTheme} // 💡 theme 변경 시 video 다시 로드되도록
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
          background: `url('/${currentTheme}.png') center/cover no-repeat fixed`,
          zIndex: -1,
        }}
      />
    )
  } else if (["rabbit", "dog"].includes(currentTheme)) {
    backgroundContent = (
      <div
        key={currentTheme}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "300%",
          height: "300%",
          background: `url('/${currentTheme}.png') repeat`,
          backgroundSize: "300px 300px",
          backgroundAttachment: "fixed",
          zIndex: -1,
        }}
      />
    )
  }
  // if (theme === "space" || theme === "sky" || theme === "ocean") {
  //   if (isHomePage) {
  //     // 홈에서는 mp4 비디오 재생
  //     backgroundContent = (
  //       <video
  //         autoPlay
  //         muted
  //         loop
  //         playsInline
  //         style={{
  //           position: "fixed",
  //           top: 0,
  //           left: 0,
  //           width: "100%",
  //           height: "100%",
  //           objectFit: "cover",
  //           zIndex: -1,
  //         }}
  //       >
  //         <source src={`/${theme}.mp4`} type="video/mp4" />
  //         {/* 브라우저가 mp4를 지원하지 않으면 대체 텍스트 */}
  //         Your browser does not support the video tag.
  //       </video>
  //     )
  //   } else {
  //     // 다른 페이지는 jpg 이미지
  //     backgroundContent = (
  //       <div
  //         style={{
  //           position: "fixed",
  //           top: 0,
  //           left: 0,
  //           width: "100%",
  //           height: "100%",
  //           background: `url('/${theme}.jpg') center/cover no-repeat fixed`,
  //           zIndex: -1,
  //         }}
  //       />
  //     )
  //   }
  // } else if (theme === "rabbit" || theme === "dog") {
  //   // 항상 반복 패턴
  //   backgroundContent = (
  //     <div
  //       style={{
  //         position: "fixed",
  //         top: 0,
  //         left: 0,
  //         width: "300%",
  //         height: "300%",
  //         background: `url('/${theme}.png') repeat`,
  //         backgroundSize: "300px 300px", // 패턴 크기 조정
  //         backgroundAttachment: "fixed", // 스크롤해도 고정
  //         zIndex: -1,
  //       }}
  //     />
  //   )
  // }

  return (
    <>
      {backgroundContent}
      <div className="relative z-0">{children}</div>
    </>
  )
}
