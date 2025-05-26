// "use client"

// import { useState, useRef, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"
// import { useRouter } from "next/navigation"
// import { Mic, Square, ArrowRight, HelpCircle, Loader2 } from "lucide-react"
// import HomeButton from "@/components/home-button"
// import HelpDialog from "@/components/HelpDialog"
// import { CardWithBalloon } from "@/components/ui/card-with-balloon"

// const questions = [
//   "오늘 있었던 일 중에 가장 기억에 남는 일이 뭐야?",
//   "그 일은 언제, 어디에서 있었어?",
//   "그때 누구랑 같이 있었고, 어떤 일이 있었는지 이야기해 줄래?",
//   "그 일 때문에 기분이 어땠어?",
//   "그 일이 있고 나서 너는 어떤 생각이 들었어?",
// ]

// export default function QuestionsPage() {
//   const [helpDialogOpen, setHelpDialogOpen] = useState(false)
//   const [helpTab, setHelpTab] = useState<1 | 2>(1)
//   const [currentIndex, setCurrentIndex] = useState(0)
//   const [recordings, setRecordings] = useState<{ [index: number]: Blob }>({})
//   const [audioUrls, setAudioUrls] = useState<{ [index: number]: string | undefined }>({})
//   const [isRecording, setIsRecording] = useState(false)
//   const [isUploading, setIsUploading] = useState(false)
//   const [status, setStatus] = useState("")
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null)
//   const audioChunksRef = useRef<Blob[]>([])
//   const router = useRouter()

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
//       const mediaRecorder = new MediaRecorder(stream)
//       mediaRecorderRef.current = mediaRecorder
//       audioChunksRef.current = []

//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data)
//         }
//       }

//       mediaRecorder.onstop = () => {
//         const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mpeg" })
//         const audioUrl = URL.createObjectURL(audioBlob)
//         setAudioUrls((prev) => ({ ...prev, [currentIndex]: audioUrl }))
//         setRecordings((prev) => ({ ...prev, [currentIndex]: audioBlob }))
//         stream.getTracks().forEach((track) => track.stop())
//       }

//       mediaRecorder.start()
//       setIsRecording(true)
//     } catch (error) {
//       console.error("마이크 오류:", error)
//       alert("마이크 권한을 확인해주세요.")
//     }
//   }

//   const stopRecording = () => {
//     mediaRecorderRef.current?.stop()
//     setIsRecording(false)
//   }

//   const uploadAllRecordings = async () => {
//     try {
//       setIsUploading(true)
//       const uploadedUrls: { [key: number]: string } = {}

//       for (const [index, blob] of Object.entries(recordings)) {
//         const formData = new FormData()
//         formData.append("file", blob, `question_${index}.mp3`)

//         const res = await fetch("/api/proxy-upload", {
//           method: "POST",
//           body: formData,
//         })

//         if (!res.ok) {
//           const errorText = await res.text()
//           throw new Error(`(${index}) 업로드 실패: ${res.status} - ${errorText}`)
//         }

//         const data = await res.json()
//         uploadedUrls[+index] = data.file_url
//       }

//       console.log("✅ 모든 녹음 업로드 완료:", uploadedUrls)
//       setStatus("✅ 전체 업로드 성공!")
//       router.push(`/loading?storyId=uploaded`)
//     } catch (error) {
//       console.error("❌ 업로드 오류:", error)
//       alert(error instanceof Error ? error.message : "업로드 중 오류 발생")
//     } finally {
//       setIsUploading(false)
//     }
//   }

//   return (
//     <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 md:p-8">
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

//       <div className="w-full max-w-3xl mx-auto pt-20">
//         <h1 className="text-2xl font-bold mb-4 text-center">
//           질문 {currentIndex + 1} / {questions.length}
//         </h1>

//         <CardWithBalloon className="max-w-xl mx-auto">
//          <p className="text-lg font-medium text-center">
//           {questions[currentIndex]}
//         </p>
//         </CardWithBalloon>

