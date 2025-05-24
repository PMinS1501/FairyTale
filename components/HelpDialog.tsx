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

interface HelpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  helpTab: 1 | 2
  setHelpTab: (tab: 1 | 2) => void
}

export default function HelpDialog({ open, onOpenChange, helpTab, setHelpTab }: HelpDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>도움말</AlertDialogTitle>
          <div className="flex gap-2 mb-2">
            <Button variant={helpTab === 1 ? "default" : "outline"} onClick={() => setHelpTab(1)}>
              녹음하는 법
            </Button>
            <Button variant={helpTab === 2 ? "default" : "outline"} onClick={() => setHelpTab(2)}>
              동화 재생하는 법
            </Button>
          </div>
          <AlertDialogDescription>
            {helpTab === 1 ? (
              <p>음성으로 답변하고 녹음 버튼을 눌러 저장하세요.</p>
            ) : (
              <p>동화의 음성과 이미지를 재생하며 감상할 수 있습니다.</p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>닫기</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
