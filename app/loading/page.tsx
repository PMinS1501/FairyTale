// "use client"

// import { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import Image from "next/image"
// import { Loader2 } from "lucide-react"
// import HomeButton from "@/components/home-button"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"

// interface Storybook {
//   id: number
//   img: string
//   title: string
//   play_time: string
//   keyword: string
// }

// export default function LoadingPage() {
//   const router = useRouter()
//   const [progress, setProgress] = useState(0)
//   const [samples, setSamples] = useState<Storybook[]>([])

//   useEffect(() => {
//     // AI 생성 시뮬레이션
//     const interval = setInterval(() => {
//       setProgress((prev) => {
//         if (prev >= 100) {
//           clearInterval(interval)
//           setTimeout(() => {
//             router.push("/selection")
//           }, 500)
//           return 100
//         }
//         return prev + 5
//       })
//     }, 300)
//     return () => clearInterval(interval)
//   }, [router])

//   useEffect(() => {
//     // API 호출
//     fetch("/api/samples")
//       .then((res) => res.json())
//       .then((data) => {
//         setSamples(data.slice(0, 3)) // 최대 3개만 사용
//       })
//       .catch((err) => {
//         console.error("Sample fetch error:", err)
//       })
//   }, [])

//   return (
//     <main className="flex min-h-screen flex-col items-center p-8">
//       <HomeButton />

//       <div className="w-full max-w-3xl mx-auto">
//         <div className="text-center mb-12 bg-white/80 p-6 rounded-lg backdrop-blur-sm">
//           <h1 className="text-3xl font-bold mb-4">동화책 생성 중</h1>
//           <div className="flex items-center justify-center gap-3 mb-8">
//             <Loader2 className="h-8 w-8 animate-spin" />
//             <p className="text-xl">{progress}% 완료</p>
//           </div>
//           <p className="text-muted-foreground">
//             AI가 답변을 바탕으로 맞춤형 동화책을 만들고 있습니다. 잠시만 기다려주세요...
//           </p>
//         </div>

//         <div className="mt-12 w-full">
//           <h2 className="text-2xl font-semibold mb-6 bg-white/80 px-4 py-2 rounded-md inline-block">
//             기다리는 동안 이런 동화책은 어떠세요:
//           </h2>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {samples.map((book) => (
//               <Card
//                 key={book.id}
//                 className="p-4 flex flex-col bg-white/90 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-shadow"
//               >
//                 <div className="relative h-40 mb-4">
//                   <Image
//                     src={book.img || "/placeholder.svg"}
//                     alt={book.title}
//                     fill
//                     className="object-cover rounded-md"
//                   />
//                 </div>
//                 <h3 className="text-lg font-semibold mb-1">{book.title}</h3>
//                 <Badge variant="secondary" className="mb-2 w-fit">{book.keyword}</Badge>
//                 <p className="text-sm text-muted-foreground">재생 시간: {book.play_time}</p>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </div>
//     </main>
//   )
// }
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { HelpCircle, Loader2 } from "lucide-react"
import HomeButton from "@/components/home-button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import HelpDialog from "@/components/HelpDialog"
import { Button } from "@/components/ui/button"


interface Storybook {
  id: number
  img: string
  title: string
  play_time: string
  keyword: string
}

export default function LoadingPage() {
  const router = useRouter()
  const [progressText, setProgressText] = useState("AI가 동화를 만들고 있어요...")
  const [samples, setSamples] = useState<Storybook[]>([])
  const [storybookId, setStorybookId] = useState<string | null>(null)
  const [helpDialogOpen, setHelpDialogOpen] = useState(false)
  const [helpTab, setHelpTab] = useState<1 | 2>(2)


  useEffect(() => {
    // 1. 샘플 동화 목록 받아오기
    fetch("/api/proxy-upload?path=sample/")
      .then((res) => res.json())
      .then((data) => setSamples(data.slice(0, 3)))
      .catch((err) => console.error("샘플 불러오기 실패:", err))

    // 2. 동화 생성 요청
    const createStorybook = async () => {
      try {
        const res = await fetch("/api/proxy-upload?path=create_storybook", {
          method: "POST",
        })
        const data = await res.json()
        setStorybookId(data.storybook_id)
      } catch (error) {
        console.error("동화 생성 요청 실패:", error)
        setProgressText("동화 생성 중 오류 발생 😢")
      }
    }

    createStorybook()
  }, [])

  // 3. 생성 완료 여부 확인
  useEffect(() => {
    if (!storybookId) return

    const checkStatus = setInterval(async () => {
      try {
        const res = await fetch(`/api/proxy-upload?path=storybook_status&id=${storybookId}`)
        const data = await res.json()

        if (data.status === "completed") {
          clearInterval(checkStatus)
          router.push("/selection")
        } else {
          setProgressText(`동화 생성 중... (${data.progress || "?"}%)`)
        }
      } catch (error) {
        console.error("상태 확인 실패:", error)
      }
    }, 2000)

    return () => clearInterval(checkStatus)
  }, [storybookId, router])

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <HomeButton />
        <Button variant="outline" size="icon" className="absolute top-4 left-16 z-10" onClick={() => setHelpDialogOpen(true)}>
        <HelpCircle className="h-5 w-5" />
      </Button>
      <HelpDialog
        open={helpDialogOpen}
        onOpenChange={setHelpDialogOpen}
        helpTab={helpTab}
        setHelpTab={setHelpTab}
      />

      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-12 bg-white/80 p-6 rounded-lg backdrop-blur-sm">
          <h1 className="text-3xl font-bold mb-4">동화 만드는 중</h1>
          <div className="flex items-center justify-center gap-3 mb-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-xl">{progressText}</p>
          </div>
          <p className="text-muted-foreground">
            지금 맞춤 동화를 만들고 있어요! 잠시만 기다려주세요!
          </p>
        </div>

        <div className="mt-12 w-full">
          <h2 className="text-2xl font-semibold mb-6 bg-white/80 px-4 py-2 rounded-md inline-block">
            기다리는 동안 이런 동화책은 어떠세요?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {samples.map((book) => (
              <Card
                key={book.id}
                className="p-4 flex flex-col bg-white/90 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="relative h-40 mb-4">
                  <Image
                    src={book.img || "/placeholder.svg"}
                    alt={book.title}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <h3 className="text-lg font-semibold mb-1">{book.title}</h3>
                <Badge variant="secondary" className="mb-2 w-fit">{book.keyword}</Badge>
                <p className="text-sm text-muted-foreground">재생 시간: {book.play_time}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