//         <div className="flex flex-col items-center gap-4 mb-4">
//           {!isRecording && !audioUrls[currentIndex] && (
//             <Button onClick={startRecording} className="flex items-center gap-2">
//               <Mic className="h-5 w-5" /> 녹음 시작
//             </Button>
//           )}
//           {isRecording && (
//             <Button
//               onClick={stopRecording}
//               variant="destructive"
//               className="flex items-center gap-2"
//             >
//               <Square className="h-5 w-5" /> 녹음 중지
//             </Button>
//           )}
//           {audioUrls[currentIndex] && !isRecording && (
//             <div className="flex flex-col items-center gap-2 w-full">
//               <audio controls className="w-full mt-2" src={audioUrls[currentIndex]} />
//               <Button
//                 onClick={() => {
//                   setAudioUrls((prev) => ({ ...prev, [currentIndex]: undefined }))
//                   setRecordings((prev) => {
//                     const copy = { ...prev }
//                     delete copy[currentIndex]
//                     return copy
//                   })
//                 }}
//                 variant="outline"
//               >
//                 다시 녹음
//               </Button>
//             </div>
//           )}
//         </div>

//         <div className="flex justify-between mt-6">
//           <Button
//             onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
//             disabled={currentIndex === 0}
//             variant="secondary"
//           >
//             이전
//           </Button>
//           {currentIndex < questions.length - 1 && (
//             <Button
//               onClick={() => setCurrentIndex((i) => i + 1)}
//               disabled={!recordings[currentIndex]}
//             >
//               다음 <ArrowRight className="h-4 w-4 ml-1" />
//             </Button>
//           )}
//         </div>

//         {currentIndex === questions.length - 1 &&
//           Object.keys(recordings).length === questions.length && (
//             <div className="flex justify-center mt-10">
//               <Button
//                 onClick={uploadAllRecordings}
//                 disabled={isUploading}
//                 className="text-lg px-6 py-3"
//               >
//                 {isUploading ? (
//                   <>
//                     <Loader2 className="h-4 w-4 animate-spin mr-2" /> 업로드 중...
//                   </>
//                 ) : (
//                   "동화 만들기!"
//                 )}
//               </Button>
//             </div>
//           )}

//         {status && (
//           <p className="mt-4 text-green-600 font-semibold text-center">{status}</p>
//         )}
//       </div>
//     </main>
//   )
// }
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Mic, Square, ArrowRight, HelpCircle, Loader2 } from "lucide-react"
import HomeButton from "@/components/home-button"
import HelpDialog from "@/components/HelpDialog"

const questions = [
  "오늘 있었던 일 중에 가장 기억에 남는 일이 뭐야?",
  "그 일은 언제, 어디에서 있었어?",
  "그때 누구랑 같이 있었고, 어떤 일이 있었는지 이야기해 줄래?",
  "그 일 때문에 기분이 어땠어?",
  "그 일이 있고 나서 너는 어떤 생각이 들었어?",
]

// 말풍선 카드 컴포넌트
const SpeechBubbleCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      <Card className="relative bg-white border-2 border-gray-200 shadow-lg p-6 rounded-2xl">
        {children}
        {/* 말풍선 꼬리 */}
        <div className="absolute -bottom-4 left-8 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[20px] border-t-white"></div>
        <div className="absolute -bottom-5 left-7 w-0 h-0 border-l-[22px] border-l-transparent border-r-[22px] border-r-transparent border-t-[22px] border-t-gray-200"></div>
      </Card>
    </div>
  )
}

// 캐릭터 컴포넌트
const Character = () => {
  return (
    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
      <div className="text-3xl">🧚‍♀️</div>
    </div>
  )
}

