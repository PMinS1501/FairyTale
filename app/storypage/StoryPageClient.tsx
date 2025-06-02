"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Pause, Play, ChevronLeft, ChevronRight } from "lucide-react"
import HomeButton from "@/components/home-button"
import { motion, AnimatePresence } from "framer-motion"

type RawScript = {
  page: number
  s3_path: string
}

type Page = {
  image_url: string
  voice_url: string
  text_url: string
}

export default function StoryPageClient({ s3Url }: { s3Url: string | null }) {
  const [pages, setPages] = useState<Page[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [subtitles, setSubtitles] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (!s3Url) return

    const loadStory = async () => {
      try {
        const res = await fetch(`/api/proxy-upload?s3Url=${encodeURIComponent(s3Url)}`)
        const json = await res.json()

        const { images, audios, scripts }: { images: string[]; audios: string[]; scripts: RawScript[] } = json

        if (!images || !audios || !scripts) {
          console.error("❌ JSON 형식 오류: images, audios, scripts 누락")
          return
        }

        const merged: Page[] = images.map((img, i) => ({
          image_url: img,
          voice_url: audios[i],
          text_url: scripts[i]?.s3_path || ""
        }))

        setPages(merged)
      } catch (err) {
        console.error("❌ 동화 JSON 로딩 실패:", err)
      }
    }

    loadStory()
  }, [s3Url])

  useEffect(() => {
    const fetchSubtitle = async () => {
      const page = pages[currentPage]
      if (!page?.text_url) return

      try {
        const res = await fetch(`/api/proxy-upload?s3Url=${encodeURIComponent(page.text_url)}`)
        const data = await res.json()
        if (data.content) {
          setSubtitles([data.content])
        } else {
          setSubtitles(["(자막 없음)"])
        }
      } catch (err) {
        console.error("❌ 자막 불러오기 실패:", err)
        setSubtitles(["(자막 오류)"])
      }
    }

    fetchSubtitle()
  }, [pages, currentPage])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

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

    audio.addEventListener("timeupdate", updateProgress)
    audio.addEventListener("ended", handleEnded)
    return () => {
      audio.removeEventListener("timeupdate", updateProgress)
      audio.removeEventListener("ended", handleEnded)
    }
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
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ transform: "rotateY(90deg)", transformOrigin: "right", opacity: 0 }}
            animate={{ transform: "rotateY(0deg)", opacity: 1 }}
            exit={{ transform: "rotateY(-90deg)", transformOrigin: "left", opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="relative w-full h-auto"
            style={{ transformStyle: "preserve-3d" }}
          >
            <Image
              src={page.image_url}
              alt={`페이지 ${currentPage + 1}`}
              width={600}
              height={300}
              className="mx-auto mb-4 rounded shadow-lg"
            />
          </motion.div>
        </AnimatePresence>

        <p className="text-lg text-center mb-4">{subtitleText}</p>
        <audio ref={audioRef} src={page.voice_url} preload="auto" />

        <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="flex justify-center gap-4">
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
      </div>

      <div className="mt-4 text-center text-muted-foreground">
        페이지 {currentPage + 1} / {pages.length}
      </div>
    </main>
  )
}
