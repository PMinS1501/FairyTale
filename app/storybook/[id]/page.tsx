// // "use client"

// // import { useEffect, useRef, useState } from "react"
// // import { Button } from "@/components/ui/button"
// // import Image from "next/image"
// // import { Pause, Play, SkipBack, SkipForward } from "lucide-react"
// // import HomeButton from "@/components/home-button"

// // export default function StoryPage({ params }: { params: { id: string } }) {
// // //  const [pages, setPages] = useState([])
// //   type Sentence = {
// //     sentence_id : number
// //     text : string
// //     audio_url : string
// //   }

// //   type Page = {
// //     image_url : string
// //     sentences : Sentence[]
// //   }
// //   const [pages, setPages] = useState<Page[]>([])
// //   const [currentPage, setCurrentPage] = useState(0)
// //   const [currentSentence, setCurrentSentence] = useState(0)
// //   const [isPlaying, setIsPlaying] = useState(false)
// //   const audioRef = useRef<HTMLAudioElement>(null)

// //   useEffect(() => {
// //     fetch(`/api/stories/${params.id}`)
// //       .then(res => res.json())
// //       .then(data => {
// //         setPages(data.pages)
// //       })
// //   }, [params.id])

// //   // 문장 재생이 끝나면 다음 문장/페이지로 전환
// //   useEffect(() => {
// //     const audio = audioRef.current
// //     if (!audio) return

// //     if (isPlaying) {
// //       audio.play()
// //     }

// //     const handleEnded = () => {
// //       const sentenceList = pages[currentPage]?.sentences || []
// //       if (currentSentence < sentenceList.length - 1) {
// //         setCurrentSentence(prev => prev + 1)
// //       } else if (currentPage < pages.length - 1) {
// //         setCurrentPage(prev => prev + 1)
// //         setCurrentSentence(0)
// //       } else {
// //         setIsPlaying(false) // 마지막 문장
// //       }
// //     }

// //     audio.addEventListener("ended", handleEnded)
// //     return () => audio.removeEventListener("ended", handleEnded)
// //   }, [isPlaying, currentPage, currentSentence, pages])

// //   const togglePlay = () => {
// //     setIsPlaying(prev => !prev)
// //   }

// //   const goToPrev = () => {
// //     if (currentSentence > 0) {
// //       setCurrentSentence(prev => prev - 1)
// //     } else if (currentPage > 0) {
// //       setCurrentPage(prev => prev - 1)
// //       setCurrentSentence(pages[currentPage - 1].sentences.length - 1)
// //     }
// //   }

// //   const goToNext = () => {
// //     const sentenceList = pages[currentPage]?.sentences || []
// //     if (currentSentence < sentenceList.length - 1) {
// //       setCurrentSentence(prev => prev + 1)
// //     } else if (currentPage < pages.length - 1) {
// //       setCurrentPage(prev => prev + 1)
// //       setCurrentSentence(0)
// //     }
// //   }

// //   if (pages.length === 0) return <div>불러오는 중...</div>

// //   const current = pages[currentPage]
// //   const sentence = current.sentences[currentSentence]

// //   return (
// //     <main className="p-6 flex flex-col items-center">
// //       <HomeButton />
// //       <div className="max-w-3xl w-full bg-white/80 p-6 rounded-lg shadow-md">
// //         <Image
// //           src={current.image_url}
// //           alt={`페이지 이미지 ${currentPage + 1}`}
// //           width={500}
// //           height={300}
// //           className="mx-auto mb-4 rounded"
// //         />

// //         <p className="text-lg text-center mb-4">{sentence.text}</p>
// //         <audio ref={audioRef} src={sentence.audio_url} preload="auto" />

// //         <div className="flex justify-center gap-4 mt-4">
// //           <Button onClick={goToPrev} variant="outline" size="icon">
// //             <SkipBack className="w-5 h-5" />
// //           </Button>
// //           <Button onClick={togglePlay} variant="outline" size="icon">
// //             {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
// //           </Button>
// //           <Button onClick={goToNext} variant="outline" size="icon">
// //             <SkipForward className="w-5 h-5" />
// //           </Button>
// //         </div>

