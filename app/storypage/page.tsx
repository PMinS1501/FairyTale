// app/storypage/page.tsx
import StoryPageClient from "./StoryPageClient"

export default async function StoryPage({ searchParams }: { searchParams: { s3Url?: string } }) {
  const s3Url = searchParams?.s3Url ?? null
  return <StoryPageClient s3Url={s3Url} />
}