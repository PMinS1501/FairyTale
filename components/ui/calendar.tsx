"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, DayPickerProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = DayPickerProps;

interface CustomCaptionProps {
  displayMonth: Date;
  months: Date[];
  classNames: {
    caption: string;
    caption_label: string;
    nav_button: string;
    nav_button_previous: string;
    nav_button_next: string;
    nav?: string;
  };
  onPreviousClick?: () => void;
  onNextClick?: () => void;
}

const CustomCaption: React.FC<CustomCaptionProps> = ({
  displayMonth,
  onPreviousClick,
  onNextClick,
  classNames,
}) => {
  const formattedMonth = displayMonth.toLocaleDateString("default", {
    month: "long",
    year: "numeric",
  });
  return (
    <div className={cn(classNames.caption, "flex justify-center items-center relative pt-1")}>
      {onPreviousClick && (
        <button
          onClick={onPreviousClick}
          className={cn(classNames.nav_button, classNames.nav_button_previous)}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      <span className={classNames.caption_label}>{formattedMonth}</span>
      {onNextClick && (
        <button
          onClick={onNextClick}
          className={cn(classNames.nav_button, classNames.nav_button_next)}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        // 캡션 영역 스타일 (CustomCaption 컴포넌트에서 활용)
        caption: "flex justify-center items-center relative pt-1",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell:
          "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      /* 타입 에러를 피하기 위해 강제 단언을 사용 */
      components={
        {
          Caption: CustomCaption,
        } as unknown as DayPickerProps["components"]
      }
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
