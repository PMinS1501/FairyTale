// app/loading/page.tsx
import { Suspense } from "react"
import LoadingClient from "./LoadingClient"

export default function LoadingPage() {
  return (
    <Suspense fallback={<p className="text-center">로딩 중입니다...</p>}>
      <LoadingClient />
    </Suspense>
  )
}

