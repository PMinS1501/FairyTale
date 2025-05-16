// // "use client"
// // import { Button } from "@/components/ui/button"
// // import { useRouter } from "next/navigation"
// // import ThemeSwitcher from "@/components/theme-switcher"

// // export default function Home() {
// //   const router = useRouter()

// //   return (
// //     <main className="flex min-h-screen flex-col items-center justify-between p-8 transition-colors duration-300">
// //       <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center min-h-screen">
// //         <div className="text-center mb-12">
// //           <h1 className="text-4xl font-bold mb-4">마법의 이야기</h1>
// //           <p className="text-xl text-muted-foreground">오늘 하루 경험을 동화로 만들어 보세요!</p>
// //         </div>

// //         <div className="flex flex-col gap-4 w-full max-w-xs">
// //           <Button size="lg" className="h-16 text-lg" onClick={() => router.push("/questions")}>
// //             시작하기
// //           </Button>
// //           <Button size="lg" variant="outline" className="h-16 text-lg" onClick={() => router.push("/selection")}>
// //             동화 목록
// //           </Button>
// //         </div>

// //         <div className="mt-16 w-full">
// //           <h2 className="text-xl font-semibold mb-4 text-center">테마 선택</h2>
// //           <ThemeSwitcher />
// //         </div>
// //       </div>
// //     </main>
// //   )
// // }

"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import ThemeSwitcher from "@/components/theme-switcher"

export default function Home() {
  const router = useRouter()
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  useEffect(() => {
    // GET 요청 보내서 응답 확인
    fetch(`${backendUrl}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ 백엔드 응답:", data)
        alert("서버 응답: " + data.response)  // "test" 라고 떠야 정상
      })
      .catch((err) => {
        console.error("❌ 요청 실패:", err)
        alert("요청 실패! 콘솔 확인")
      })
  }, [backendUrl])

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

// "use client"

// import { useRef } from "react"
// import { Button } from "@/components/ui/button"

// export default function UploadTest() {
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   const handleUpload = async () => {
//     const file = fileInputRef.current?.files?.[0]
//     if (!file) {
//       alert("파일을 선택해주세요.")
//       return
//     }

//     const formData = new FormData()
//     formData.append("file", file, file.name)

//     try {
//       const response = await fetch("http://174.129.219.18:8000/upload/mp3", {
//         method: "POST",
//         body: formData,
//       })

//       if (!response.ok) {
//         const errText = await response.text()
//         throw new Error(`업로드 실패: ${response.status} - ${errText}`)
//       }

//       const data = await response.json()
//       console.log("✅ 업로드 성공:", data)
//       alert("업로드 성공: " + data.file_url)
//     } catch (err) {
//       console.error("❌ 업로드 에러:", err)
//       alert("업로드 실패! 콘솔 확인")
//     }
//   }

//   return (
//     <div className="p-6 space-y-4">
//       <input type="file" accept="audio/mp3" ref={fileInputRef} />
//       <Button onClick={handleUpload}>업로드</Button>
//     </div>
//   )
// }
