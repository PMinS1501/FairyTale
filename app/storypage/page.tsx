// app/storypage/page.tsx
import dynamic from "next/dynamic"

const StoryPageClient = dynamic(() => import("./StoryPageClient"), {
  ssr: false,
})

export default function StoryPage() {
  return <StoryPageClient />
}