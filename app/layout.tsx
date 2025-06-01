import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ThemeBackground from "@/components/theme-background"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI 동화책 생성기",
  description: "음성 녹음과 AI를 사용하여 맞춤형 동화책 생성하기",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          value={{
            light: "light",
            dark: "dark",
            alley: "alley",
            sky: "sky",
          }}
          defaultTheme="alley"
          enableSystem={false}
          storageKey="storybook-theme"
        >
          <ThemeBackground>{children}</ThemeBackground>
        </ThemeProvider>
      </body>
    </html>
  )
}
