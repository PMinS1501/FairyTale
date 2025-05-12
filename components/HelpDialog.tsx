"use client"

import { useState } from "react"

export default function HelpDialog({ initialTab }: { initialTab: 1 | 2 }) {
  const [selected, setSelected] = useState<1 | 2>(initialTab)

  return (
    <div className="fixed top-10 right-10 bg-white shadow-lg border p-4 rounded w-[300px] z-50">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setSelected(1)} className={selected === 1 ? "font-bold" : ""}>
          1. 녹음하는 법
        </button>
        <button onClick={() => setSelected(2)} className={selected === 2 ? "font-bold" : ""}>
          2. 동화 재생하는 법
        </button>
      </div>
      <div className="text-sm">
        {selected === 1 ? (
          <p>
            마이크 버튼을 누르고 음성을 녹음하세요. 녹음이 끝나면 자동으로 질문이 생성됩니다.
          </p>
        ) : (
          <p>
            재생 버튼을 누르면 동화의 음성과 이미지가 함께 재생됩니다. 문장을 따라 읽으며 감상해보세요.
          </p>
        )}
      </div>
    </div>
  )
}
