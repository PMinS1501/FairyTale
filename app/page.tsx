"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import ThemeSwitcher from "@/components/theme-switcher"

export default function Home() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 transition-colors duration-300">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center min-h-screen">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">마법의 이야기</h1>
          <p className="text-xl text-muted-foreground">오늘 하루 경험을 동화로 만들어 보세요!</p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button size="lg" className="h-16 text-lg" onClick={() => router.push("/questions")}>
            시작하기
          </Button>
          <Button size="lg" variant="outline" className="h-16 text-lg" onClick={() => router.push("/selection")}>
            동화 목록
          </Button>
        </div>

        <div className="mt-16 w-full">
          <h2 className="text-xl font-semibold mb-4 text-center">테마 선택</h2>
          <ThemeSwitcher />
        </div>
      </div>
    </main>
  )
}
// // "use client"

// // import { useEffect, useState } from "react"
// // import { Button } from "@/components/ui/button"
// // import { useRouter } from "next/navigation"
// // import ThemeSwitcher from "@/components/theme-switcher"

// // export default function Home() {
// //   const router = useRouter()
// //   const [responseText, setResponseText] = useState<string>("")

// //   useEffect(() => {
// //     const fetchBackend = async () => {
// //       try {
// //         const res = await fetch("/api/proxy-upload", {
// //           method: "GET",
// //         })
// //         const text = await res.text()
// //         console.log("✅ 백엔드 응답:", text)
// //         setResponseText(text)
// //       } catch (err) {
// //         console.error("❌ 백엔드 요청 실패:", err)
// //         setResponseText("요청 실패")
// //       }
// //     }

// //     fetchBackend()
// //   }, [])

// //   return (
// //     <main className="flex min-h-screen flex-col items-center justify-between p-8 transition-colors duration-300">
// //       <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center min-h-screen">
// //         <div className="text-center mb-12">
// //           <h1 className="text-4xl font-bold mb-4">마법의 이야기</h1>
// //           <p className="text-xl text-muted-foreground">오늘 하루 경험을 동화로 만들어 보세요!</p>
// //         </div>

// //         <div className="flex flex-col gap-4 w-full max-w-xs">
// //           <Button size="lg" className="h-16 text-lg" onClick={() => router.push("/questions")}>시작하기</Button>
// //           <Button size="lg" variant="outline" className="h-16 text-lg" onClick={() => router.push("/selection")}>동화 목록</Button>
// //         </div>

// //         <div className="mt-16 w-full text-center">
// //           <h2 className="text-xl font-semibold mb-4">테마 선택</h2>
// //           <ThemeSwitcher />
// //           <p className="mt-6 text-gray-500">백엔드 응답 결과: {responseText}</p>
// //         </div>
// //       </div>
// //     </main>
// //   )
// // }
// "use client"

// import { useState, useRef } from "react"
// import { Button } from "@/components/ui/button"
// import { useRouter } from "next/navigation"
// import ThemeSwitcher from "@/components/theme-switcher"

// export default function Home() {
//   const router = useRouter()

//   const [isRecording, setIsRecording] = useState(false)
//   const [audioUrl, setAudioUrl] = useState<string | null>(null)
//   const [s3Url, setS3Url] = useState<string | null>(null)
//   const [status, setStatus] = useState("대기 중")

//   const mediaRecorderRef = useRef<MediaRecorder | null>(null)
//   const audioChunksRef = useRef<Blob[]>([])

//   const startRecording = async () => {
//     setStatus("🎙️ 녹음 중...")
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
//     const recorder = new MediaRecorder(stream)
//     mediaRecorderRef.current = recorder
//     audioChunksRef.current = []

//     recorder.ondataavailable = (event) => {
//       if (event.data.size > 0) {
//         audioChunksRef.current.push(event.data)
//       }
//     }

//     recorder.onstop = () => {
//       const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mpeg" })
//       const url = URL.createObjectURL(audioBlob)
//       setAudioUrl(url)
//       setStatus("✅ 녹음 완료")
//     }

//     recorder.start()
//     setIsRecording(true)
//   }

//   const stopRecording = () => {
//     mediaRecorderRef.current?.stop()
//     setIsRecording(false)
//   }

//   const uploadRecording = async () => {
//     if (!audioChunksRef.current.length) {
//       alert("녹음된 오디오가 없습니다.")
//       return
//     }

//     setStatus("📤 업로드 중...")

//     const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mpeg" })
//     const formData = new FormData()
//     formData.append("file", new File([audioBlob], `recording-${Date.now()}.mp3`, { type: "audio/mpeg" }))

//     try {
//       const res = await fetch("/api/proxy-upload", {
//         method: "POST",
//         body: formData,
//       })

//       if (!res.ok) {
//         const errorText = await res.text()
//         throw new Error(`업로드 실패: ${res.status} - ${errorText}`)
//       }

//       const data = await res.json()
//       setS3Url(data.file_url)
//       setStatus("✅ 업로드 성공!")
//     } catch (err: any) {
//       console.error(err)
//       setStatus("❌ 업로드 실패: " + err.message)
//     }
//   }

//   return (
//     <main className="flex min-h-screen flex-col items-center justify-between p-8 transition-colors duration-300">
//       <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center min-h-screen">
//         <h1 className="text-4xl font-bold mb-4">마법의 이야기</h1>
//         <p className="text-xl text-muted-foreground mb-8">오늘 하루 경험을 동화로 만들어 보세요!</p>

//         <div className="flex gap-4 mb-4">
//           {!isRecording && (
//             <Button onClick={startRecording}>🎤 녹음 시작</Button>
//           )}
//           {isRecording && (
//             <Button onClick={stopRecording} variant="destructive">⏹️ 녹음 중지</Button>
//           )}
//           <Button onClick={uploadRecording} disabled={!audioUrl}>📤 업로드</Button>
//         </div>

//         {audioUrl && (
//           <audio controls className="w-full my-4">
//             <source src={audioUrl} type="audio/mpeg" />
//           </audio>
//         )}

//         {s3Url && (
//           <div className="mt-4 text-center">
//             <p className="text-green-600 font-semibold">✅ 업로드된 S3 URL:</p>
//             <a href={s3Url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline break-all">
//               {s3Url}
//             </a>
//           </div>
//         )}

//         <p className="mt-6 text-gray-500">{status}</p>

//         <div className="mt-16 w-full text-center">
//           <h2 className="text-xl font-semibold mb-4">테마 선택</h2>
//           <ThemeSwitcher />
//         </div>
//       </div>
//     </main>
//   )
// }
