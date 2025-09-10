'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Package, Plus, Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types/api';
import { productCategories, expirationDays } from './constants';
import { DatePicker } from '@/components/ui/date-picker';

interface SimpleAddProductFormProps {
  onAddProduct: (productData: Omit<Product, 'id' | 'owner_id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  isLoading: boolean;
}

export function SimpleAddProductForm({ onAddProduct, isLoading }: SimpleAddProductFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<Date>(new Date());
  
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0, // брутто вес
    net_weight: 0, // нетто вес
    price: 0,
    category: 'other' as Product['category'],
    notes: '',
    purchase_date: new Date().toISOString().split('T')[0],
    expiration_days: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      quantity: 0,
      net_weight: 0,
      price: 0,
      category: 'other',
      notes: '',
      purchase_date: new Date().toISOString().split('T')[0],
      expiration_days: '',
    });
    setSelectedImage(null);
    setImagePreview(null);
    setDeliveryDate(new Date());
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Размер файла не должен превышать 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Выберите файл изображения');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Введите название продукта');
      return;
    }

    if (!formData.quantity || formData.quantity <= 0) {
      toast.error('Брутто вес должен быть больше 0');
      return;
    }

    if (formData.net_weight < 0) {
      toast.error('Нетто вес не может быть отрицательным');
      return;
    }

    if (formData.net_weight > formData.quantity) {
      toast.error('Нетто вес не может быть больше брутто веса');
      return;
    }

    if (formData.price < 0) {
      toast.error('Цена не может быть отрицательной');
      return;
    }

    // Рассчитываем дату истечения срока годности на основе выбранных дней
    let expiration_date = '';
    if (formData.expiration_days) {
      const daysToAdd = parseInt(formData.expiration_days);
      const expirationDate = new Date(deliveryDate);
      expirationDate.setDate(deliveryDate.getDate() + daysToAdd);
      expiration_date = expirationDate.toISOString().split('T')[0];
    }

    let image_url = '';
    
    // Загружаем изображение если оно выбрано
    if (selectedImage) {
      try {
        const formData = new FormData();
        formData.append('image', selectedImage);
        
        const uploadResponse = await fetch('/api/products/upload-image', {
          method: 'POST',
          headers: {
            'User-ID': localStorage.getItem('userId') || '',
          },
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          if (uploadResult.success) {
            image_url = uploadResult.data.image_url;
          } else {
            toast.error('Ошибка загрузки изображения');
          }
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Ошибка загрузки изображения');
      }
    }

    const productData = {
      ...formData,
      purchase_date: deliveryDate.toISOString().split('T')[0], // используем дату поступления как дату покупки
      expiration_date,
      image_url,
      is_active: true,
    };

    // Удаляем временное поле expiration_days из данных для отправки
    const { expiration_days, ...dataToSend } = productData;

    const success = await onAddProduct(dataToSend);
    if (success) {
      resetForm();
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button className="bg-slate-700 hover:bg-slate-800 text-white text-sm px-3 py-2 h-9 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-1" />
          Добавить
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[calc(100vw-2rem)] sm:w-80 p-4 max-h-[85vh] overflow-y-auto" 
        align="center"
        side="bottom"
        sideOffset={8}
      >
        <div className="space-y-4">
          <div className="text-center pb-2 border-b border-slate-200">
            <h3 className="text-base font-medium text-slate-900">Новый продукт</h3>
          </div>
        
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Загрузка изображения - компактная */}
            <div>
              {imagePreview ? (
                <div className="relative">
                  <div className="w-full h-24 bg-slate-50 rounded border overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-1 right-1 h-6 w-6 p-0 bg-black/20 text-white hover:bg-black/40"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-full h-16 bg-slate-50 rounded border-2 border-dashed border-slate-300 flex items-center justify-center hover:border-slate-700 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-slate-700"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="text-xs">Добавить фото</span>
                  </label>
                </div>
              )}
            </div>

            {/* Название и категория */}
            <div className="space-y-3">
              <Input
                placeholder="Название продукта"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="h-9"
              />
              
              <Select
                value={formData.category}
                onValueChange={(value: Product['category']) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <IconComponent size={12} />
                          {category.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Брутто, нетто и цена */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Input
                  type="number"
                  placeholder="Брутто (кг)"
                  value={formData.quantity === 0 ? '' : formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.1"
                  className="h-9 text-sm"
                />
                <div className="text-xs text-slate-500 mt-1">брутто</div>
              </div>
              
              <div>
                <Input
                  type="number"
                  placeholder="Нетто (кг)"
                  value={formData.net_weight === 0 ? '' : formData.net_weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, net_weight: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.1"
                  className="h-9 text-sm"
                />
                <div className="text-xs text-slate-500 mt-1">нетто</div>
              </div>
              
              <div>
                <Input
                  type="number"
                  placeholder="Цена (₽/кг)"
                  value={formData.price === 0 ? '' : formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.01"
                  className="h-9 text-sm"
                />
                <div className="text-xs text-slate-500 mt-1">₽/кг</div>
              </div>
            </div>
            
            {/* Срок годности */}
            <Select
              value={formData.expiration_days}
              onValueChange={(value) => setFormData(prev => ({ ...prev, expiration_days: value }))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Срок годности" />
              </SelectTrigger>
              <SelectContent>
                {expirationDays.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Дата поступления */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Дата поступления
              </label>
              <DatePicker
                date={deliveryDate}
                onDateSelect={(date) => setDeliveryDate(date || new Date())}
                placeholder="Выберите дату поступления"
              />
            </div>
            
            {/* Предварительный расчет - компактный */}
            {formData.net_weight > 0 && formData.price > 0 && (
              <div className="bg-slate-50 rounded p-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-700">Нетто × Цена:</span>
                  <span className="font-medium text-slate-800">
                    {formData.net_weight} кг × {formData.price} ₽
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-slate-700 font-medium">Итого:</span>
                  <span className="text-sm font-bold text-slate-800">
                    {(formData.net_weight * formData.price).toFixed(0)} ₽
                  </span>
                </div>
                {formData.quantity > 0 && formData.quantity !== formData.net_weight && (
                  <div className="text-xs text-slate-600 mt-1">
                    Отходы: {((formData.quantity - formData.net_weight) / formData.quantity * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            )}
            
            {/* Кнопки */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1 h-8"
                size="sm"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.name.trim()}
                className="flex-1 h-8 bg-slate-700 hover:bg-slate-800"
                size="sm"
              >
                {isLoading ? (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Сохранение</span>
                  </div>
                ) : (
                  'Добавить'
                )}
              </Button>
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
