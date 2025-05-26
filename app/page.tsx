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
// "use client"

// import { useEffect, useState } from "react"
// import { Button } from "@/components/ui/button"
// import { useRouter } from "next/navigation"
// import ThemeSwitcher from "@/components/theme-switcher"
// import "./globals.css"
// export default function Home() {
//   const router = useRouter()
//   const [responseText, setResponseText] = useState<string>("")

//   useEffect(() => {
//     const fetchBackend = async () => {
//       try {
//         const res = await fetch("/api/proxy-upload", {
//           method: "GET",
//         })
//         const text = await res.text()
//         console.log("✅ 백엔드 응답:", text)
//         setResponseText(text)
//       } catch (err) {
//         console.error("❌ 백엔드 요청 실패:", err)
//         setResponseText("요청 실패")
//       }
//     }

//     fetchBackend()
//   }, [])

//   return (
//     <main className="flex min-h-screen flex-col items-center justify-between p-8 transition-colors duration-300">
//       <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center min-h-screen">
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold mb-4">마법의 이야기</h1>
//           <p className="text-xl text-muted-foreground">오늘 하루 경험을 동화로 만들어 보세요!</p>
//         </div>

//         <div className="flex flex-col gap-4 w-full max-w-xs">
//           <Button size="lg" className="h-16 text-lg" onClick={() => router.push("/questions")}>시작하기</Button>
//           <Button size="lg" variant="outline" className="h-16 text-lg" onClick={() => router.push("/selection")}>동화 목록</Button>
//         </div>

//         <div className="mt-16 w-full text-center">
//           <h2 className="text-xl font-semibold mb-4">테마 선택</h2>
//           <ThemeSwitcher />
//           <p className="mt-6 text-gray-500">백엔드 응답 결과: {responseText}</p>
//         </div>
//       </div>

//     </main>
//   )
// }

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
          <Button size="lg" className="h-16 text-lg" onClick={() => router.push("/questions")}>시작하기</Button>
          <Button size="lg" variant="outline" className="h-16 text-lg" onClick={() => router.push("/selection")}>동화 목록</Button>
        </div>

        <div className="mt-16 w-full text-center">
          <h2 className="text-xl font-semibold mb-4">테마 선택</h2>
          <ThemeSwitcher />
        </div>

        <div className="mt-16 w-full text-center">
          <h2 className="text-xl font-semibold mb-4">동화 JSON 미리보기</h2>
          <object
            data="https://inha-capstone-07-jjang9-s3.s3.us-east-1.amazonaws.com/fairy_tale_url/fairy_tale_url_test1.json"
            type="application/json"
            width="100%"
            height="300px"
            style={{ border: "1px solid #ccc", borderRadius: "8px" }}
          >
            JSON 파일을 불러올 수 없습니다.{" "}
            <a
              href="https://inha-capstone-07-jjang9-s3.s3.us-east-1.amazonaws.com/fairy_tale_url/fairy_tale_url_test1.json"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              직접 보기
            </a>
          </object>
        </div>
      </div>
    </main>
  )
}
