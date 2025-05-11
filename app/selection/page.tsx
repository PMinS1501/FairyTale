"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import HomeButton from "@/components/home-button"
import { ArrowLeft } from "lucide-react"

// // Sample generated storybooks
// const generatedStorybooks = [
//   {
//     id: 1,
//     title: "마법의 숲 모험",
//     image: "/placeholder.svg?height=200&width=300",
//     keywords: ["마법", "우정", "모험"],
//     summary: "여우 루나와 함께 마법의 숲을 여행하며 우정과 용기의 가치를 배우는 여정을 떠나보세요.",
//   },
//   {
//     id: 2,
//     title: "바다 깊은 곳의 발견",
//     image: "/placeholder.svg?height=200&width=300",
//     keywords: ["바다", "발견", "팀워크"],
//     summary: "곰 맥스와 함께 바다 깊은 곳을 탐험하며 팀워크와 인내의 중요성을 발견해보세요.",
//   },
//   {
//     id: 3,
//     title: "별들을 향한 여행",
//     image: "/placeholder.svg?height=200&width=300",
//     keywords: ["우주", "상상력", "학습"],
//     summary: "토끼 조이와 함께 별과 우주를 여행하며 상상력과 배움의 즐거움을 경험하는 우주 모험.",
//   },
// ]

// export default function SelectionPage() {
//   const router = useRouter()
//   const [selectedBook, setSelectedBook] = useState<number | null>(null)

//   const handleSelectBook = (id: number) => {
//     setSelectedBook(id)
//   }

//   const handleViewBook = () => {
//     if (selectedBook !== null) {
//       router.push(`/storybook/${selectedBook}`)
//     }
//   }

//   return (
//     <main className="flex min-h-screen flex-col items-center p-8">
//       <HomeButton />

//       <div className="w-full max-w-4xl mx-auto">
//         <div className="mb-8 flex justify-between items-center">
//           <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2 bg-white/80">
//             <ArrowLeft className="h-5 w-5" />
//             뒤로가기
//           </Button>
//           <h1 className="text-3xl font-bold bg-white/80 px-4 py-2 rounded-md">동화책 선택</h1>
//           <div className="w-24"></div> {/* Spacer for alignment */}
//         </div>

//         <div className="text-center mb-12 bg-white/80 p-6 rounded-lg backdrop-blur-sm">
//           <p className="text-xl text-muted-foreground">AI가 만든 동화책 중 하나를 선택하세요</p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
//           {generatedStorybooks.map((book) => (
//             <Card
//               key={book.id}
//               className={`p-4 cursor-pointer transition-all bg-white/90 backdrop-blur-sm ${selectedBook === book.id ? "ring-2 ring-primary" : ""}`}
//               onClick={() => handleSelectBook(book.id)}
//             >
//               <div className="relative h-40 mb-4">
//                 <Image
//                   src={book.image || "/placeholder.svg"}
//                   alt={book.title}
//                   fill
//                   className="object-cover rounded-md"
//                 />
//               </div>
//               <h3 className="text-lg font-medium mb-2">{book.title}</h3>
//               <div className="flex flex-wrap gap-2 mb-4">
//                 {book.keywords.map((keyword) => (
//                   <Badge key={keyword} variant="secondary">
//                     {keyword}
//                   </Badge>
//                 ))}
//               </div>
//               <p className="text-sm text-muted-foreground">{book.summary}</p>
//             </Card>
//           ))}
//         </div>

//         <div className="flex justify-center">
//           <Button size="lg" onClick={handleViewBook} disabled={selectedBook === null}>
//             선택한 동화책 보기
//           </Button>
//         </div>
//       </div>
//     </main>
//   )
// }


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
  const [storybooks, setStorybooks] = useState<Storybook[]>([])
  const [selectedBook, setSelectedBook] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

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

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-center">동화책 선택</h1>

      {isLoading ? (
        <p className="text-center text-muted-foreground">동화를 불러오는 중입니다...</p>
      ) : hasError ? (
        <p className="text-center text-red-500">동화를 불러오는 데 실패했습니다.</p>
      ) : storybooks.length === 0 ? (
        <p className="text-center text-muted-foreground">불러올 동화가 없습니다.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {storybooks.map((book) => (
              <Card
                key={book.id}
                className={`p-4 cursor-pointer ${selectedBook === book.id ? "ring-2 ring-primary" : ""}`}
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
