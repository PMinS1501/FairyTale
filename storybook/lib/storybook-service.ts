// This is a mock service that would be replaced with actual AI integration
// It simulates the generation of storybooks based on user inputs

export interface StoryPage {
  image: string
  text: string
}

export interface Storybook {
  id: string
  title: string
  keywords: string[]
  summary: string
  pages: StoryPage[]
}

// Mock function to simulate keyword extraction from voice recordings
export async function extractKeywords(recordings: Blob[]): Promise<string[]> {
  // In a real implementation, this would send the recordings to an AI service
  // and get back extracted keywords

  // For demo purposes, return random keywords
  const allKeywords = [
    "adventure",
    "friendship",
    "courage",
    "learning",
    "discovery",
    "imagination",
    "teamwork",
    "perseverance",
    "kindness",
    "creativity",
    "nature",
    "magic",
  ]

  // Randomly select 3-5 keywords
  const count = Math.floor(Math.random() * 3) + 3
  const selectedKeywords: string[] = []

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * allKeywords.length)
    const keyword = allKeywords[randomIndex]

    if (!selectedKeywords.includes(keyword)) {
      selectedKeywords.push(keyword)
    }
  }

  return selectedKeywords
}

// Mock function to simulate generating storybooks based on recordings and character
export async function generateStorybooks(
  recordings: Blob[],
  character: string,
  keywords: string[],
): Promise<Storybook[]> {
  // In a real implementation, this would send the recordings, character choice,
  // and extracted keywords to an AI service to generate storybooks

  // For demo purposes, return mock storybooks
  const storybooks: Storybook[] = []

  // Generate 2-3 storybooks
  const count = Math.floor(Math.random() * 2) + 2

  for (let i = 0; i < count; i++) {
    const id = `generated-${Date.now()}-${i}`
    const storybook = createMockStorybook(id, character, keywords, i)
    storybooks.push(storybook)
  }

  return storybooks
}

// Helper function to create mock storybooks
function createMockStorybook(id: string, character: string, keywords: string[], variant: number): Storybook {
  const titles = [
    "The Magical Adventure",
    "Journey to the Unknown",
    "The Great Discovery",
    "A Tale of Courage",
    "The Friendship Quest",
  ]

  // Select a subset of keywords for this storybook
  const bookKeywords = keywords.slice(0, 3)

  // Create a title based on the character and keywords
  const title = `${titles[variant % titles.length]}: ${character}'s ${bookKeywords[0]} Story`

  // Create a summary
  const summary = `Join ${character} on an exciting journey where they discover the importance of ${bookKeywords.join(", ")} and more!`

  // Create 6 pages for the storybook
  const pages: StoryPage[] = []

  for (let i = 0; i < 6; i++) {
    pages.push({
      image: `/placeholder.svg?height=300&width=500&text=Page ${i + 1}`,
      text: createPageText(character, i, bookKeywords),
    })
  }

  return {
    id,
    title,
    keywords: bookKeywords,
    summary,
    pages,
  }
}

// Helper function to create page text
function createPageText(character: string, pageIndex: number, keywords: string[]): string {
  const pageTexts = [
    `Once upon a time, there was a character named ${character} who lived in a small village.`,
    `${character} had always dreamed of going on an adventure to discover the meaning of ${keywords[0]}.`,
    `One day, a mysterious visitor arrived and told ${character} about a hidden treasure.`,
    `${character} set off on a journey, facing many challenges that tested their ${keywords[1]}.`,
    `Along the way, ${character} made new friends who taught them the value of ${keywords[2]}.`,
    `In the end, ${character} realized that the real treasure was the lessons learned about ${keywords.join(", ")} during the journey.`,
  ]

  return pageTexts[pageIndex % pageTexts.length]
}
