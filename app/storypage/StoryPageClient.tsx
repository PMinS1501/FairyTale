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
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
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

    audio.playbackRate = 0.8

    const updateProgress = () => {
      if (!audio.duration || isSeeking) return
      setCurrentTime(audio.currentTime)
      setDuration(audio.duration)
      setProgress((audio.currentTime / audio.duration) * 100)
    }

    if (isPlaying) audio.play()
    else audio.pause()

    const handleEnded = () => {
      if (currentPage < pages.length - 1) {
        setCurrentPage((prev) => prev + 1)
        setIsPlaying(false)
        setTimeout(() => setIsPlaying(true), 2000)
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
  }, [isPlaying, currentPage, pages, isSeeking])

  const togglePlay = () => setIsPlaying((prev) => !prev)
  const goToPage = (index: number) => {
    if (index >= 0 && index < pages.length) {
      setCurrentPage(index)
      setIsPlaying(false)
      setTimeout(() => setIsPlaying(true), 2000)
    }
  }

  const handleSeek = (value: number) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const newTime = (value / 100) * audio.duration
    audio.currentTime = newTime
    setCurrentTime(newTime)
    setProgress(value)
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`
  }

  if (pages.length === 0) return <div className="text-center mt-20">동화 불러오는 중...</div>

  const page = pages[currentPage]
  const subtitleText = subtitles.join(" ")

  return (
    <main className="p-6 flex flex-col items-center">
      <HomeButton />
      <div className="max-w-3xl w-full bg-white/90 p-6 rounded-lg shadow-md transition-transform duration-700 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ transform: "rotateY(90deg)", transformOrigin: "right", opacity: 0 }}
            animate={{ transform: "rotateY(0deg)", opacity: 1 }}
            exit={{ transform: "rotateY(-90deg)", transformOrigin: "left", opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="relative w-full h-[400px] bg-gray-100 flex items-center justify-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            <Image
              src={page.image_url}
              alt={`페이지 ${currentPage + 1}`}
              width={600}
              height={400}
              className="object-contain max-w-full max-h-full"
            />
          </motion.div>
        </AnimatePresence>

        <p className="text-lg text-center mt-4 mb-4">{subtitleText}</p>
        <audio ref={audioRef} src={page.voice_url} preload="auto" />

        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={(e) => handleSeek(Number(e.target.value))}
          onMouseDown={() => {
            setIsSeeking(true)
            setIsPlaying(false)
          }}
          onMouseUp={() => {
            setIsSeeking(false)
            setIsPlaying(true)
          }}
          onTouchStart={() => {
            setIsSeeking(true)
            setIsPlaying(false)
          }}
          onTouchEnd={() => {
            setIsSeeking(false)
            setIsPlaying(true)
          }}
          className="w-full mb-4 h-2 appearance-none rounded-full bg-transparent"
          style={{
            background: `linear-gradient(to right, #3b82f6 ${progress}%, #d1d5db ${progress}%)`
          }}
        />

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
