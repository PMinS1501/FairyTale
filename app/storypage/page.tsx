// app/storypage/page.tsx
import StoryPageClient from "./StoryPageClient"

export default function StoryPage({ searchParams }: { searchParams: { s3Url?: string } }) {
  return <StoryPageClient s3Url={searchParams?.s3Url ?? null} />
}