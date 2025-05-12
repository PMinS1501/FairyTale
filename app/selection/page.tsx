// selection/page.tsx
import { Suspense } from "react"
import SelectionContent from "./SelectionContent"

export default function Page() {
  return (
    <Suspense fallback={<p className="text-center">로딩 중입니다...</p>}>
      <SelectionContent />
    </Suspense>
  )
}
