"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Mic, Square, HelpCircle, ArrowRight } from "lucide-react"
import HomeButton from "@/components/home-button"
import HelpDialog from "@/components/HelpDialog"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

const questions = [
  "오늘 있었던 일 중에 가장 기억에 남는 일이 뭐야?",
  "그때 누구랑 같이 있었고, 어떤 일이 있었는지 자세히 이야기해줄래?",
  "그 일 때문에 기분이 어땠어?",
  "그 일이 있고 나서 너는 어떤 생각이 들었어?",
]

const SpeechBubbleCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative ${className}`}>
    <Card className="relative bg-white border-2 border-white shadow-lg p-8 rounded-3xl">
      {children}
      <div className="absolute -bottom-6 left-16 w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-t-[30px] border-t-white"></div>
    </Card>
  </div>
)

const Character = () => {
  const { theme } = useTheme()
  const imageSrc = theme === "sky" ? "/jjangu2.jpeg" : "/jjangu.jpeg"

  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white overflow-hidden"
    >
      <img src={imageSrc} alt="짱구" className="w-full h-full object-cover" />
    </motion.div>
  )
}

export default function QuestionsPage() {
  const [helpDialogOpen, setHelpDialogOpen] = useState(false)
  const [helpTab, setHelpTab] = useState<1 | 2>(1)
  const [audioUrl, setAudioUrl] = useState<string | undefined>()
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const router = useRouter()
  const { theme } = useTheme()

  const question = questions[currentQuestionIndex]

  const getThemeButtonClass = () => {
    if (theme === "alley") return "bg-green-500 hover:bg-green-600 text-white"
    if (theme === "sky") return "bg-blue-400 hover:bg-blue-500 text-white"
    return "bg-gray-300 hover:bg-gray-400 text-black"
  }

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
        setRecordingBlob(audioBlob)
        setAudioUrl(URL.createObjectURL(audioBlob))
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      alert("마이크 권한을 확인해주세요.")
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const uploadAndGoNext = () => {
    if (!recordingBlob) {
      alert("녹음 먼저 완료해주세요.")
      return
    }

    router.push(`/loading?storyId=uploaded`)

    const formData = new FormData()
    formData.append("file", recordingBlob, `question_1.mp3`)

    fetch("/api/proxy-upload", {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`업로드 실패: ${res.status} - ${errorText}`)
        }
        const data = await res.json()
        console.log("✅ 업로드 완료:", data.file_url)
      })
      .catch((err) => {
        console.error("❌ 업로드 실패:", err)
      })
  }

  return (
    <motion.main
      className="flex min-h-screen flex-col items-center p-4 sm:p-6 md:p-8 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <HomeButton />
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 left-16 z-10"
        onClick={() => setHelpDialogOpen(true)}
      >
        <HelpCircle className="h-5 w-5" />
      </Button>
      <HelpDialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen} helpTab={helpTab} setHelpTab={setHelpTab} />

      <div className="w-full max-w-4xl mx-auto pt-20 relative">
        <h1 className={`text-2xl font-bold mb-8 text-center ${theme === "alley" ? "text-lime-400" : "text-black"}`}>
          질문
        </h1>

        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <SpeechBubbleCard className="w-full max-w-4xl">
              <p className="text-xl font-medium text-gray-800 leading-relaxed text-center py-4">{question}</p>
            </SpeechBubbleCard>
          </div>

          <div className="flex justify-start px-8 mb-6">
            <div className="flex-shrink-0">
              <Character />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 mb-8">
          {!isRecording && !audioUrl && (
            <Button onClick={startRecording} className="flex items-center gap-2 px-6 py-3 text-lg">
              <Mic className="h-5 w-5" /> 녹음 시작
            </Button>
          )}
          {isRecording && (
            <div className="flex flex-col items-center gap-4">
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="flex items-center gap-2 px-6 py-3 text-lg animate-pulse"
              >
                <Square className="h-5 w-5" /> 녹음 중지
              </Button>

              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                  className="flex items-center gap-2 text-lg"
                >
                  <ArrowRight className="h-5 w-5 rotate-180" /> 이전 질문
                </Button>

                <Button
                  onClick={nextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="flex items-center gap-2 text-lg"
                  >
                  <ArrowRight className="h-5 w-5" /> 다음 질문
                </Button>
              </div>
            </div>
          )}
          {audioUrl && !isRecording && (
            <div className="flex flex-col items-center gap-4 w-full max-w-md">
              <audio controls className="w-full" src={audioUrl} />
              <Button
                onClick={() => {
                  setAudioUrl(undefined)
                  setRecordingBlob(null)
                  setCurrentQuestionIndex(0)
                }}
                variant="outline"
              >
                다시 녹음하기!
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-4 mt-12">
          <Button
            onClick={uploadAndGoNext}
            className={`text-xl px-8 py-4 font-bold rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 ${getThemeButtonClass()}`}
            disabled={!audioUrl}
          >
            동화 만들기!
          </Button>
        </div>
      </div>
    </motion.main>
  )
}
