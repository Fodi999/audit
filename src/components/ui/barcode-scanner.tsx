"use client"

import * as React from "react"
import { QrCode, X } from "lucide-react"
import { Button } from "./button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog"

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  disabled?: boolean
}

export function BarcodeScanner({ onScan, disabled }: BarcodeScannerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isScanning, setIsScanning] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)

  // Базовая база данных продуктов по штрих-кодам (для демонстрации)
  const barcodeDatabase: { [key: string]: { name: string; category: string; price: number } } = {
    '4607034171711': { name: 'Молоко 3.2%', category: 'dairy', price: 65 },
    '4690228013782': { name: 'Хлеб белый', category: 'bakery', price: 45 },
    '4607065661472': { name: 'Масло сливочное', category: 'dairy', price: 320 },
    '4690228027499': { name: 'Гречка', category: 'cereals', price: 95 },
    '4690228012816': { name: 'Рис', category: 'cereals', price: 85 },
  }

  const startCamera = async () => {
    try {
      setError(null)
      setIsScanning(true)
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Задняя камера
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (err) {
      setError('Не удалось получить доступ к камере')
      console.error('Camera access error:', err)
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
    setError(null)
  }

  const handleManualInput = () => {
    const barcode = prompt('Введите штрих-код вручную:')
    if (barcode) {
      processBarcode(barcode)
    }
  }

  const processBarcode = (barcode: string) => {
    const product = barcodeDatabase[barcode]
    if (product) {
      onScan(`${product.name}|${product.category}|${product.price}`)
    } else {
      onScan(barcode) // Просто передаем штрих-код, если продукт не найден
    }
    setIsOpen(false)
    stopCamera()
  }

  React.useEffect(() => {
    if (isOpen && !isScanning) {
      startCamera()
    } else if (!isOpen) {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="px-3 h-10 bg-gray-700/30 border-gray-600/30 text-gray-400 hover:bg-gray-600/30"
          title="Сканировать штрих-код"
        >
          <QrCode size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gray-800 border-gray-600">
        <DialogHeader>
          <DialogTitle className="text-gray-200 flex items-center gap-2">
            <QrCode size={20} />
            Сканирование штрих-кода
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {error ? (
            <div className="text-center space-y-4">
              <div className="text-red-400 text-sm">{error}</div>
              <Button onClick={handleManualInput} className="w-full">
                Ввести штрих-код вручную
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 bg-gray-900 rounded-lg object-cover"
                  playsInline
                  muted
                />
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-32 border-2 border-blue-500 rounded-lg relative">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
                      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-blue-500 animate-pulse"></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-sm text-gray-400">
                  Наведите камеру на штрих-код
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleManualInput} variant="outline" className="flex-1">
                    Ввести вручную
                  </Button>
                  <Button onClick={() => setIsOpen(false)} variant="outline" className="flex-1">
                    Отмена
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
