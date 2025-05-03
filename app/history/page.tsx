"use client"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import HomeButton from "@/components/home-button"

// Sample history of created storybooks
const historyStorybooks = [
  {
    id: 101,
    title: "산 탐험가",
    image: "/placeholder.svg?height=150&width=250",
    keywords: ["모험", "결단력", "자연"],
    createdAt: "2023-04-15",
  },
  {
    id: 102,
    title: "꿈의 도시",
    image: "/placeholder.svg?height=150&width=250",
    keywords: ["상상력", "창의성", "우정"],
    createdAt: "2023-04-10",
  },
  {
    id: 103,
    title: "시간 여행자",
    image: "/placeholder.svg?height=150&width=250",
    keywords: ["역사", "발견", "학습"],
    createdAt: "2023-04-05",
  },
  {
    id: 104,
    title: "수중 왕국",
    image: "/placeholder.svg?height=150&width=250",
    keywords: ["바다", "탐험", "팀워크"],
    createdAt: "2023-03-28",
  },
]

export default function HistoryPage() {
  const router = useRouter()

  const handleViewStorybook = (id: number) => {
    router.push(`/storybook/${id}`)
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <HomeButton />

      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-center">
          <h1 className="text-3xl font-bold bg-white/80 px-4 py-2 rounded-md">동화책 이력</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {historyStorybooks.map((book) => (
            <Card key={book.id} className="p-4 flex flex-col bg-white/90 backdrop-blur-sm">
              <div className="relative h-40 mb-4">
                <Image
                  src={book.image || "/placeholder.svg"}
                  alt={book.title}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <h3 className="text-lg font-medium mb-2">{book.title}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {book.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-sm text-muted-foreground">생성일: {book.createdAt}</span>
                <Button variant="outline" onClick={() => handleViewStorybook(book.id)} className="bg-white/80">
                  보기
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
