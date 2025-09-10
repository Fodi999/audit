"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Package } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ProductCalendarProps {
  productId: number
  productName: string
  deliveryDates?: Date[] // Даты поступлений продукта
  disabled?: boolean
}

export function ProductCalendar({ productId, productName, deliveryDates = [], disabled }: ProductCalendarProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Функция для определения, есть ли поступление в конкретную дату
  const hasDeliveryOnDate = (date: Date) => {
    return deliveryDates.some(deliveryDate => 
      format(deliveryDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )
  }

  // Модификатор для стилизации дат с поступлениями
  const modifiers = {
    delivery: deliveryDates,
  }

  const modifiersStyles = {
    delivery: {
      backgroundColor: '#3b82f6',
      color: 'white',
      fontWeight: 'bold',
    },
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            "text-blue-400 border-blue-400/30 hover:bg-blue-400/10 hover:border-blue-400"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="text-sm">
            {deliveryDates.length > 0 
              ? `${deliveryDates.length} поступлени${deliveryDates.length === 1 ? 'е' : deliveryDates.length < 5 ? 'я' : 'й'}`
              : 'Календарь поступлений'
            }
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b border-gray-700/30">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
            <Package size={16} className="text-blue-400" />
            <span>Поступления: {productName}</span>
          </div>
        </div>
        <Calendar
          mode="multiple"
          selected={deliveryDates}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          className="rounded-md border-0"
          showOutsideDays={false}
        />
        {deliveryDates.length > 0 && (
          <div className="p-3 border-t border-gray-700/30 bg-gray-800/50">
            <div className="text-xs text-gray-400 mb-2">Последние поступления:</div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {deliveryDates
                .sort((a, b) => b.getTime() - a.getTime())
                .slice(0, 5)
                .map((date, index) => (
                  <div key={index} className="text-xs text-gray-300 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    {format(date, 'dd.MM.yyyy')}
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