// //         <div className="mt-4 text-center text-muted-foreground">
// //           페이지 {currentPage + 1} / {pages.length}, 문장 {currentSentence + 1} / {current.sentences.length}
// //         </div>
// //       </div>
// //     </main>
// //   )
// // }
// "use client"

// import { useEffect, useRef, useState } from "react"
// import { Button } from "@/components/ui/button"
// import Image from "next/image"
// import { Pause, Play, SkipBack, SkipForward, ChevronLeft, ChevronRight } from "lucide-react"
// import HomeButton from "@/components/home-button"

// export default function StoryPage({ params }: { params: { id: string } }) {
//   type Sentence = { sentence_id: number; text: string; audio_url: string }
//   type Page = { image_url: string; sentences: Sentence[] }

//   const [pages, setPages] = useState<Page[]>([])
//   const [currentPage, setCurrentPage] = useState(0)
//   const [currentSentence, setCurrentSentence] = useState(0)
//   const [isPlaying, setIsPlaying] = useState(false)
//   const [currentTime, setCurrentTime] = useState(0)
//   const [duration, setDuration] = useState(0)
//   const audioRef = useRef<HTMLAudioElement>(null)

//   useEffect(() => {
//     fetch(`/api/stories/${params.id}`)
//       .then((res) => res.json())
//       .then((data) => setPages(data.pages))
//   }, [params.id])

//   useEffect(() => {
//     const audio = audioRef.current
//     if (!audio) return

//     if (isPlaying) audio.play()
//     else audio.pause()

//     const updateTime = () => setCurrentTime(audio.currentTime)
//     const setMeta = () => setDuration(audio.duration)

//     audio.addEventListener("timeupdate", updateTime)
//     audio.addEventListener("loadedmetadata", setMeta)

//     return () => {
//       audio.removeEventListener("timeupdate", updateTime)
//       audio.removeEventListener("loadedmetadata", setMeta)
//     }
//   }, [isPlaying, currentPage, currentSentence])

//   const togglePlay = () => setIsPlaying((prev) => !prev)

//   const goToPage = (index: number) => {
//     if (index >= 0 && index < pages.length) {
//       setCurrentPage(index)
//       setCurrentSentence(0)
//       setCurrentTime(0)
//       setIsPlaying(true)
//     }
//   }

//   if (pages.length === 0) return <div>불러오는 중...</div>

//   const page = pages[currentPage]
//   const sentence = page.sentences[currentSentence]

//   return (
//     <main className="p-6 flex flex-col items-center">
//       <HomeButton />
//       <div className="max-w-3xl w-full bg-white/90 p-6 rounded-lg shadow-md transition-transform duration-700">
//         {/* 이미지와 페이지 전환 효과 */}
//         <div className="relative w-full h-64 perspective overflow-hidden">
//           <Image
//             key={currentPage}
//             src={page.image_url}
//             alt={`페이지 ${currentPage + 1}`}
//             width={600}
//             height={300}
//             className="mx-auto rounded transition-transform duration-700 transform-gpu"
//           />
//         </div>

//         {/* 자막 */}
//         <p className="text-xl text-center mt-6">{sentence.text}</p>

//         {/* 오디오 재생 컨트롤 */}
//         <audio ref={audioRef} src={sentence.audio_url} preload="auto" />

//         {/* 재생바 */}
//         <div className="flex flex-col items-center mt-4">
//           <input
//             type="range"
//             value={currentTime}
//             max={duration}
//             step="0.1"
//             onChange={(e) => {
//               const newTime = parseFloat(e.target.value)
//               audioRef.current!.currentTime = newTime
//               setCurrentTime(newTime)
//             }}
//             className="w-full"
//           />
//           <div className="text-sm mt-1 text-muted-foreground">
//             {formatTime(currentTime)} / {formatTime(duration)}
//           </div>
//         </div>

