"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import HomeButton from "@/components/home-button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// Sample pre-made storybooks
const premadeStorybooks = [
  {
    id: 1,
    title: "숲속 모험",
    image: "/placeholder.svg?height=150&width=250",
    keywords: ["모험", "우정", "용기"],
    description:
      "작은 다람쥐가 숲속에서 새로운 친구들을 만나 용기를 배우는 이야기입니다. 다람쥐는 처음에는 두려움이 많았지만, 친구들과 함께하며 모험을 통해 용기를 얻게 됩니다.",
  },
  {
    id: 2,
    title: "바다 탐험가",
    image: "/placeholder.svg?height=150&width=250",
    keywords: ["발견", "팀워크", "인내"],
    description:
      "호기심 많은 물고기가 바다 깊은 곳을 탐험하며 다양한 해양 생물들과 팀을 이루어 문제를 해결해나가는 이야기입니다. 함께 협력하는 과정에서 인내의 중요성을 배웁니다.",
  },
  {
    id: 3,
    title: "우주 여행",
    image: "/placeholder.svg?height=150&width=250",
    keywords: ["상상력", "호기심", "학습"],
    description:
      "꿈 많은 아이가 우주선을 타고 다양한 행성을 방문하며 우주의 신비를 배우는 이야기입니다. 각 행성에서 새로운 지식을 얻고 상상력을 키워나갑니다.",
  },
]

export default function LoadingPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [selectedBook, setSelectedBook] = useState<number | null>(null)

  useEffect(() => {
    // Simulate AI generating stories
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          // Navigate to selection page after "generating" is complete
          setTimeout(() => {
            router.push("/selection")
          }, 500)
          return 100
        }
        return prev + 5
      })
    }, 300)

    return () => clearInterval(interval)
  }, [router])

  const handleBookClick = (id: number) => {
    setSelectedBook(id)
  }

  const getSelectedBook = () => {
    return premadeStorybooks.find((book) => book.id === selectedBook)
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <HomeButton />

      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-12 bg-white/80 p-6 rounded-lg backdrop-blur-sm">
          <h1 className="text-3xl font-bold mb-4">동화책 생성 중</h1>
          <div className="flex items-center justify-center gap-3 mb-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-xl">{progress}% 완료</p>
          </div>
          <p className="text-muted-foreground">
            AI가 답변을 바탕으로 맞춤형 동화책을 만들고 있습니다. 잠시만 기다려주세요...
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6 bg-white/80 px-4 py-2 rounded-md inline-block">
            기다리는 동안 이런 동화책은 어떠세요:
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {premadeStorybooks.map((book) => (
              <Card
                key={book.id}
                className="p-4 flex flex-col bg-white/90 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleBookClick(book.id)}
              >
                <div className="relative h-40 mb-4">
                  <Image
                    src={book.image || "/placeholder.svg"}
                    alt={book.title}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <h3 className="text-lg font-medium mb-2">{book.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {book.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={selectedBook !== null} onOpenChange={(open) => !open && setSelectedBook(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{getSelectedBook()?.title}</DialogTitle>
            <DialogDescription>{getSelectedBook()?.keywords.join(", ")}</DialogDescription>
          </DialogHeader>
          <div className="relative h-40 mb-4">
            <Image
              src={getSelectedBook()?.image || "/placeholder.svg"}
              alt={getSelectedBook()?.title || ""}
              fill
              className="object-cover rounded-md"
            />
          </div>
          <p className="text-sm">{getSelectedBook()?.description}</p>
          <DialogClose asChild>
            <Button className="mt-4">닫기</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </main>
  )
}
