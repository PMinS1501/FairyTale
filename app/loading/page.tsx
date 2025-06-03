// // "use client"

// // import { useEffect, useState } from "react"
// // import { useRouter } from "next/navigation"
// // import Image from "next/image"
// // import { Loader2, HelpCircle } from "lucide-react"
// // import HomeButton from "@/components/home-button"
// // import { Card } from "@/components/ui/card"
// // import { Badge } from "@/components/ui/badge"
// // import { Button } from "@/components/ui/button"
// // import HelpDialog from "@/components/HelpDialog"

// // interface Storybook {
// //   id: number
// //   img: string
// //   title: string
// //   play_time: string
// //   keyword: string
// // }

// // export default function LoadingPage() {
// //   const router = useRouter()
// //   const [samples, setSamples] = useState<Storybook[]>([])
// //   const [storybookId, setStorybookId] = useState<string | null>(null)
// //   const [isCompleted, setIsCompleted] = useState(false)
// //   const [finalStorybookUrl, setFinalStorybookUrl] = useState<string>("")
// //   const [progressText, setProgressText] = useState("AI가 동화를 만들고 있어요...")
// //   const [helpDialogOpen, setHelpDialogOpen] = useState(false)
// //   const [helpTab, setHelpTab] = useState<1 | 2>(2)

// //   // 샘플 동화 불러오기
// //   useEffect(() => {
// //     fetch("/api/proxy-upload?path=sample/")
// //       .then((res) => res.json())
// //       .then((data) => setSamples(data.slice(0, 3)))
// //       .catch((err) => console.error("샘플 불러오기 실패:", err))
// //   }, [])

// //   // 동화 생성 요청 (응답이 없어도 OK 처리)
// //   useEffect(() => {
// //     const createStorybook = async () => {
// //       try {
// //         const res = await fetch("/api/proxy-upload?path=create_storybook", {
// //           method: "POST",
// //         })

// //         const text = await res.text()
// //         if (!text) {
// //           console.log("동화 생성 요청은 정상 접수되었지만 응답 본문이 없습니다.")
// //           return
// //         }

// //         const data = JSON.parse(text)
// //         setStorybookId(data.storybook_id)
// //       } catch (error) {
// //         console.error("동화 생성 요청 실패:", error)
// //         setProgressText("동화 생성 중 오류 발생 😢")
// //       }
// //     }
// //     createStorybook()
// //   }, [])

// //   // 상태 확인
// //   useEffect(() => {
// //     if (!storybookId) return

// //     const interval = setInterval(async () => {
// //       try {
// //         const res = await fetch(`/api/proxy-upload?path=storybook_status&id=${storybookId}`)
// //         const data = await res.json()

// //         if (data.status === "completed") {
// //           clearInterval(interval)
// //           setIsCompleted(true)
// //           setFinalStorybookUrl(data.s3Url)
// //           setProgressText("동화 생성 완료! 🎉")
// //         } else {
// //           setProgressText(`동화 생성 중... (${data.progress || "?"}%)`)
// //         }
// //       } catch (error) {
// //         console.error("상태 확인 실패:", error)
// //       }
// //     }, 2000)

// //     return () => clearInterval(interval)
// //   }, [storybookId])

// //   return (
// //     <main className="flex min-h-screen flex-col items-center p-8">
// //       <HomeButton />
// //       <Button variant="outline" size="icon" className="absolute top-4 left-16 z-10" onClick={() => setHelpDialogOpen(true)}>
// //         <HelpCircle className="h-5 w-5" />
// //       </Button>
// //       <HelpDialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen} helpTab={helpTab} setHelpTab={setHelpTab} />

// //       <div className="w-full max-w-3xl mx-auto">
// //         <div className="text-center mb-12 bg-white/80 p-6 rounded-lg backdrop-blur-sm">
// //           <h1 className="text-3xl font-bold mb-4">동화 만드는 중</h1>
// //           <div className="flex items-center justify-center gap-3 mb-8">
// //             {!isCompleted ? <Loader2 className="h-8 w-8 animate-spin" /> : null}
// //             <p className="text-xl">{progressText}</p>
// //           </div>
// //           {isCompleted && finalStorybookUrl && (
// //             <Button onClick={() => router.push(`/storypage?s3Url=${encodeURIComponent(finalStorybookUrl)}`)}>
// //               동화 보러 가기
// //             </Button>
// //           )}
// //           {!isCompleted && <p className="text-muted-foreground">지금 동화를 만들고 있어요! 조금만 기다려주세요!</p>}
// //         </div>

// //         <div className="mt-12 w-full">
// //           <h2 className="text-2xl font-semibold mb-6 bg-white/80 px-4 py-2 rounded-md inline-block">
// //             기다리는 동안 이런 동화책은 어떠세요?
// //           </h2>

// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //             {samples.map((book) => (
// //               <Card
// //                 key={book.id}
// //                 className="p-4 flex flex-col bg-gray/90 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-shadow"
// //               >
// //                 <div className="relative h-40 mb-4">
// //                   <Image
// //                     src={book.img || "/placeholder.svg"}
// //                     alt={book.title}
// //                     fill
// //                     className="object-cover rounded-md"
// //                   />
// //                 </div>
// //                 <h3 className="text-lg font-semibold mb-1">{book.title}</h3>
// //                 <Badge variant="secondary" className="mb-2 w-fit">{book.keyword}</Badge>
// //                 <p className="text-sm text-gray-600">재생 시간: {book.play_time}</p>
// //               </Card>
// //             ))}
// //           </div>
// //         </div>
// //       </div>
// //     </main>
// //   )
// // }
// "use client"

