"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Mic, Square, Play, ArrowRight, ArrowLeft, HelpCircle } from "lucide-react"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import HomeButton from "@/components/home-button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

const questions = [
  "가장 좋아하는 동물은 무엇인가요?",
  "가장 좋아하는 장소는 어디인가요?",
  "가장 좋아하는 캐릭터는 누구인가요?",
  "어떤 모험을 떠나고 싶나요?",
  "이야기에서 어떤 교훈을 배우고 싶나요?",
]

const characters = [
  { id: 1, name: "여우 루나", image: "/placeholder.svg?height=200&width=200" },
  { id: 2, name: "곰 맥스", image: "/placeholder.svg?height=200&width=200" },
  { id: 3, name: "토끼 조이", image: "/placeholder.svg?height=200&width=200" },
]

export default function QuestionsPage() {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [recordings, setRecordings] = useState<{ [key: number]: Blob | null }>({})
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState(0)
  const [helpDialogOpen, setHelpDialogOpen] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

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
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioUrl(audioUrl)
        setRecordings({ ...recordings, [currentQuestionIndex]: audioBlob })

        // Stop all tracks on the stream to release the microphone
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("마이크 접근 오류. 권한을 허용했는지 확인해주세요.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play()
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setAudioUrl(null)
    } else {
      // All questions answered, navigate to loading page
      router.push("/loading")
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      // If we have a recording for this question, set the audio URL
      if (recordings[currentQuestionIndex - 1]) {
        setAudioUrl(URL.createObjectURL(recordings[currentQuestionIndex - 1]!))
      } else {
        setAudioUrl(null)
      }
    }
  }

  const cycleCharacter = () => {
    setSelectedCharacter((prev) => (prev + 1) % characters.length)
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

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

      <AlertDialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>도움말</AlertDialogTitle>
            <AlertDialogDescription>
              각 질문에 대해 음성으로 답변해주세요. 녹음 버튼을 누르고 답변을 말한 후 중지 버튼을 누르세요. 모든 질문에
              답변하면 AI가 맞춤형 동화책을 생성합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="w-full max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            질문 {currentQuestionIndex + 1} / {questions.length}
          </h1>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* 캐릭터를 왼쪽에 배치 (2칸) */}
          <div className="col-span-2 flex flex-col items-center self-end mb-4">
            <div className="mb-2 bg-white/90 p-2 rounded-lg">
              <Image
                src={characters[selectedCharacter].image || "/placeholder.svg"}
                alt="캐릭터"
                width={80}
                height={80}
                className="rounded-lg"
              />
            </div>
            <Button
              onClick={cycleCharacter}
              variant="outline"
              className="bg-white/80 text-xs py-1 px-2 h-auto w-full"
              size="sm"
            >
              캐릭터 변경
            </Button>
          </div>

          {/* 질문 카드를 오른쪽에 배치 (10칸) */}
          <div className="col-span-10">
            <Card className="p-6 bg-white/90 backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-8 text-center">{questions[currentQuestionIndex]}</h2>

              <div className="flex flex-col items-center gap-4">
                {!isRecording && !audioUrl && (
                  <Button onClick={startRecording} className="flex items-center gap-2 mx-auto">
                    <Mic className="h-5 w-5" />
                    녹음 시작
                  </Button>
                )}

                {isRecording && (
                  <Button onClick={stopRecording} variant="destructive" className="flex items-center gap-2 mx-auto">
                    <Square className="h-5 w-5" />
                    녹음 중지
                  </Button>
                )}

                {audioUrl && (
                  <div className="flex flex-col gap-2 items-center">
                    <Button onClick={playRecording} variant="outline" className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      녹음 재생
                    </Button>

                    <Button
                      onClick={() => {
                        setAudioUrl(null)
                      }}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Mic className="h-5 w-5" />
                      다시 녹음
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex justify-between mt-6">
              <Button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                variant="outline"
                className="flex items-center gap-2 bg-white/80"
              >
                <ArrowLeft className="h-5 w-5" />
                이전
              </Button>

              <Button
                onClick={handleNextQuestion}
                disabled={!recordings[currentQuestionIndex]}
                className="flex items-center gap-2"
              >
                {currentQuestionIndex < questions.length - 1 ? "다음" : "완료"}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
