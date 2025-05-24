export async function GET(req: Request) {
  const backendUrl = process.env.BACKEND_URL
  if (!backendUrl) {
    return new Response("백엔드 URL이 설정되지 않았습니다 (.env.local BACKEND_URL)", { status: 500 })
  }

  const { searchParams } = new URL(req.url)
  const path = searchParams.get("path") || ""
  const id = searchParams.get("id")

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
    console.error("백엔드 연결 실패:", err)
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
