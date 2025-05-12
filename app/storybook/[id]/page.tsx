"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Pause, Play, SkipBack, SkipForward } from "lucide-react"
import HomeButton from "@/components/home-button"

export default function StoryPage({ params }: { params: { id: string } }) {
//  const [pages, setPages] = useState([])
  type Sentence = {
    sentence_id : number
    text : string
    audio_url : string
  }

  type Page = {
    image_url : string
    sentences : Sentence[]
  }
  const [pages, setPages] = useState<Page[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [currentSentence, setCurrentSentence] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    fetch(`/api/stories/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setPages(data.pages)
      })
  }, [params.id])

  // 문장 재생이 끝나면 다음 문장/페이지로 전환
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play()
    }

    const handleEnded = () => {
      const sentenceList = pages[currentPage]?.sentences || []
      if (currentSentence < sentenceList.length - 1) {
        setCurrentSentence(prev => prev + 1)
      } else if (currentPage < pages.length - 1) {
        setCurrentPage(prev => prev + 1)
        setCurrentSentence(0)
      } else {
        setIsPlaying(false) // 마지막 문장
      }
    }

    audio.addEventListener("ended", handleEnded)
    return () => audio.removeEventListener("ended", handleEnded)
  }, [isPlaying, currentPage, currentSentence, pages])

  const togglePlay = () => {
    setIsPlaying(prev => !prev)
  }

  const goToPrev = () => {
    if (currentSentence > 0) {
      setCurrentSentence(prev => prev - 1)
    } else if (currentPage > 0) {
      setCurrentPage(prev => prev - 1)
      setCurrentSentence(pages[currentPage - 1].sentences.length - 1)
    }
  }

  const goToNext = () => {
    const sentenceList = pages[currentPage]?.sentences || []
    if (currentSentence < sentenceList.length - 1) {
      setCurrentSentence(prev => prev + 1)
    } else if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1)
      setCurrentSentence(0)
    }
  }

  if (pages.length === 0) return <div>불러오는 중...</div>

  const current = pages[currentPage]
  const sentence = current.sentences[currentSentence]

  return (
    <main className="p-6 flex flex-col items-center">
      <HomeButton />
      <div className="max-w-3xl w-full bg-white/80 p-6 rounded-lg shadow-md">
        <Image
          src={current.image_url}
          alt={`페이지 이미지 ${currentPage + 1}`}
          width={500}
          height={300}
          className="mx-auto mb-4 rounded"
        />

        <p className="text-lg text-center mb-4">{sentence.text}</p>
        <audio ref={audioRef} src={sentence.audio_url} preload="auto" />

        <div className="flex justify-center gap-4 mt-4">
          <Button onClick={goToPrev} variant="outline" size="icon">
            <SkipBack className="w-5 h-5" />
          </Button>
          <Button onClick={togglePlay} variant="outline" size="icon">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <Button onClick={goToNext} variant="outline" size="icon">
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        <div className="mt-4 text-center text-muted-foreground">
          페이지 {currentPage + 1} / {pages.length}, 문장 {currentSentence + 1} / {current.sentences.length}
        </div>
      </div>
    </main>
  )
}