"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Mic, Square, Play, ArrowRight, ArrowLeft, HelpCircle, Loader2 } from "lucide-react"
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
  "오늘 있었던 일 중에 가장 기억에 남는 일이 뭐야?",
  "그 일은 언제, 어디에서 있었어?",
  "그때 누구랑 같이 있었고, 어떤 일이 있었는지 이야기해 줄래?",
  "그 일 때문에 기분이 어땠어?",
  "그 일이 있고 나서 너는 어떤 생각이 들었어?",
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
  const [helpTab, setHelpTab] = useState<1 | 2>(1)
  const [isUploading, setIsUploading] = useState(false)
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // 화면 크기 감지 및 상태 업데이트
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        isMobile: window.innerWidth < 640,
        isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
      })
    }

    // 초기 로드 시 화면 크기 감지
    handleResize()

    // 화면 크기 변경 이벤트 리스너 등록
    window.addEventListener("resize", handleResize)
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])


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
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" })
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

  // 녹음 저장 코드 추가
 const uploadRecordings = async () => {
    try {
      setIsUploading(true)
      
    const uploadedUrls: { [key: number]: string } = {}

    for (const [index, blob] of Object.entries(recordings)) {
      if (blob) {
        const formData = new FormData()
        formData.append("file", blob, `question_${index}.mp3`)

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/mp3`, {
      method: "POST",
     body: formData,
    })
      
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`(${index}) 업로드 실패: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        console.log(`질문 ${index} 업로드 성공:`, data.file_url)
        uploadedUrls[+index] = data.file_url
      }
    }
      
      // 백엔드 응답에 따라 다음 페이지로 이동
      // 백엔드에서 반환하는 응답 구조에 맞게 수정 필요
    console.log("전체 업로드 완료:", uploadedUrls)

    // 예시로 첫 번째 URL을 storyId로 쓰거나, router 이동만 우선 처리
    router.push(`/loading?storyId=uploaded`) // 필요 시 uploadedUrls도 전달 가능
  } catch (error) {
    console.error("녹음 업로드 오류:", error)
    alert("녹음 파일 업로드 중 문제가 발생했습니다.")
  } finally {
    setIsUploading(false)
  }
}
      
      // 성공 시 다음 페이지로 이동
    //   router.push(`/loading?storyId=${data.storyId}`)
    // } catch (error) {
    //   console.error('녹음 업로드 오류:', error)
    //   alert('녹음 파일을 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.')
    // } finally {
    //   setIsUploading(false)
    // }


  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setAudioUrl(null)
    } else {
      // 모든 질문에 답변했으면 업로드 시작
      uploadRecordings()
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
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 md:p-8">
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
            <div className="flex gap-2 mb-2">
              <Button
              variant={helpTab === 1 ? "default" : "outline"}
              onClick={() => setHelpTab(1)}
              >녹음하는 법</Button>
              <Button
                variant={helpTab === 2 ? "default" : "outline"}
                onClick={() => setHelpTab(2)}
              >동화 재생하는 법</Button>
              </div>
              <AlertDialogDescription>
                {helpTab === 1 ? (
                  <p>각 질문에 대해 음성으로 답변해주세요. <br />
                  <strong>녹음 버튼</strong>을 누르고 말한 후 <strong>중지 버튼</strong>을 누르세요. <br />
                  모든 질문에 답변하면 AI가 동화를 생성합니다.</p> ) : ( <p>
                  재생 버튼을 누르면 동화의 <strong>음성과 이미지</strong>가 함께 나옵니다. <br />문장을 읽으며 동화를 감상하세요.</p>
                  )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setHelpDialogOpen(false)}>닫기</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
          
        <div className="w-full max-w-3xl mx-auto">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
            질문 {currentQuestionIndex + 1} / {questions.length}
          </h1>
          <Progress value={progress} className="h-2" />
        </div>

        {/* 반응형 레이아웃 - 모바일에서는 세로 배치, 태블릿과 데스크탑에서는 가로 배치 */}
        <div className={`${screenSize.isMobile ? 'flex flex-col gap-4' : 'grid grid-cols-12 gap-4'}`}>
          {/* 캐릭터 선택 영역 */}
          <div className={`${screenSize.isMobile ? 'flex justify-center' : 'col-span-2 flex flex-col items-center self-end mb-4'}`}>
            <div className="mb-2 bg-white/90 p-2 rounded-lg">
              <Image
                src={characters[selectedCharacter].image || "/placeholder.svg"}
                alt="캐릭터"
                width={screenSize.isMobile ? 60 : screenSize.isTablet ? 70 : 80}
                height={screenSize.isMobile ? 60 : screenSize.isTablet ? 70 : 80}
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

          {/* 질문 카드 영역 */}
          <div className={`${screenSize.isMobile ? '' : 'col-span-10'}`}>
            <Card className="p-4 sm:p-5 md:p-6 bg-white/90 backdrop-blur-sm">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 md:mb-8 text-center">
                {questions[currentQuestionIndex]}
              </h2>

              <div className="flex flex-col items-center gap-4">
                {!isRecording && !audioUrl && (
                  <Button onClick={startRecording} className="flex items-center gap-2 mx-auto">
                    <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                    녹음 시작
                  </Button>
                )}

                {isRecording && (
                  <Button onClick={stopRecording} variant="destructive" className="flex items-center gap-2 mx-auto">
                    <Square className="h-4 w-4 sm:h-5 sm:w-5" />
                    녹음 중지
                  </Button>
                )}

                {audioUrl && (
                  <div className="flex flex-col gap-2 items-center">
                    <Button onClick={playRecording} variant="outline" className="flex items-center gap-2">
                      <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                      녹음 재생
                    </Button>

                    <Button
                      onClick={() => {
                        setAudioUrl(null)
                      }}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                      다시 녹음
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex justify-between mt-4 sm:mt-6">
              <Button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                variant="outline"
                className="flex items-center gap-2 bg-white/80"
                size={screenSize.isMobile ? "sm" : "default"}
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                이전
              </Button>

              <Button
                onClick={handleNextQuestion}
                disabled={!recordings[currentQuestionIndex] || isUploading}
                className="flex items-center gap-2"
                size={screenSize.isMobile ? "sm" : "default"}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    {currentQuestionIndex < questions.length - 1 ? "다음" : "완료"}
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