export default function QuestionsPage() {
  const [helpDialogOpen, setHelpDialogOpen] = useState(false)
  const [helpTab, setHelpTab] = useState<1 | 2>(1)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [recordings, setRecordings] = useState<{ [index: number]: Blob }>({})
  const [audioUrls, setAudioUrls] = useState<{ [index: number]: string | undefined }>({})
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [status, setStatus] = useState("")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const router = useRouter()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mpeg" })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioUrls((prev) => ({ ...prev, [currentIndex]: audioUrl }))
        setRecordings((prev) => ({ ...prev, [currentIndex]: audioBlob }))
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("마이크 오류:", error)
      alert("마이크 권한을 확인해주세요.")
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const uploadAllRecordings = async () => {
    try {
      setIsUploading(true)
      const uploadedUrls: { [key: number]: string } = {}

      for (const [index, blob] of Object.entries(recordings)) {
        const formData = new FormData()
        formData.append("file", blob, `question_${index}.mp3`)

        const res = await fetch("/api/proxy-upload", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`(${index}) 업로드 실패: ${res.status} - ${errorText}`)
        }

        const data = await res.json()
        uploadedUrls[+index] = data.file_url
      }

      console.log("✅ 모든 녹음 업로드 완료:", uploadedUrls)
      setStatus("✅ 전체 업로드 성공!")
      router.push(`/loading?storyId=uploaded`)
    } catch (error) {
      console.error("❌ 업로드 오류:", error)
      alert(error instanceof Error ? error.message : "업로드 중 오류 발생")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 md:p-8 relative">
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

      <div className="w-full max-w-4xl mx-auto pt-20 relative">
        <h1 className="text-2xl font-bold mb-8 text-center">
          질문 {currentIndex + 1} / {questions.length}
        </h1>

        {/* 캐릭터와 말풍선 영역 */}
        <div className="relative mb-8">
          {/* 캐릭터 (왼쪽 아래) */}
          <div className="absolute bottom-0 left-4 z-10">
            <Character />
          </div>
          
          {/* 말풍선 (캐릭터 위쪽에서 오른쪽으로) */}
          <div className="ml-32 mb-8">
            <SpeechBubbleCard className="max-w-2xl">
              <p className="text-lg font-medium text-gray-800 leading-relaxed">
                {questions[currentIndex]}
              </p>
            </SpeechBubbleCard>
          </div>
        </div>

        {/* 녹음 컨트롤 */}
        <div className="flex flex-col items-center gap-4 mb-8">
          {!isRecording && !audioUrls[currentIndex] && (
            <Button onClick={startRecording} className="flex items-center gap-2 px-6 py-3 text-lg">
              <Mic className="h-5 w-5" /> 녹음 시작
            </Button>
          )}
          {isRecording && (
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="flex items-center gap-2 px-6 py-3 text-lg animate-pulse"
            >
              <Square className="h-5 w-5" /> 녹음 중지
            </Button>
          )}
          {audioUrls[currentIndex] && !isRecording && (
            <div className="flex flex-col items-center gap-4 w-full max-w-md">
              <audio controls className="w-full" src={audioUrls[currentIndex]} />
              <Button
                onClick={() => {
                  setAudioUrls((prev) => ({ ...prev, [currentIndex]: undefined }))
                  setRecordings((prev) => {
                    const copy = { ...prev }
                    delete copy[currentIndex]
                    return copy
                  })
                }}
                variant="outline"
              >
                다시 녹음
              </Button>
            </div>
          )}
        </div>

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
            disabled={currentIndex === 0}
            variant="secondary"
            className="px-6 py-2"
          >
            이전
          </Button>
          {currentIndex < questions.length - 1 && (
            <Button
              onClick={() => setCurrentIndex((i) => i + 1)}
              disabled={!recordings[currentIndex]}
              className="px-6 py-2"
            >
              다음 <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>

        {/* 동화 만들기 버튼 */}
        {currentIndex === questions.length - 1 &&
          Object.keys(recordings).length === questions.length && (
            <div className="flex justify-center mt-12">
              <Button
                onClick={uploadAllRecordings}
                disabled={isUploading}
                className="text-xl px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> 업로드 중...
                  </>
                ) : (
                  "✨ 동화 만들기! ✨"
                )}
              </Button>
            </div>
          )}

        {status && (
          <p className="mt-6 text-green-600 font-semibold text-center text-lg">{status}</p>
        )}
      </div>
    </main>
  )
}