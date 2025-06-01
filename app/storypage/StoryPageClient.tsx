// app/storypage/StoryPageClient.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Pause, Play, ChevronLeft, ChevronRight } from "lucide-react"
import HomeButton from "@/components/home-button"
import { useSearchParams } from "next/navigation"

export default function StoryPageClient() {
  const searchParams = useSearchParams()
  const s3Url = searchParams.get("s3Url")

  type Page = { image_url: string; voice_url: string; text_url: string }

  const [pages, setPages] = useState<Page[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [subtitles, setSubtitles] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (typeof s3Url !== "string") return

    const loadStory = async () => {
      try {
        const res = await fetch(`/api/proxy-upload?s3Url=${encodeURIComponent(s3Url)}`)
        const json = await res.json()
        if (Array.isArray(json.items)) {
          setPages(json.items)
        } else {
          console.error("❌ JSON 구조 오류: items 배열 없음")
        }
      } catch (err) {
        console.error("❌ 동화 JSON 불러오기 실패:", err)
      }
    }

    loadStory()
  }, [s3Url])

  useEffect(() => {
    const page = pages[currentPage]
    if (!page?.text_url) return
    setSubtitles([page.text_url])
  }, [pages, currentPage])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) audio.play()
    else audio.pause()

    const handleEnded = () => {
      if (currentPage < pages.length - 1) {
        setCurrentPage((prev) => prev + 1)
        setIsPlaying(true)
      } else {
        setIsPlaying(false)
      }
    }

    audio.addEventListener("ended", handleEnded)
    return () => audio.removeEventListener("ended", handleEnded)
  }, [isPlaying, currentPage, pages])

  const togglePlay = () => setIsPlaying((prev) => !prev)
  const goToPage = (index: number) => {
    if (index >= 0 && index < pages.length) {
      setCurrentPage(index)
      setIsPlaying(true)
    }
  }

  if (pages.length === 0) return <div className="text-center mt-20">동화 불러오는 중...</div>

  const page = pages[currentPage]
  const subtitleText = subtitles.join(" ")

  return (
    <main className="p-6 flex flex-col items-center">
      <HomeButton />
      <div className="max-w-3xl w-full bg-white/90 p-6 rounded-lg shadow-md transition-transform duration-700">
        <Image
          src={page.image_url}
          alt={`페이지 ${currentPage + 1}`}
          width={600}
          height={300}
          className="mx-auto mb-4 rounded"
        />

        <p className="text-lg text-center mb-4">{subtitleText}</p>
        <audio ref={audioRef} src={page.voice_url} preload="auto" />

        <div className="flex justify-center gap-4 mt-6">
          <Button onClick={() => goToPage(currentPage - 1)} variant="outline" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button onClick={togglePlay} variant="outline" size="icon">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <Button onClick={() => goToPage(currentPage + 1)} variant="outline" size="icon">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="mt-4 text-center text-muted-foreground">
          페이지 {currentPage + 1} / {pages.length}
        </div>
      </div>
    </main>
  )
}