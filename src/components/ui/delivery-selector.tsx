"use client"

import * as React from "react"
import { Calendar, Package, TrendingDown, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ProductDelivery } from "@/types/api"

interface DeliverySelectorProps {
  deliveries: ProductDelivery[]
  selectedDelivery?: ProductDelivery
  onSelectDelivery: (delivery: ProductDelivery) => void
  disabled?: boolean
}

export function DeliverySelector({ 
  deliveries, 
  selectedDelivery, 
  onSelectDelivery, 
  disabled 
}: DeliverySelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSelect = (delivery: ProductDelivery) => {
    onSelectDelivery(delivery)
    setIsOpen(false)
  }

  const getWasteColor = (wastePercentage: number) => {
    if (wastePercentage < 5) return 'text-green-400'
    if (wastePercentage < 15) return 'text-yellow-400'
    if (wastePercentage < 25) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            "bg-gray-700/30 border-gray-600/30 text-gray-200 hover:bg-gray-700/50",
            !selectedDelivery && "text-gray-500"
          )}
          disabled={disabled}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {selectedDelivery ? (
            <div className="flex items-center gap-2">
              <span>{format(new Date(selectedDelivery.date), "dd.MM.yyyy", { locale: ru })}</span>
              <span className="text-xs text-gray-400">
                ({selectedDelivery.net_weight}кг)
              </span>
            </div>
          ) : (
            <span>Выберите поступление</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-gray-800 border-gray-600" align="start">
        <div className="p-3 border-b border-gray-700">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
            <Package size={16} className="text-blue-400" />
            <span>История поступлений ({deliveries.length})</span>
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {deliveries.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              Нет поступлений
            </div>
          ) : (
            deliveries
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((delivery) => (
                <button
                  key={delivery.id}
                  onClick={() => handleSelect(delivery)}
                  className={cn(
                    "w-full p-3 text-left hover:bg-gray-700/50 transition-colors border-b border-gray-700/30 last:border-b-0",
                    selectedDelivery?.id === delivery.id && "bg-blue-600/20 border-blue-500/30"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-gray-200">
                      {format(new Date(delivery.date), "dd.MM.yyyy HH:mm", { locale: ru })}
                    </div>
                    <div className="text-xs text-gray-400">
                      {delivery.price_per_kg}₽/кг
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Нетто:</span>
                      <span className="text-gray-300">{delivery.net_weight}кг</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Отходы:</span>
                      <span className={cn("font-medium", getWasteColor(delivery.waste_percentage || 0))}>
                        {(delivery.waste_percentage || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-2 pt-2 border-t border-gray-700/30">
                    <span className="text-xs text-gray-400">Стоимость:</span>
                    <span className="text-sm font-medium text-blue-400">
                      {(delivery.total_cost || 0).toFixed(0)}₽
                    </span>
                  </div>
                </button>
              ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
