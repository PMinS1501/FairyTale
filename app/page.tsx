// "use client"
// import { Button } from "@/components/ui/button"
// import { useRouter } from "next/navigation"
// import ThemeSwitcher from "@/components/theme-switcher"

// export default function Home() {
//   const router = useRouter()

//   return (
//     <main className="flex min-h-screen flex-col items-center justify-between p-8 transition-colors duration-300">
//       <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center min-h-screen">
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold mb-4">마법의 이야기</h1>
//           <p className="text-xl text-muted-foreground">오늘 하루 경험을 동화로 만들어 보세요!</p>
//         </div>

//         <div className="flex flex-col gap-4 w-full max-w-xs">
//           <Button size="lg" className="h-16 text-lg" onClick={() => router.push("/questions")}>
//             시작하기
//           </Button>
//           <Button size="lg" variant="outline" className="h-16 text-lg" onClick={() => router.push("/selection")}>
//             동화 목록
//           </Button>
//         </div>

//         <div className="mt-16 w-full">
//           <h2 className="text-xl font-semibold mb-4 text-center">테마 선택</h2>
//           <ThemeSwitcher />
//         </div>
//       </div>
//     </main>
//   )
// }
"use client"

import { useState, useRef } from "react"

export default function SimpleRecorderUploader() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
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

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioUrl(audioUrl)

        // 마이크 스트림 해제
        stream.getTracks().forEach((track) => track.stop())

        // === S3 업로드 ===
        const formData = new FormData()
        formData.append("file", audioBlob, "recording.mp3")

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/mp3`, {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`S3 업로드 실패: ${response.status} - ${errorText}`)
          }

          const data = await response.json()
          console.log("✅ 업로드 성공:", data.file_url)
          setUploadedUrl(data.file_url)
        } catch (err) {
          console.error("❌ S3 업로드 오류:", err)
          alert("업로드 중 오류 발생")
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error("마이크 오류:", err)
      alert("마이크 권한을 확인해주세요.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">녹음 & S3 업로드 테스트</h1>

      {!isRecording ? (
        <button onClick={startRecording} className="bg-blue-500 text-white px-4 py-2 rounded">
          녹음 시작
        </button>
      ) : (
        <button onClick={stopRecording} className="bg-red-500 text-white px-4 py-2 rounded">
          녹음 중지
        </button>
      )}

      {audioUrl && (
        <audio controls src={audioUrl} className="mt-4" />
      )}

      {uploadedUrl && (
        <p className="mt-4 text-green-600">✅ 업로드 성공: <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">{uploadedUrl}</a></p>
      )}
    </div>
  )
}
