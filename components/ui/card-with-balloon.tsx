"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CardWithBalloonProps extends React.HTMLAttributes<HTMLDivElement> {
  tailPosition?: "left" | "center" | "right"
  tailSize?: "small" | "medium" | "large"
}

export const CardWithBalloon = React.forwardRef<HTMLDivElement, CardWithBalloonProps>(
  ({ className, children, tailPosition = "left", tailSize = "medium", ...props }, ref) => {
    const tailSizeStyles = {
      small: {
        positioning: "before:-mb-4 after:-mb-3",
        borderWidth: "before:border-[10px] after:border-[8px]"
      },
      medium: {
        positioning: "before:-mb-6 after:-mb-4",
        borderWidth: "before:border-[16px] after:border-[12px]"
      },
      large: {
        positioning: "before:-mb-8 after:-mb-5",
        borderWidth: "before:border-[20px] after:border-[16px]"
      }
    }[tailSize]

    const tailPositionClasses = {
      left: "before:left-6 after:left-7",
      center: "before:left-1/2 before:-translate-x-1/2 after:left-1/2 after:-translate-x-1/2",
      right: "before:right-6 after:right-7",
    }[tailPosition]

    return (
      <div
        ref={ref}
        className={cn(
          "relative bg-white/90 backdrop-blur-md shadow-lg p-6 rounded-[1.5rem] border border-gray-200/50",
          // 외곽선 꼬리 (그림자 효과)
          "before:content-[''] before:absolute before:bottom-0 before:z-[-2]",
          `before:border-transparent before:border-t-gray-300/60 ${tailSizeStyles.borderWidth.split(' ')[0]}`,
          // 내부 꼬리 (실제 말풍선)
          "after:content-[''] after:absolute after:bottom-0 after:z-[-1]",
          `after:border-transparent after:border-t-white/90 ${tailSizeStyles.borderWidth.split(' ')[1]}`,
          tailSizeStyles.positioning,
          tailPositionClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
CardWithBalloon.displayName = "CardWithBalloon"