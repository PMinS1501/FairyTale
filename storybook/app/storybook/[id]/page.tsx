"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Pause, SkipBack, SkipForward } from "lucide-react"
import Image from "next/image"
import HomeButton from "@/components/home-button"
import { Slider } from "@/components/ui/slider"
import { useAutoPlayback } from "@/hooks/use-auto-playback"

// Sample storybook content
const storybooks = {
  "1": {
    title: "마법의 숲 모험",
    pages: [
      {
        image: "/placeholder.svg?height=300&width=500",
        text: "옛날 옛적에, 마법의 숲 가장자리에 살던 영리한 여우 루나가 있었습니다.",
        audio: "/placeholder.svg?text=audio1.mp3", // 실제 구현 시 오디오 파일 경로로 대체
      },
      {
        image: "/placeholder.svg?height=300&width=500",
        text: "루나는 항상 나무들 너머에 무엇이 있는지 궁금했지만, 탐험할 용기가 없었습니다.",
        audio: "/placeholder.svg?text=audio2.mp3",
      },
      {
        image: "/placeholder.svg?height=300&width=500",
        text: "어느 날, 루나는 숲 깊은 곳에 숨겨진 보물에 대해 이야기해주는 친절한 부엉이를 만났습니다.",
        audio: "/placeholder.svg?text=audio3.mp3",
      },
      {
        image: "/placeholder.svg?height=300&width=500",
        text: "모험에 설레던 루나는 두려움을 극복하고 마법의 숲으로 여행을 떠나기로 결심했습니다.",
        audio: "/placeholder.svg?text=audio4.mp3",
      },
      {
        image: "/placeholder.svg?height=300&width=500",
        text: "여정 중에 루나는 도전과 장애물을 헤쳐나가는 데 도움을 주는 새로운 친구들을 사귀었습니다.",
        audio: "/placeholder.svg?text=audio5.mp3",
      },
      {
        image: "/placeholder.svg?height=300&width=500",
        text: "마침내, 루나는 진정한 보물은 자신이 맺은 우정과 내면에서 발견한 용기라는 것을 깨달았습니다.",
        audio: "/placeholder.svg?text=audio6.mp3",
      },
    ],
  },
  "2": {
    title: "바다 깊은 곳의 발견",
    pages: [
      {
        image: "/placeholder.svg?height=300&width=500",
        text: "맥스 곰은 해안가 마을에 살았고 항상 바다에 매료되어 있었습니다.",
        audio: "/placeholder.svg?text=audio1.mp3",
      },
      {
        image: "/placeholder.svg?height=300&width=500",
        text: "어느 날, 그는 숨겨진 수중 동굴을 보여주는 신비한 지도를 발견했습니다.",
        audio: "/placeholder.svg?text=audio2.mp3",
      },
      {
        image: "/placeholder.svg?height=300&width=500",
        text: "맥스는 친구들의 도움을 받아 바다 깊은 곳을 탐험하기 위한 잠수함을 만들었습니다.",
        audio: "/placeholder.svg?text=audio3.mp3",
      },
      {
        image: "/placeholder.svg?height=300&width=500",
        text: "그들이 더 깊이 잠수할수록, 아름다운 해양 생물과 화려한 산호초를 만났습니다.",
        audio: "/placeholder.svg?text=audio4.mp3",
      },
      {
        image: "/placeholder.svg?height=300&width=500",
        text: "잠수함이 걸렸을 때, 그들은 자유롭게 되기 위해 함께 협력해야 했습니다.",
        audio: "/placeholder.svg?text=audio5.mp3",
      },
      {
        image: "/placeholder.svg?height=300&width=500",
        text: "팀워크와 인내를 통해, 그들은 동굴을 찾았을 뿐만 아니라 함께 일하는 것의 중요성도 배웠습니다.",
        audio: "/placeholder.svg?text=audio6.mp3",
      },
    ],
  },
  "3": {
    title: "별들을 향한 여행",
    pages: [
      {
        image: "/placeholder.svg?height=300&width=500",
        text: "조이 토끼는 망원경을 가지고 있었고 매일 밤 별을 바라보는 것을 좋아했습니다.",
        audio: "/placeholder.svg?text=audio1.mp3",
      },
      {
        image: "/placeholder.svg?height=300&width=500",
        text: "그녀는 별을 방문하고 우주에 대해 배우는 꿈을 꾸었습니다.",
        audio: "/placeholder.svg?text=audio2.mp3",
      },
      {
        image: "/placeholder.svg?height=300&width=500",
        text: "어느 마법 같은 밤, 유성이 그녀의 정원에 떨어져 우주선으로 변했습니다.",
        audio: "/placeholder.svg?text=audio3.mp3",
      },
      {
        image: "/placeholder.svg?height=300&width=500",
        text: "조이는 우주선에 올라 우주로 날아가 행성을 방문하고 외계 생물을 만났습니다.",
        audio: "/placeholder.svg?text=audio4.mp3",
      },
      {
        image: "/placeholder.svg?height=300&width=500",
        text: "각 행성은 그녀에게 과학, 수학, 우주의 경이로움에 대한 새로운 것을 가르쳐주었습니다.",
        audio: "/placeholder.svg?text=audio5.mp3",
      },
      {
        image: "/placeholder.svg?height=300&width=500",
        text: "집으로 돌아왔을 때, 조이는 학습과 상상력이 그녀를 어디든 데려갈 수 있다는 것을 깨달았습니다.",
        audio: "/placeholder.svg?text=audio6.mp3",
      },
    ],
  },
}

