"use client"

import { useState, useEffect, useRef } from "react"

interface UseAutoPlaybackProps {
  totalPages: number
  initialPage?: number
  autoPlayDelay?: number
}

interface UseAutoPlaybackReturn {
  currentPage: number
  setCurrentPage: (page: number) => void
  isPlaying: boolean
  togglePlayback: () => void
  nextPage: () => void
  prevPage: () => void
  progress: number
  duration: number
  currentTime: number
  setCurrentTime: (time: number) => void
}

export function useAutoPlayback({
  totalPages,
  initialPage = 0,
  autoPlayDelay = 10000,
}: UseAutoPlaybackProps): UseAutoPlaybackReturn {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastTickRef = useRef<number>(Date.now())
  const duration = autoPlayDelay * totalPages

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Handle auto playback
  useEffect(() => {
    if (isPlaying) {
      lastTickRef.current = Date.now()

      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const delta = now - lastTickRef.current
        lastTickRef.current = now

        setCurrentTime((prevTime) => {
          const newTime = prevTime + delta

          // Check if we need to advance to the next page
          if (newTime >= (currentPage + 1) * autoPlayDelay) {
            if (currentPage < totalPages - 1) {
              setCurrentPage(currentPage + 1)
            } else {
              // Stop playback at the end
              setIsPlaying(false)
              clearInterval(intervalRef.current!)
              return currentPage * autoPlayDelay
            }
          }

          return newTime
        })
      }, 100) // Update progress bar smoothly
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, currentPage, totalPages, autoPlayDelay])

  // Reset current time when manually changing pages
  useEffect(() => {
    setCurrentTime(currentPage * autoPlayDelay)
  }, [currentPage, autoPlayDelay])

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Calculate progress as a percentage
  const progress = Math.min((currentTime / duration) * 100, 100)

  return {
    currentPage,
    setCurrentPage,
    isPlaying,
    togglePlayback,
    nextPage,
    prevPage,
    progress,
    duration,
    currentTime,
    setCurrentTime,
  }
}
