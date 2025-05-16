export async function POST(req: Request) {
  const formData = await req.formData()

  const backendUrl = process.env.BACKEND_URL  // ← 환경변수에서 백엔드 URL 불러오기
  if (!backendUrl) {
    return new Response("백엔드 URL이 설정되지 않았습니다 (.env.local BACKEND_URL)", { status: 500 })
  }

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
}
