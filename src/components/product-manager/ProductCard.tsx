import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { Product } from '@/types/api';

interface ProductCardProps {
  product: Product;
  onDelete?: (id: number) => void;
}

export function ProductCard({ product, onDelete }: ProductCardProps) {
  // Расчет дней до истечения срока годности
  const getDaysUntilExpiry = () => {
    if (!product.expiration_date) return null;
    const today = new Date();
    const expiry = new Date(product.expiration_date);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Получение цвета границы карточки в зависимости от срока годности
  const getBorderColor = () => {
    const days = getDaysUntilExpiry();
    if (days === null) return 'border-gray-200';
    if (days < 0) return 'border-red-500';
    if (days <= 3) return 'border-orange-500';
    if (days <= 7) return 'border-yellow-500';
    return 'border-green-500';
  };

  // Получение цвета бейджа для срока годности
  const getExpiryBadgeVariant = () => {
    const days = getDaysUntilExpiry();
    if (days === null) return 'secondary';
    if (days < 0) return 'destructive';
    if (days <= 3) return 'destructive';
    if (days <= 7) return 'default';
    return 'secondary';
  };

  // Форматирование срока годности
  const formatExpiry = () => {
    const days = getDaysUntilExpiry();
    if (days === null) return 'Не указан';
    if (days < 0) return 'Просрочен';
    if (days === 0) return 'Сегодня';
    if (days === 1) return '1 день';
    if (days <= 4) return `${days} дня`;
    return `${days} дн.`;
  };

  const totalCost = product.price * product.quantity;

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 border-l-4 bg-gray-50 hover:bg-gray-100 ${getBorderColor()}`}>
      <CardContent className="p-3 sm:p-4">
        {/* Заголовок с названием и кнопкой удаления */}
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-lg leading-tight truncate">
              {product.name}
            </h3>
            <div className="flex items-center gap-1 sm:gap-2 mt-1">
              <span className="text-xs sm:text-sm text-gray-500 truncate">{product.category}</span>
              {product.location && (
                <>
                  <span className="text-gray-300 hidden sm:inline">•</span>
                  <span className="text-xs sm:text-sm text-gray-500 truncate hidden sm:inline">{product.location}</span>
                </>
              )}
            </div>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(product.id)}
              className="text-gray-400 hover:text-red-500 p-1 h-auto ml-2 flex-shrink-0"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          )}
        </div>

        {/* Основная информация в сетке 2x2 */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-2 sm:gap-x-4 sm:gap-y-3 text-xs sm:text-sm">
          {/* Количество */}
          <div className="min-w-0">
            <span className="text-gray-500 block truncate">количество</span>
            <span className="font-medium text-gray-900 truncate block">
              {product.quantity} кг
            </span>
          </div>

          {/* Стоимость */}
          <div className="min-w-0">
            <span className="text-gray-500 block truncate">стоимость</span>
            <span className="font-medium text-gray-900 truncate block">
              {totalCost.toFixed(0)} ₽
            </span>
          </div>

          {/* Цена за кг */}
          <div className="min-w-0">
            <span className="text-gray-500 block truncate">цена</span>
            <span className="font-medium text-gray-900 truncate block">
              {product.price} ₽/кг
            </span>
          </div>

          {/* Срок годности */}
          <div className="min-w-0">
            <span className="text-gray-500 block truncate">срок годности</span>
            <Badge 
              variant={getExpiryBadgeVariant()}
              className="text-xs font-medium w-fit"
            >
              {formatExpiry()}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