//         {/* 컨트롤 버튼 */}
//         <div className="flex justify-center gap-4 mt-6">
//           <Button onClick={() => goToPage(currentPage - 1)} variant="outline" size="icon">
//             <ChevronLeft className="w-5 h-5" />
//           </Button>
//           <Button onClick={togglePlay} variant="outline" size="icon">
//             {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
//           </Button>
//           <Button onClick={() => goToPage(currentPage + 1)} variant="outline" size="icon">
//             <ChevronRight className="w-5 h-5" />
//           </Button>
//         </div>

//         <div className="mt-4 text-center text-muted-foreground">
//           페이지 {currentPage + 1} / {pages.length}
//         </div>
//       </div>
//     </main>
//   )
// }

// function formatTime(time: number) {
//   const minutes = Math.floor(time / 60)
//   const seconds = Math.floor(time % 60)
//   return `${minutes}:${seconds.toString().padStart(2, "0")}`
// }
"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Pause, Play, ChevronLeft, ChevronRight } from "lucide-react"
import HomeButton from "@/components/home-button"

export default function StoryPage({ params }: { params: { id: string } }) {
  type Sentence = { sentence_id: number; text: string; audio_url: string }
  type Page = { image_url: string; sentences: Sentence[] }

  const [pages, setPages] = useState<Page[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [currentSentence, setCurrentSentence] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // 전체 동화 받아오기
  useEffect(() => {
    fetch(`/api/proxy-upload?path=stories/${params.id}`)
      .then((res) => res.json())
      .then((data) => setPages(data.pages))
  }, [params.id])

  // 재생 흐름 관리
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play()
    } else {
      audio.pause()
    }

    const handleEnded = () => {
      const page = pages[currentPage]
      if (!page) return

      // 다음 문장 존재
      if (currentSentence < page.sentences.length - 1) {
        setCurrentSentence((prev) => prev + 1)
      }
      // 다음 페이지로 넘어가기
      else if (currentPage < pages.length - 1) {
        setCurrentPage((prev) => prev + 1)
        setCurrentSentence(0)
      }
      // 마지막 페이지 마지막 문장이면 재생 멈춤
      else {
        setIsPlaying(false)
      }
    }

    audio.addEventListener("ended", handleEnded)
    return () => audio.removeEventListener("ended", handleEnded)
  }, [isPlaying, currentPage, currentSentence, pages])

  const togglePlay = () => setIsPlaying((prev) => !prev)

  const goToPage = (index: number) => {
    if (index >= 0 && index < pages.length) {
      setCurrentPage(index)
      setCurrentSentence(0)
      setIsPlaying(true)
    }
  }

  if (pages.length === 0) return <div>불러오는 중...</div>

  const page = pages[currentPage]
  const sentence = page.sentences[currentSentence]

  return (
    <main className="p-6 flex flex-col items-center">
      <HomeButton />
      <div className="max-w-3xl w-full bg-white/90 p-6 rounded-lg shadow-md transition-transform duration-700">
        <Image
          src={page.image_url}
          alt={`페이지 ${currentPage + 1}`}
          width={600}
          height={300}
          className="mx-auto mb-4 rounded"
        />

        <p className="text-lg text-center mb-4">{sentence.text}</p>
        <audio ref={audioRef} src={sentence.audio_url} preload="auto" />

        <div className="flex justify-center gap-4 mt-6">
          <Button onClick={() => goToPage(currentPage - 1)} variant="outline" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button onClick={togglePlay} variant="outline" size="icon">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <Button onClick={() => goToPage(currentPage + 1)} variant="outline" size="icon">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="mt-4 text-center text-muted-foreground">
          페이지 {currentPage + 1} / {pages.length}, 문장 {currentSentence + 1} / {page.sentences.length}
        </div>
      </div>
    </main>
  )
}
