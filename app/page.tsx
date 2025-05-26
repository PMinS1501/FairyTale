"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import ThemeSwitcher from "@/components/theme-switcher"
import "./globals.css"

export default function Home() {
  const router = useRouter()
  const [responseText, setResponseText] = useState<string>("")
  const [s3Data, setS3Data] = useState<any>(null)
  const [s3Error, setS3Error] = useState<string>("")

  useEffect(() => {
    const fetchBackend = async () => {
      try {
        const res = await fetch("/api/proxy-upload", { method: "GET" })
        const text = await res.text()
        console.log("✅ 백엔드 응답:", text)
        setResponseText(text)
      } catch (err) {
        console.error("❌ 백엔드 요청 실패:", err)
        setResponseText("요청 실패")
      }
    }

    const fetchS3Data = async () => {
      try {
        const res = await fetch("/api/proxy-upload?s3=true")
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const jsonData = await res.json()
        console.log("✅ S3 JSON 데이터:", jsonData)
        setS3Data(jsonData)
        setResponseText(JSON.stringify(jsonData, null, 2))
      } catch (err) {
        console.error("❌ S3 데이터 요청 실패:", err)
        setS3Error("S3 데이터 로드 실패")
      }
    }

    fetchBackend()
    fetchS3Data()
  }, [])

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

          <div className="mt-6 space-y-4">
            <p className="text-gray-500">백엔드 응답 결과: {responseText}</p>

            <div className="text-gray-500 text-left text-sm">
              <p className="font-medium mb-2">S3 JSON 데이터:</p>
              {s3Error ? (
                <p className="text-red-500">{s3Error}</p>
              ) : s3Data && Array.isArray(s3Data.items) ? (
                <div className="space-y-4">
                  {s3Data.items.map((item: any, index: number) => (
                    <div key={index}>
                      <p>🖼 image_url: {item.image_url}</p>
                      <p>🔊 voice_url: {item.voice_url}</p>
                      <p>📄 text_url: {item.text_url}</p>
                      <br />
                    </div>
                  ))}
                </div>
              ) : (
                <p>로딩 중...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
