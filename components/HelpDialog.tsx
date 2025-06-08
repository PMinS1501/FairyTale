"use client"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

interface HelpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialImage?: number
}

export default function HelpDialog({ open, onOpenChange, initialImage = 1 }: HelpDialogProps) {
  const [currentImage, setCurrentImage] = useState(initialImage)
  const totalImages = 4

  // 다이얼로그가 열릴 때마다 초기 이미지로 리셋
  useEffect(() => {
    if (open) {
      setCurrentImage(initialImage)
    }
  }, [open, initialImage])

  const nextImage = () => {
    setCurrentImage(prev => prev < totalImages ? prev + 1 : 1)
  }

  const prevImage = () => {
    setCurrentImage(prev => prev > 1 ? prev - 1 : totalImages)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>도움말</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={`/help${currentImage}.png`} 
                  alt={`도움말 ${currentImage}`}
                  className="w-full rounded-lg"
                />
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevImage}
                    className="ml-2 bg-white/80 hover:bg-white/90"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextImage}
                    className="mr-2 bg-white/80 hover:bg-white/90"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalImages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentImage(i + 1)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      currentImage === i + 1 ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>닫기</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}