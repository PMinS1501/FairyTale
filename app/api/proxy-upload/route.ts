import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const s3Url = searchParams.get("s3Url")
  const path = searchParams.get("path")
  const id = searchParams.get("id")
  const backendUrl = process.env.BACKEND_URL

  // ✅ S3 직접 요청 (개별 동화 JSON 불러오기)
  if (s3Url) {
    try {
      const res = await fetch(s3Url)
      if (!res.ok) throw new Error("S3 응답 오류")
      const data = await res.json()
      return NextResponse.json(data)
    } catch (err) {
      console.error("❌ S3 JSON 로드 실패:", err)
      return new Response("S3 URL JSON 불러오기 실패", { status: 500 })
    }
  }

  // ✅ 백엔드 프록시 요청 (예: 동화 목록 조회)
  if (!backendUrl || !path) {
    return new Response("백엔드 URL 또는 path 누락", { status: 400 })
  }

  const fullUrl = id
    ? `${backendUrl}/${path}?id=${id}`
    : `${backendUrl}/${path}`

  try {
    const res = await fetch(fullUrl, { method: "GET" })
    const text = await res.text()

    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "text/plain",
      },
    })
  } catch (err) {
    console.error("❌ 백엔드 연결 실패:", err)
    return new Response("백엔드에 연결할 수 없습니다.", { status: 502 })
  }
}

export async function POST(req: Request) {
  const formData = await req.formData()

  const backendUrl = process.env.BACKEND_URL
  if (!backendUrl) {
    return new Response("백엔드 URL이 설정되지 않았습니다 (.env.local BACKEND_URL)", { status: 500 })
  }

  try {
    const backendResponse = await fetch(`${backendUrl}/upload/mp3`, {
      method: "POST",
      body: formData,
    })

    const text = await backendResponse.text()

    try {
      const json = JSON.parse(text)
      return new Response(JSON.stringify(json), {
        status: backendResponse.status,
        headers: { "Content-Type": "application/json" },
      })
    } catch {
      return new Response(text, { status: backendResponse.status })
    }
  } catch (err) {
    console.error("❌ 업로드 요청 실패:", err)
    return new Response("파일 업로드 중 오류가 발생했습니다.", { status: 502 })
  }
}
