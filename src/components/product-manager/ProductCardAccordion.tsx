import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Trash2, Edit, Package, MapPin, Calendar, DollarSign, ShoppingCart, Barcode, FileText } from 'lucide-react';
import { productCategories } from './constants';
import { Product } from '@/types/api';

interface ProductCardAccordionProps {
  product: Product;
  onDelete: (productId: number) => void;
  onEdit?: (product: Product) => void;
}

export function ProductCardAccordion({ product, onDelete, onEdit }: ProductCardAccordionProps) {
  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) {
      return { status: 'unknown', variant: 'outline' as const, text: 'Не указано', color: 'gray' };
    }
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', variant: 'destructive' as const, text: 'Просрочен', color: 'red' };
    } else if (diffDays <= 3) {
      return { status: 'warning', variant: 'secondary' as const, text: `${diffDays} дн.`, color: 'orange' };
    } else if (diffDays <= 7) {
      return { status: 'soon', variant: 'outline' as const, text: `${diffDays} дн.`, color: 'yellow' };
    }
    return { status: 'good', variant: 'default' as const, text: `${diffDays} дн.`, color: 'green' };
  };

  const getCategoryInfo = (categoryId: string) => {
    return productCategories.find(cat => cat.id === categoryId) || 
           { id: 'other', name: 'Другое', icon: Package };
  };

  const expiryInfo = getExpiryStatus(product.expiration_date);
  const totalValue = product.price * product.quantity;
  const categoryInfo = getCategoryInfo(product.category);
  const IconComponent = categoryInfo.icon;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem 
        value={`product-${product.id}`}
        className={`bg-white rounded-lg border-2 transition-all duration-300 hover:shadow-lg ${
          expiryInfo.status === 'expired' ? 'border-red-200 bg-red-50/50' : 
          expiryInfo.status === 'warning' ? 'border-orange-200 bg-orange-50/50' :
          expiryInfo.status === 'soon' ? 'border-yellow-200 bg-yellow-50/50' :
          'border-slate-200'
        }`}
      >
        <AccordionTrigger className="px-6 py-4 hover:no-underline group">
          <div className="flex items-center justify-between w-full mr-3">
            {/* Левая часть - основная информация */}
            <div className="flex items-center gap-4">
              {/* Изображение или иконка */}
              <div className="flex-shrink-0">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center group-hover:from-slate-200 group-hover:to-slate-300 transition-all duration-200">
                    <IconComponent className="w-6 h-6 text-slate-500" />
                  </div>
                )}
              </div>
              
              {/* Название и категория */}
              <div className="text-left">
                <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    <IconComponent className="w-3 h-3 mr-1" />
                    {categoryInfo.name}
                  </Badge>
                  {product.location && (
                    <Badge variant="secondary" className="text-xs">
                      <MapPin className="w-3 h-3 mr-1" />
                      {product.location}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Правая часть - ключевые метрики */}
            <div className="flex items-center gap-6">
              {/* Количество */}
              <div className="text-center">
                <div className="font-bold text-slate-900">{product.quantity} кг</div>
                <div className="text-xs text-slate-500">количество</div>
              </div>
              
              {/* Стоимость */}
              <div className="text-center">
                <div className="font-bold text-slate-700">{totalValue.toFixed(0)} ₽</div>
                <div className="text-xs text-slate-500">{product.price} ₽/кг</div>
              </div>
              
              {/* Срок годности */}
              <div className="text-center">
                <Badge variant={expiryInfo.variant} className="text-xs">
                  {expiryInfo.text}
                </Badge>
                <div className="text-xs text-slate-500 mt-1">срок годности</div>
              </div>
            </div>
          </div>
        </AccordionTrigger>
        
        <AccordionContent className="px-6 pb-4">
          <div className="space-y-4 pt-2 border-t border-slate-200">
            {/* Детальная информация */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>Дата покупки</span>
                </div>
                <div className="font-medium">
                  {new Date(product.purchase_date).toLocaleDateString('ru-RU')}
                </div>
              </div>
              
              {product.expiration_date && (
                <div className="space-y-1 p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>Срок годности</span>
                  </div>
                  <div className={`font-medium ${
                    expiryInfo.status === 'expired' ? 'text-red-600' :
                    expiryInfo.status === 'warning' ? 'text-orange-600' :
                    expiryInfo.status === 'soon' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {new Date(product.expiration_date).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              )}
              
              <div className="space-y-1 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <DollarSign className="w-4 h-4" />
                  <span>Цена за кг</span>
                </div>
                <div className="font-medium">{product.price} ₽</div>
              </div>
              
              <div className="space-y-1 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Общая стоимость</span>
                </div>
                <div className="font-bold text-slate-700">{totalValue.toFixed(0)} ₽</div>
              </div>
            </div>
            
            {/* Штрихкод и заметки */}
            {(product.barcode || product.notes) && (
              <div className="space-y-3 pt-4 border-t border-slate-200">
                {product.barcode && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Barcode className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-600">Штрихкод</span>
                    </div>
                    <span className="font-mono text-sm bg-white px-3 py-2 rounded border">
                      {product.barcode}
                    </span>
                  </div>
                )}
                {product.notes && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-600">Заметки</span>
                    </div>
                    <div className="text-sm bg-white p-3 rounded border">
                      {product.notes}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Кнопки действий */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(product)}
                  className="flex-1 hover:bg-slate-50 hover:border-slate-700 hover:text-slate-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Редактировать
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(product.id)}
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Удалить
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
