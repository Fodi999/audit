'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Calendar, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryFormProps {
  onAddDelivery: (delivery: {
    date: string;
    gross_weight: number;
    net_weight: number;
    price_per_kg: number;
    notes?: string;
  }) => void;
  disabled?: boolean;
  triggerText?: string;
}

export function DeliveryForm({ onAddDelivery, disabled = false, triggerText = "Добавить поступление" }: DeliveryFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date(),
    gross_weight: '',
    net_weight: '',
    price_per_kg: '',
    notes: ''
  });

  const handleSubmit = async () => {
    // Валидация
    const missingFields = [];
    if (!formData.gross_weight) missingFields.push('Брутто вес');
    if (!formData.net_weight) missingFields.push('Нетто вес');
    if (!formData.price_per_kg) missingFields.push('Цена за кг');

    if (missingFields.length > 0) {
      toast.error(`Заполните поля: ${missingFields.join(', ')}`);
      return;
    }

    const grossWeight = parseFloat(formData.gross_weight);
    const netWeight = parseFloat(formData.net_weight);
    const pricePerKg = parseFloat(formData.price_per_kg);

    // Дополнительная валидация
    if (grossWeight <= 0 || netWeight <= 0 || pricePerKg <= 0) {
      toast.error('Все числовые значения должны быть больше 0');
      return;
    }

    if (netWeight > grossWeight) {
      toast.error('Нетто вес не может быть больше брутто веса');
      return;
    }

    setIsLoading(true);
    try {
      const delivery = {
        date: formData.date.toISOString(),
        gross_weight: grossWeight,
        net_weight: netWeight,
        price_per_kg: pricePerKg,
        notes: formData.notes.trim() || undefined
      };

      await onAddDelivery(delivery);
      
      // Сброс формы и закрытие диалога
      setFormData({
        date: new Date(),
        gross_weight: '',
        net_weight: '',
        price_per_kg: '',
        notes: ''
      });
      setIsOpen(false);

      const wastePercentage = ((grossWeight - netWeight) / grossWeight) * 100;
      const totalCost = netWeight * pricePerKg;
      
      toast.success(
        `Поступление добавлено: ${netWeight}кг нетто, ${totalCost.toFixed(0)}₽ (отходы: ${wastePercentage.toFixed(1)}%)`
      );
    } catch (error) {
      console.error('Error adding delivery:', error);
      toast.error('Ошибка при добавлении поступления');
    } finally {
      setIsLoading(false);
    }
  };

  const wastePercentage = formData.gross_weight && formData.net_weight ? 
    ((parseFloat(formData.gross_weight) - parseFloat(formData.net_weight)) / parseFloat(formData.gross_weight)) * 100 : 0;

  const totalCost = formData.net_weight && formData.price_per_kg ? 
    parseFloat(formData.net_weight) * parseFloat(formData.price_per_kg) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600/20 hover:border-blue-500/50 transition-colors"
        >
          <Plus size={14} className="mr-1" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 border-gray-600/30">
        <DialogHeader>
          <DialogTitle className="text-gray-200 flex items-center gap-2">
            <Calendar size={18} className="text-blue-400" />
            Добавить поступление
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Укажите детали нового поступления продукта
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Дата и время */}
          <div className="space-y-2">
            <Label htmlFor="delivery-date" className="text-gray-300">Дата и время поступления</Label>
            <DateTimePicker
              date={formData.date}
              onDateTimeSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
              placeholder="Выберите дату и время"
              disabled={isLoading}
            />
          </div>

          {/* Веса */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="gross-weight" className="text-gray-300">Брутто (кг)</Label>
              <Input
                id="gross-weight"
                type="number"
                step="0.1"
                placeholder="10.0"
                value={formData.gross_weight}
                onChange={(e) => setFormData(prev => ({ ...prev, gross_weight: e.target.value }))}
                className="bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-500"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="net-weight" className="text-gray-300">Нетто (кг)</Label>
              <Input
                id="net-weight"
                type="number"
                step="0.1"
                placeholder="9.5"
                value={formData.net_weight}
                onChange={(e) => setFormData(prev => ({ ...prev, net_weight: e.target.value }))}
                className="bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-500"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Цена */}
          <div className="space-y-2">
            <Label htmlFor="price-per-kg" className="text-gray-300">Цена за кг (₽)</Label>
            <Input
              id="price-per-kg"
              type="number"
              step="0.01"
              placeholder="250.00"
              value={formData.price_per_kg}
              onChange={(e) => setFormData(prev => ({ ...prev, price_per_kg: e.target.value }))}
              className="bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-500"
              disabled={isLoading}
            />
          </div>

          {/* Примечания */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-300">Примечания (опционально)</Label>
            <Textarea
              id="notes"
              placeholder="Комментарий к поступлению..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-500 min-h-[60px]"
              disabled={isLoading}
            />
          </div>

          {/* Расчеты */}
          {(formData.gross_weight && formData.net_weight && formData.price_per_kg) && (
            <div className="bg-gray-700/20 rounded-lg p-3 space-y-2 border border-gray-600/20">
              <h4 className="text-sm font-medium text-gray-300">Расчеты:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Отходы:</span>
                  <span className={`font-medium ${
                    wastePercentage < 5 ? 'text-green-400' : 
                    wastePercentage < 15 ? 'text-yellow-400' : 
                    wastePercentage < 25 ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {wastePercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Стоимость:</span>
                  <span className="text-blue-400 font-medium">{totalCost.toFixed(0)}₽</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            className="bg-transparent border-gray-600/30 text-gray-400 hover:bg-gray-700/30"
          >
            Отмена
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? 'Добавляю...' : 'Добавить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
