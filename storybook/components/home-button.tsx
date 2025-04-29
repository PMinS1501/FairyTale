"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function HomeButton() {
  const router = useRouter()
  const [showConfirmation, setShowConfirmation] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 left-4 z-10"
        onClick={() => setShowConfirmation(true)}
      >
        <Home className="h-5 w-5" />
      </Button>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>돌아가기</AlertDialogTitle>
            <AlertDialogDescription>
              처음 화면으로 돌아가시겠습니까? 현재 진행 중인 내용은 저장되지 않습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>아니오</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/")}>예</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