// import { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import Image from "next/image"
// import { Loader2, HelpCircle } from "lucide-react"
// import HomeButton from "@/components/home-button"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import HelpDialog from "@/components/HelpDialog"

// interface Storybook {
//   id: number
//   img: string
//   title: string
//   play_time: string
//   keyword: string
// }

// export default function LoadingPage() {
//   const router = useRouter()
//   const [samples, setSamples] = useState<Storybook[]>([])
//   const [progressText, setProgressText] = useState("AI가 동화를 만들고 있어요...")
//   const [helpDialogOpen, setHelpDialogOpen] = useState(false)
//   const [helpTab, setHelpTab] = useState<1 | 2>(2)

//   // 샘플 동화 불러오기
//   useEffect(() => {
//     fetch("/api/proxy-upload?path=sample/")
//       .then((res) => res.json())
//       .then((data) => setSamples(data.slice(0, 3)))
//       .catch((err) => console.error("샘플 불러오기 실패:", err))
//   }, [])

//   // 200 OK 응답 대기 (polling)
//   useEffect(() => {
//     const interval = setInterval(async () => {
//       try {
//         const res = await fetch("/api/proxy-upload", { method: "GET" })
//         console.log("✅ 응답 상태코드:", res.status)

//         if (res.status === 200) {
//           clearInterval(interval)
//           setProgressText("동화 생성 완료! 🎉")
//           setTimeout(() => {
//             router.push("/storybook")
//           }, 1000)
//         }
//       } catch (err) {
//         console.error("❌ 상태 확인 실패:", err)
//       }
//     }, 2000)

//     return () => clearInterval(interval)
//   }, [router])

//   return (
//     <main className="flex min-h-screen flex-col items-center p-8">
//       <HomeButton />
//       <Button
//         variant="outline"
//         size="icon"
//         className="absolute top-4 left-16 z-10"
//         onClick={() => setHelpDialogOpen(true)}
//       >
//         <HelpCircle className="h-5 w-5" />
//       </Button>
//       <HelpDialog
//         open={helpDialogOpen}
//         onOpenChange={setHelpDialogOpen}
//         helpTab={helpTab}
//         setHelpTab={setHelpTab}
//       />

//       <div className="w-full max-w-3xl mx-auto">
//         <div className="text-center mb-12 bg-white/80 p-6 rounded-lg backdrop-blur-sm">
//           <h1 className="text-3xl font-bold mb-4">동화 만드는 중</h1>
//           <div className="flex items-center justify-center gap-3 mb-8">
//             <Loader2 className="h-8 w-8 animate-spin" />
//             <p className="text-xl">{progressText}</p>
//           </div>
//           <p className="text-muted-foreground">잠시만 기다려 주세요. 동화를 만드는 중이에요!</p>
//         </div>

//         <div className="mt-12 w-full">
//           <h2 className="text-2xl font-semibold mb-6 bg-white/80 px-4 py-2 rounded-md inline-block">
//             기다리는 동안 이런 동화책은 어떠세요?
//           </h2>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {samples.map((book) => (
//               <Card
//                 key={book.id}
//                 className="p-4 flex flex-col bg-gray/90 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-shadow"
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
//                 <Badge variant="secondary" className="mb-2 w-fit">
//                   {book.keyword}
//                 </Badge>
//                 <p className="text-sm text-gray-600">재생 시간: {book.play_time}</p>
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
import { Loader2, HelpCircle } from "lucide-react"
import HomeButton from "@/components/home-button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import HelpDialog from "@/components/HelpDialog"

interface Storybook {
  id: number
  img: string
  title: string
  play_time: string
  keyword: string
}

export default function LoadingPage() {
  const router = useRouter()
  const [samples, setSamples] = useState<Storybook[]>([])
  const [progressText, setProgressText] = useState("AI가 동화를 만들고 있어요...")
  const [helpDialogOpen, setHelpDialogOpen] = useState(false)
  const [helpTab, setHelpTab] = useState<1 | 2>(2)

  // 샘플 동화 불러오기
  // useEffect(() => {
  //   fetch("/api/proxy-upload?path=sample/")
  //     .then((res) => res.json())
  //     .then((data) => setSamples(data.slice(0, 3)))
  //     .catch((err) => console.error("샘플 불러오기 실패:", err))
  // }, [])

  // 200 OK 응답 올 때까지 계속 확인
useEffect(() => {
  const pollForCompletion = async () => {
    while (true) {
      try {
        const res = await fetch("/api/proxy-upload", { method: "GET" })
        console.log("응답 수신 여부:", res.ok)

        if (res.ok) {
          console.log("✅ 응답 수신: 동화 생성 완료")
          setProgressText("동화 생성 완료!")

          const shouldMove = window.confirm("동화가 생성되었어요! 동화 목록으로 이동할까요?")
          if (shouldMove) {
            router.push("/storybook")
          }

          break
        }
      } catch (err) {
        console.error("❌ 요청 실패:", err)
      }

      // 5초 대기 후 다음 요청
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }

  pollForCompletion()
}, [router])

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
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
          <p className="text-muted-foreground">잠시만 기다려 주세요. 동화를 만드는 중이에요!</p>
        </div>

        <div className="mt-12 w-full">
          <h2 className="text-2xl font-semibold mb-6 bg-white/80 px-4 py-2 rounded-md inline-block">
            기다리는 동안 이런 동화책은 어떠세요?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {samples.map((book) => (
              <Card
                key={book.id}
                className="p-4 flex flex-col bg-gray/90 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-shadow"
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
                <Badge variant="secondary" className="mb-2 w-fit">
                  {book.keyword}
                </Badge>
                <p className="text-sm text-gray-600">재생 시간: {book.play_time}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
