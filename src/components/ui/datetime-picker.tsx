"use client"

import * as React from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateTimePickerProps {
  date?: Date
  onDateTimeSelect?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
}

export function DateTimePicker({ date, onDateTimeSelect, placeholder = "дд.мм.гггг", disabled }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [timeValue, setTimeValue] = React.useState(
    date ? format(date, "HH:mm") : "00:00"
  )

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Объединяем выбранную дату с временем
      const [hours, minutes] = timeValue.split(":")
      const newDateTime = new Date(selectedDate)
      newDateTime.setHours(parseInt(hours, 10))
      newDateTime.setMinutes(parseInt(minutes, 10))
      
      onDateTimeSelect?.(newDateTime)
      setIsOpen(false)
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTimeValue(newTime)
    
    if (date) {
      const [hours, minutes] = newTime.split(":")
      const newDateTime = new Date(date)
      newDateTime.setHours(parseInt(hours, 10))
      newDateTime.setMinutes(parseInt(minutes, 10))
      
      onDateTimeSelect?.(newDateTime)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            "bg-gray-800/30 border-gray-600/30 text-gray-200 hover:bg-gray-700/30 hover:text-gray-100"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd.MM.yyyy HH:mm", { locale: ru }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600" align="start">
        <div className="p-3 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-200">Время</span>
          </div>
          <Input
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            className="bg-gray-700/50 border-gray-600 text-gray-200"
          />
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          locale={ru}
          className="bg-gray-800"
        />
      </PopoverContent>
    </Popover>
  )
}
