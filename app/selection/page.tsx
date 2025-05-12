"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface Storybook {
  id: number
  img: string
  title: string
  created_day: string
  play_time: string
  keyword: string  // 하나의 키워드만 존재
}

export default function SelectionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [storybooks, setStorybooks] = useState<Storybook[]>([])
  const [selectedBook, setSelectedBook] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const newStoryId = searchParams.get('newStory') ? parseInt(searchParams.get('newStory')!) : null

  useEffect(() => {
    fetch("/api/stories")
      .then((res) => {
        if (!res.ok) throw new Error("API 실패")
        return res.json()
      })
      .then((data) => {
        setStorybooks(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching stories:", err)
        setHasError(true)
        setIsLoading(false)
      })
  }, [])

  const handleViewBook = () => {
    if (selectedBook !== null) {
      router.push(`/storybook/${selectedBook}`)
    }
  }

    const handleCreateStory = () => {
    router.push('/questions')
    }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-center">동화책 선택</h1>

      {isLoading ? (
        <p className="text-center text-muted-foreground">동화를 불러오는 중입니다...</p>
      ) : hasError ? (
          <p className="text-red-500 mb-4">동화를 불러오는 데 실패했습니다.</p>
      ) : storybooks.length === 0 ? (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">생성된 동화가 없습니다!</p>
          <Button onClick={handleCreateStory}>
            만들러 가기
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {storybooks.map((book) => (
              <Card
                key={book.id}
                className={`p-4 cursor-pointer 
                  ${selectedBook === book.id ? "ring-2 ring-primary" : ""} 
                  ${newStoryId === book.id ? "bg-yellow-50 border-2 border-yellow-300" : ""}`}
                onClick={() => setSelectedBook(book.id)}
              >
                <div className="relative h-40 mb-2">
                  <Image src={book.img} alt={book.title} fill className="object-cover rounded" />
                </div>
                <h3 className="text-lg font-semibold">{book.title}</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  ⏱ {book.play_time} | 📅 {book.created_day}
                </p>
                <p className="text-sm">🔖 {book.keyword}</p>
                {newStoryId === book.id && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-xs px-2 py-1 rounded">
                    New
                  </div>
                )}
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button onClick={handleViewBook} disabled={selectedBook === null}>
              선택한 동화책 보기
            </Button>
          </div>
        </>
      )}
    </main>
  )
}