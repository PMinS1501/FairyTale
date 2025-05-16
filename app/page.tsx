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

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import ThemeSwitcher from "@/components/theme-switcher"

export default function Home() {
  const router = useRouter()

  // ✅ 환경변수로 백엔드 URL을 가져옴
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  useEffect(() => {
    fetch(`${backendUrl}/test`)
      .then((res) => res.text())
      .then((data) => {
        console.log("✅ 백엔드 응답:", data)
        alert("서버 응답: " + data)
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