// 시간 형식 변환 함수
function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export default function StorybookPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [storybook, setStorybook] = useState(null)

  useEffect(() => {
    // @ts-ignore - This is just for demo purposes
    setStorybook(storybooks[id])
  }, [id])

  const {
    currentPage,
    setCurrentPage,
    isPlaying,
    togglePlayback,
    nextPage,
    prevPage,
    progress,
    duration,
    currentTime,
    setCurrentTime,
  } = useAutoPlayback({
    totalPages: storybook?.pages?.length || 0,
    autoPlayDelay: 10000, // 10초마다 페이지 전환
  })

  // 슬라이더 값 변경 시 처리
  const handleSliderChange = (value: number[]) => {
    const newTime = (value[0] / 100) * duration
    setCurrentTime(newTime)

    // 현재 시간에 맞는 페이지로 이동
    const pageSize = duration / storybook.pages.length
    const newPage = Math.min(Math.floor(newTime / pageSize), storybook.pages.length - 1)
    setCurrentPage(newPage)
  }

  if (!storybook) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <HomeButton />
        <h1 className="text-3xl font-bold mb-4">동화책을 찾을 수 없습니다</h1>
        <Button onClick={() => router.back()}>뒤로가기</Button>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <HomeButton />

      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2 bg-white/80">
            <ArrowLeft className="h-5 w-5" />
            뒤로가기
          </Button>
          <h1 className="text-3xl font-bold bg-white/80 px-4 py-2 rounded-md">{storybook.title}</h1>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-8 mb-8">
          <div className="relative h-[300px] mb-6 mx-auto">
            <Image
              src={storybook.pages[currentPage].image || "/placeholder.svg"}
              alt={`페이지 ${currentPage + 1}`}
              fill
              className="object-contain"
            />
          </div>

          <p className="text-xl text-center mb-6">{storybook.pages[currentPage].text}</p>

          {/* 재생 컨트롤 */}
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-12">{formatTime(currentTime)}</span>
              <Slider value={[progress]} max={100} step={0.1} className="flex-1" onValueChange={handleSliderChange} />
              <span className="text-sm text-muted-foreground w-12">{formatTime(duration)}</span>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" size="icon" onClick={prevPage} disabled={currentPage === 0}>
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button variant="outline" size="icon" onClick={togglePlayback} className="bg-white/80">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={nextPage}
                disabled={currentPage === storybook.pages.length - 1}
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <Button onClick={prevPage} disabled={currentPage === 0} variant="outline" className="bg-white/80">
              이전 페이지
            </Button>

            <span className="text-muted-foreground">
              페이지 {currentPage + 1} / {storybook.pages.length}
            </span>

            <Button onClick={nextPage} disabled={currentPage === storybook.pages.length - 1}>
              다음 페이지
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
