"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import ThemeSwitcher from "@/components/theme-switcher"
import "./globals.css"

export default function Home() {
  const router = useRouter()
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const themeRef = useRef<HTMLDivElement>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleClick = async (path: string) => {
    if (isTransitioning) return
    setIsTransitioning(true)

    // 콘텐츠 및 ThemeSwitcher fade-out
    contentRef.current?.classList.add("fade-out")
    themeRef.current?.classList.add("fade-out")

    // 1초 대기 (fade-out 시간)
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 비디오 재생 처리 (빠르게)
    const video = document.querySelector("video") as HTMLVideoElement | null
    if (video) {
      video.playbackRate = 5
      const remaining = video.duration - video.currentTime

      // 흰색 오버레이 보여주기
      overlayRef.current!.style.transition = "opacity 2s ease"
      overlayRef.current!.style.opacity = "1"

      await new Promise(resolve => setTimeout(resolve, (remaining / 5) * 1000))
    }

    // 페이지 이동
    router.push(path)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 relative overflow-hidden">
      {/* 흰색 페이드 오버레이 */}
      <div
        ref={overlayRef}
        className="fixed top-0 left-0 w-full h-full bg-white opacity-0 pointer-events-none z-50"
      />

      {/* 콘텐츠 본문 */}
      <div
        ref={contentRef}
        className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center min-h-screen text-center transition-all duration-1000"
      >
        <h1 className="text-4xl font-bold mb-4">마법의 이야기</h1>
        <p className="text-xl text-muted-foreground mb-12">
          오늘 하루 경험을 동화로 만들어 보세요!
        </p>

        <div className="flex flex-col gap-4 w-full max-w-xs mb-6">
          <Button size="lg" className="h-16 text-lg" onClick={() => handleClick("/questions")}>
            시작하기
          </Button>
          <Button size="lg" variant="outline" className="h-16 text-lg" onClick={() => handleClick("/selection")}>
            동화 목록
          </Button>
        </div>
      </div>

      {/* ThemeSwitcher (단일 위치, fade-out 가능하도록 ref 포함) */}
      <div
        ref={themeRef}
        className="fixed bottom-4 left-4 z-40 transition-all duration-1000"
      >
        <ThemeSwitcher />
      </div>
    </main>
  )
}
