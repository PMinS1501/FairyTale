"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

interface Storybook {
  title: string
  play_time: string
  created_day: string
  img: string
  url: string
}

export default function SelectionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [storybooks, setStorybooks] = useState<Storybook[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [cardRect, setCardRect] = useState<DOMRect | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const selectedCardRef = useRef<HTMLDivElement | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const highlightParam = searchParams.get("highlightedIndex")
    if (highlightParam) setHighlightedIndex(Number(highlightParam))

    fetch("/api/proxy-upload?path=fairy-tale")
      .then((res) => {
        if (!res.ok) throw new Error("API 실패")
        return res.json()
      })
      .then((data) => {
        const formatted = data.map((item: any) => ({
          title: item.title,
          play_time: `${Math.floor(Number(item.running_time) / 60)}분`,
          created_day: new Date(item.created_at).toLocaleDateString("ko-KR"),
          img: item.thumbnail_url,
          url: item.fairy_tale_url,
        }))

        console.log("응답받은 동화 URL 목록:")
        formatted.forEach((item: any) => {
          console.log(`${item.title}: ${item.url}`)
        })

        setStorybooks(formatted)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching fairy tales:", err)
        setHasError(true)
        setIsLoading(false)
      })
  }, [searchParams])

  const handleOpenStory = () => {
    if (selectedIndex !== null && selectedCardRef.current) {
      const rect = selectedCardRef.current.getBoundingClientRect()
      setCardRect(rect)
      setIsAnimating(true)
    }
  }

  const handleCardAnimationComplete = async () => {
    if (overlayRef.current) {
      overlayRef.current.style.transition = "opacity 1.5s ease"
      overlayRef.current.style.opacity = "1"
    }

    await new Promise((res) => setTimeout(res, 1600))
    const selected = storybooks[selectedIndex!]
    if (selected) {
      router.push(`/storypage?s3Url=${encodeURIComponent(selected.url)}`)
    }
  }

  return (
    <main className="p-8 relative overflow-hidden">
      <div
        ref={overlayRef}
        className="fixed top-0 left-0 w-full h-full bg-white opacity-0 pointer-events-none z-50"
      />

      <h1 className="text-2xl font-bold mb-4 text-center">동화책 선택</h1>

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
                className={`p-4 cursor-pointer transition-all ${
                  selectedIndex === idx ? "ring-2 ring-primary" : ""
                } ${highlightedIndex === idx ? "border-4 border-yellow-400" : ""}`}
                onClick={(e) => {
                  setSelectedIndex(idx)
                  selectedCardRef.current = e.currentTarget
                }}
              >
                <div className="relative h-40 mb-2">
                  <Image src={book.img} alt={book.title} fill className="object-cover rounded" />
                </div>
                <h3 className="text-lg font-semibold">{book.title}</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  ⏱ {book.play_time} | 🗓 {book.created_day}
                </p>
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
