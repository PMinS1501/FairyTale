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
          <h1 className="text-4xl font-bold mb-4">AI 동화책 생성기</h1>
          <p className="text-xl text-muted-foreground">목소리와 AI를 사용하여 맞춤형 동화책을 만들어보세요</p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button size="lg" className="h-16 text-lg" onClick={() => router.push("/questions")}>
            시작하기
          </Button>

          <Button size="lg" variant="outline" className="h-16 text-lg" onClick={() => router.push("/history")}>
            과거 이력
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
