"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Loader2, HelpCircle, X, Pause, Play, ChevronLeft, ChevronRight } from "lucide-react"
import HomeButton from "@/components/home-button"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import HelpDialog from "@/components/HelpDialog"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"

interface Storybook {
  title: string
  play_time: string
  created_day: string
  img: string
  url: string
}

type RawScript = {
  page: number
  s3_path: string
}

type StoryPage = {
  image_url: string
  voice_url: string
  text_url: string
}

export default function LoadingPage() {
  const router = useRouter()
  const [progressText, setProgressText] = useState("AI가 동화를 만들고 있어요...")
  const [helpDialogOpen, setHelpDialogOpen] = useState(false)
  const searchParams = useSearchParams()
  const [storybooks, setStorybooks] = useState<Storybook[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [cardRect, setCardRect] = useState<DOMRect | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalStoryUrl, setModalStoryUrl] = useState<string | null>(null)
  
  // 모달 내 동화 재생 관련 상태
  const [storyPages, setStoryPages] = useState<StoryPage[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [subtitles, setSubtitles] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)

  const selectedCardRef = useRef<HTMLDivElement | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { theme } = useTheme()
  const [showCompletionNotice, setShowCompletionNotice] = useState(false)

  // 테마에 따른 색상 반환
  const getThemeColor = () => {
    if (theme === "alley") return "#10b981" // green-500
    if (theme === "sky") return "#3b82f6"   // blue-500
    return "#3b82f6" // default
  }

  // 카드 애니메이션 완료 핸들러
  const handleCardAnimationComplete = () => {
    setIsAnimating(false)
    setShowModal(true)
  }

  // 샘플 동화 불러오기
  useEffect(() => {
    const highlightParam = searchParams.get("highlightedIndex")
    if (highlightParam) setHighlightedIndex(Number(highlightParam))

    fetch("/api/proxy-upload?path=fairy-tale")
      .then((res) => {
        if (!res.ok) throw new Error("API 실패")
        return res.json()
      })
      .then((data) => {
        const formatted = data.map((item: any) => {
          const adjustedMs = Number(item.running_time) * (5 / 4)
          const minutes = Math.floor(adjustedMs / 60000)
          const seconds = Math.floor((adjustedMs % 60000) / 1000)
          return {
            title: item.title,
            play_time: `${minutes}분 ${seconds}초`,
            created_day: new Date(item.created_at).toLocaleString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            img: item.thumbnail_url,
            url: item.fairy_tale_url,
          }
        })

        console.log("응답받은 동화 URL 목록:")
        formatted.forEach((item: any) => {
          console.log(`${item.title}: ${item.url}`)
        })

        // 최대 3개만 표시
        setStorybooks(formatted.slice(0, 3))
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching fairy tales:", err)
        setHasError(true)
        setIsLoading(false)
      })
  }, [searchParams])

// 처음 30초 대기 후, 15초 간격으로 status 체크
useEffect(() => {
  const pollForCompletion = async () => {
    // 처음 30초 대기
    console.log("30초 대기 중...")
    await new Promise((resolve) => setTimeout(resolve, 30000))

    while (true) {
      try {
        const res = await fetch("/api/proxy-upload?checkStatus=true", { method: "GET" })
        console.log("상태 체크 응답:", res.ok)

        if (res.ok) {
          const data = await res.json()
          console.log("상태 데이터:", data)

            if (data.status === 2) {
            console.log("동화 생성 완료!")
            setProgressText("동화 생성 완료!")
            setShowCompletionNotice(true)
            break
          } else if (data.status === 3) {
            console.log("동화 생성 실패")
            setProgressText("동화 생성에 실패했습니다.")
            alert("동화 생성 중 오류가 발생했습니다. 다시 시도해주세요.")
            break
          } else if (data.status === 1) {
            console.log("처리 중...")
            setProgressText("동화 생성 중...")
          }
        }
      } catch (err) {
        console.error("상태 체크 실패:", err)
      }

      // 15초 대기
      await new Promise((resolve) => setTimeout(resolve, 15000))
    }
  }

  pollForCompletion()
}, [router])

  const handleOpenStory = () => {
    if (selectedIndex !== null && selectedCardRef.current) {
      const rect = selectedCardRef.current.getBoundingClientRect()
      setCardRect(rect)
      setModalStoryUrl(storybooks[selectedIndex].url)
      setIsAnimating(true)
    }
  }

  // 모달 내 동화 로딩
  useEffect(() => {
    if (!modalStoryUrl || !showModal) return

    const loadStory = async () => {
      try {
        const res = await fetch(`/api/proxy-upload?s3Url=${encodeURIComponent(modalStoryUrl)}`)
        const json = await res.json()
        const { images, audios, scripts }: { images: string[]; audios: string[]; scripts: RawScript[] } = json

        if (!images || !audios || !scripts) {
          console.error("❌ JSON 형식 오류: images, audios, scripts 누락")
          return
        }

        const merged: StoryPage[] = images.map((img, i) => ({
          image_url: img,
          voice_url: audios[i],
          text_url: scripts[i]?.s3_path || ""
        }))

        setStoryPages(merged)
        setCurrentPage(0)
        setIsPlaying(false)
      } catch (err) {
        console.error("❌ 동화 JSON 로딩 실패:", err)
      }
    }

    loadStory()
  }, [modalStoryUrl, showModal])

  // 자막 로딩
  useEffect(() => {
    const fetchSubtitle = async () => {
      if (!storyPages.length || !showModal) return
      const page = storyPages[currentPage]
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
  }, [storyPages, currentPage, showModal])

  // 오디오 제어
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !showModal) return

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
      if (currentPage < storyPages.length - 1) {
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
  }, [isPlaying, currentPage, storyPages, isSeeking, showModal])

  const togglePlay = () => setIsPlaying((prev) => !prev)
  
  const goToPage = (index: number) => {
    if (index >= 0 && index < storyPages.length) {
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

  const closeModal = () => {
    setShowModal(false)
    setIsPlaying(false)
    setStoryPages([])
    setCurrentPage(0)
    setModalStoryUrl(null)
    setCardRect(null)
  }

  return (
    
    <main className="flex min-h-screen flex-col items-center p-8 relative overflow-hidden">
      <div
        ref={overlayRef}
        className="fixed top-0 left-0 w-full h-full bg-white opacity-0 pointer-events-none z-50"
      />

      <HomeButton />
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 left-16 z-10"
        onClick={() => setHelpDialogOpen(true)}
      >
        <HelpCircle className="h-5 w-5" />
      </Button>
      <HelpDialog
        open={helpDialogOpen}
        onOpenChange={setHelpDialogOpen}
      />

      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-12 bg-white/80 p-6 rounded-lg backdrop-blur-sm">
          <h1 className="text-3xl font-bold mb-4">동화 만드는 중</h1>
          <div className="flex items-center justify-center gap-3 mb-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-xl">{progressText}</p>
          </div>
          <p className="text-muted-foreground">잠시만 기다려 주세요. 동화를 만드는 중이에요!</p>
        </div>

        <div className="mt-12 w-full">
          <h2 className="text-2xl font-semibold mb-6 bg-white/80 px-4 py-2 rounded-md inline-block">
            기다리는 동안 이런 동화책은 어떠세요?
          </h2>

          {isLoading ? (
            <p className="text-center text-muted-foreground">동화를 불러오는 중입니다...</p>
          ) : hasError ? (
            <p className="text-center text-red-500">동화를 불러오는 데 실패했습니다.</p>
          ) : storybooks.length === 0 ? (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">생성된 동화가 없습니다! 만들어보세요!</p>
              <Button onClick={() => router.push("/questions")}>만들러 가기</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {storybooks.map((book, idx) => (
                  <Card
                    key={idx}
                    ref={selectedIndex === idx ? selectedCardRef : null}
                    className={`cursor-pointer overflow-hidden transition-all ${
                      selectedIndex === idx ? "ring-2 ring-primary" : ""
                    } ${highlightedIndex === idx ? "border-4 border-yellow-400" : ""}`}
                    onClick={(e) => {
                      setSelectedIndex(idx)
                      selectedCardRef.current = e.currentTarget
                    }}
                  >
                    <div className="relative w-full aspect-[3/2] rounded">
                      <Image
                        src={book.img}
                        alt={book.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-lg font-semibold truncate">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        ⏱ {book.play_time}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="text-center">
                <Button onClick={handleOpenStory} disabled={selectedIndex === null}>
                  선택한 동화책 보기
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
            {showCompletionNotice && (
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 shadow-lg p-4 rounded-xl z-50 text-center">
              <p className="text-lg font-semibold mb-2">동화가 생성되었어요! 동화 목록으로 이동할까요?</p>
              <Button onClick={() => router.push("/selection")}>
              동화 보러 가기!
              </Button>
              </div>
            )}
      {/* 동화 재생 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {selectedIndex !== null ? storybooks[selectedIndex].title : "동화"}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6">
              {storyPages.length === 0 ? (
                <div className="text-center py-8">동화 불러오는 중...</div>
              ) : (
                <>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPage}
                      initial={{ transform: "rotateY(90deg)", transformOrigin: "right", opacity: 0 }}
                      animate={{ transform: "rotateY(0deg)", opacity: 1 }}
                      exit={{ transform: "rotateY(-90deg)", transformOrigin: "left", opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="relative w-full h-[400px] bg-gray-100 flex items-center justify-center mb-4"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <Image
                        src={storyPages[currentPage].image_url}
                        alt={`페이지 ${currentPage + 1}`}
                        width={600}
                        height={400}
                        className="object-contain max-w-full max-h-full"
                      />
                    </motion.div>
                  </AnimatePresence>

                  <p className="text-lg text-center mb-4">{subtitles.join(" ")}</p>
                  
                  {storyPages[currentPage] && (
                    <audio ref={audioRef} src={storyPages[currentPage].voice_url} preload="auto" />
                  )}

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
                      background: `linear-gradient(to right, ${getThemeColor()} ${progress}%, #d1d5db ${progress}%)`
                    }}
                  />

                  <div className="flex justify-center gap-4 mb-4">
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

                  <div className="text-center text-muted-foreground">
                    페이지 {currentPage + 1} / {storyPages.length}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isAnimating && cardRect && selectedIndex !== null && (
          <motion.div
            className="fixed z-40 rounded-xl overflow-hidden shadow-2xl"
            style={{
              top: cardRect.top,
              left: cardRect.left,
              width: cardRect.width,
              height: cardRect.height,
              position: "fixed",
            }}
            initial={{ scale: 1, opacity: 1 }}
            animate={{
              top: window.innerHeight / 2 - cardRect.height / 2,
              left: window.innerWidth / 2 - cardRect.width / 2,
              scale: 1.3,
              opacity: 1,
            }}
            transition={{ duration: 1.2 }}
            onAnimationComplete={handleCardAnimationComplete}
          >
            <Image
              src={storybooks[selectedIndex].img}
              alt="썸네일"
              width={cardRect.width}
              height={cardRect.height}
              className="object-cover w-full h-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}