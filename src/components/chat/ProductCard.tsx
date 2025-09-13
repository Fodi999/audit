import { Card, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Calendar, Info, Clock, Package, Apple, Beef, Fish, Milk, Wheat, Coffee, Cookie, Carrot } from 'lucide-react';
import { Product } from '../../types/api';

interface ProductCardProps {
  product: Product;
  hasBatches?: boolean;
  batches?: Product[]; // Массив всех партий продукта
}

const categories = [
  { id: 'vegetables', name: 'Овощи', icon: Carrot },
  { id: 'fruits', name: 'Фрукты', icon: Apple },
  { id: 'meat', name: 'Мясо', icon: Beef },
  { id: 'fish', name: 'Рыба', icon: Fish },
  { id: 'dairy', name: 'Молочные продукты', icon: Milk },
  { id: 'bakery', name: 'Хлебобулочные изделия', icon: Wheat },
  { id: 'cereals', name: 'Крупы и макароны', icon: Package },
  { id: 'canned', name: 'Консервы', icon: Package },
  { id: 'spices', name: 'Специи и приправы', icon: Cookie },
  { id: 'beverages', name: 'Напитки', icon: Coffee },
  { id: 'other', name: 'Другое', icon: Package }
];

export function ProductCard({ product, hasBatches = false, batches = [product] }: ProductCardProps) {
  const getExpirationStatus = (expiration_date?: string) => {
    if (!expiration_date) return { status: 'unknown', days: null, color: 'bg-gray-100 text-gray-800', text: 'Не указан' };
    
    const expDate = new Date(expiration_date);
    const today = new Date();
    const daysDiff = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return { 
      status: 'expired', 
      days: Math.abs(daysDiff), 
      color: 'bg-red-100 text-red-800',
      text: `Просрочен ${Math.abs(daysDiff)} дн.`
    };
    if (daysDiff <= 1) return { 
      status: 'critical', 
      days: daysDiff, 
      color: 'bg-red-100 text-red-800',
      text: daysDiff === 0 ? 'Истекает сегодня' : 'Истекает завтра'
    };
    if (daysDiff <= 3) return { 
      status: 'warning', 
      days: daysDiff, 
      color: 'bg-yellow-100 text-yellow-800',
      text: `${daysDiff} дн.`
    };
    if (daysDiff <= 7) return { 
      status: 'caution', 
      days: daysDiff, 
      color: 'bg-orange-100 text-orange-800',
      text: `${daysDiff} дн.`
    };
    return { 
      status: 'good', 
      days: daysDiff, 
      color: 'bg-green-100 text-green-800',
      text: `${daysDiff} дн.`
    };
  };

  const expStatus = getExpirationStatus(product.expiration_date);
  
  // Вычисляем сводную информацию по всем партиям
  const totalQuantity = batches.reduce((sum, batch) => sum + (batch.quantity || batch.stock || batch.net_weight || 0), 0);
  const averagePrice = batches.reduce((sum, batch) => sum + (batch.price || batch.price_per_kg || 0), 0) / batches.length;
  const totalCost = totalQuantity * averagePrice;
  
  const createdDate = new Date(product.created_at).toLocaleDateString('ru-RU');
  const purchaseDate = product.purchase_date ? new Date(product.purchase_date).toLocaleDateString('ru-RU') : null;
  const deliveryDate = product.delivery_date ? new Date(product.delivery_date).toLocaleDateString('ru-RU') : null;
  
  // Генерируем номер партии на основе ID (П001, П002, П003...)
  const batchNumber = batches.length > 1 
    ? `${batches.length} партий` 
    : `П${String(product.id).slice(-3).padStart(3, '0')}`;

  // Определяем, является ли продукт новым поступлением (поступил за последние 3 дня)
  const isNewArrival = () => {
    return batches.some(batch => {
      const arrivalDate = new Date(batch.delivery_date || batch.created_at);
      const today = new Date();
      const daysDiff = Math.ceil((today.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 3;
    });
  };

  return (
    <Card className={`hover:shadow-md transition-shadow duration-200 ${
      hasBatches ? 'border-l-4 border-l-blue-500' : ''
    }`}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={`product-${product.id}`} className="border-none">
          <AccordionTrigger className="px-3 pt-3 pb-2 hover:no-underline">
            <div className="flex items-start justify-between w-full mr-4">
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  {/* Фото продукта */}
                  {product.image_url && (
                    <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <CardTitle className="text-sm font-semibold text-gray-900 mb-1 text-left">
                      {product.name}
                      <span className="ml-2 text-xs text-gray-500 font-normal">
                        {batchNumber}
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-1 mb-1">
                      <Badge variant="secondary" className="text-xs flex items-center gap-1 px-2 py-0.5">
                        {(() => {
                          const categoryData = categories.find(cat => cat.name === product.category);
                          if (categoryData) {
                            const IconComponent = categoryData.icon;
                            return (
                              <>
                                <IconComponent size={10} />
                                {product.category}
                              </>
                            );
                          }
                          return product.category;
                        })()}
                      </Badge>
                      {hasBatches && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5 border-blue-300 text-blue-700">
                          Партия
                        </Badge>
                      )}
                      {isNewArrival() && (
                        <Badge className="text-xs px-2 py-0.5 bg-green-100 text-green-800 border-green-300">
                          ✨ Новое
                        </Badge>
                      )}
                      {product.expiration_date && (
                        <Badge variant="secondary" className={`text-xs px-2 py-0.5 ${expStatus.color}`}>
                          <Calendar className="w-2 h-2 mr-1" />
                          {expStatus.text}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Краткая информация */}
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>{totalQuantity.toFixed(1)} кг</span>
                      <span>{averagePrice.toFixed(0)}₽/кг</span>
                      <span className="font-semibold text-blue-600">{Math.round(totalCost)}₽</span>
                      {batches.length > 1 && (
                        <span className="text-blue-600">({batches.length} партий)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AccordionTrigger>
          
          <AccordionContent className="px-3 pb-3">
            <div className="space-y-3">
              {/* Фото продукта в большом размере */}
              {product.image_url && (
                <div className="w-full h-24 rounded-md overflow-hidden border border-gray-200">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Информация о партиях */}
              {batches.length > 1 ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    Партии ({batches.length}):
                  </h4>
                  {batches.map((batch, index) => (
                    <div key={batch.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          Партия П{String(batch.id).slice(-3).padStart(3, '0')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(batch.delivery_date || batch.created_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-xs">Нетто</span>
                          <span className="font-medium text-sm">{(batch.net_weight || batch.quantity || batch.stock || 0)} кг</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-xs">Цена</span>
                          <span className="font-medium text-sm">{(batch.price || batch.price_per_kg || 0)}₽/кг</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-xs">Сумма</span>
                          <span className="font-medium text-sm text-blue-600">
                            {Math.round((batch.net_weight || batch.quantity || batch.stock || 0) * (batch.price || batch.price_per_kg || 0))}₽
                          </span>
                        </div>
                      </div>
                      {batch.expiration_date && (
                        <div className="mt-2 text-xs text-gray-600">
                          Срок до: {new Date(batch.expiration_date).toLocaleDateString('ru-RU')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {(product.gross_weight || 0) > 0 && (
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs">Брутто</span>
                      <span className="font-medium text-sm">{product.gross_weight} кг</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">Нетто</span>
                    <span className="font-medium text-sm">{(product.net_weight || product.quantity || product.stock || 0)} кг</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">Цена за кг</span>
                    <span className="font-medium text-sm">{(product.price || product.price_per_kg || 0)}₽</span>
                  </div>
                </div>
              )}

              {/* Расчет отходов, если есть брутто */}
              {(product.gross_weight || 0) > 0 && (product.net_weight || product.quantity || 0) > 0 && (
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600">Отходы:</span>
                    <span className="font-medium text-orange-600">
                      {(((product.gross_weight || 0) - (product.net_weight || product.quantity || 0)) / (product.gross_weight || 1) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Потери:</span>
                    <span className="font-medium text-red-600">
                      {((product.gross_weight || 0) - (product.net_weight || product.quantity || 0)).toFixed(3)} кг
                    </span>
                  </div>
                </div>
              )}
              
              {/* Общая стоимость */}
              <div className="bg-blue-50 p-2 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 font-medium">
                    {batches.length > 1 ? 'Общая стоимость всех партий:' : 'Общая стоимость:'}
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {Math.round(totalCost)}₽
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {batches.length > 1 
                    ? `${totalQuantity.toFixed(1)} кг общий вес, средняя цена ${averagePrice.toFixed(0)}₽/кг`
                    : `${(product.net_weight || product.quantity || product.stock || 0)} кг × ${(product.price || product.price_per_kg || 0)}₽`
                  }
                </div>
              </div>
              
              {/* Дополнительная информация */}
              <div className="pt-2 border-t border-gray-100 space-y-1">
                <h4 className="text-xs font-medium text-gray-900 flex items-center mb-2">
                  <Info className="w-3 h-3 mr-1" />
                  Дополнительная информация
                </h4>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center">
                    <Package className="w-3 h-3 mr-2" />
                    <span>Партия: {batchNumber}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-2" />
                    <span>Добавлен: {createdDate}</span>
                  </div>
                  
                  {purchaseDate && (
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-2" />
                      <span>Дата покупки: {purchaseDate}</span>
                    </div>
                  )}
                  
                  {deliveryDate && (
                    <div className={`flex items-center ${isNewArrival() ? 'bg-green-50 p-2 rounded border border-green-200' : ''}`}>
                      <Calendar className={`w-3 h-3 mr-2 ${isNewArrival() ? 'text-green-600' : ''}`} />
                      <span className={isNewArrival() ? 'text-green-800 font-medium' : ''}>
                        Дата поступления: {deliveryDate}
                        {isNewArrival() && (
                          <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">
                            📦 Новое поступление
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  
                  {product.expiration_date && (
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-2" />
                      <span>Срок годности: {new Date(product.expiration_date).toLocaleDateString('ru-RU')}</span>
                    </div>
                  )}
                  
                  {product.location && (
                    <div className="flex items-center">
                      <Package className="w-3 h-3 mr-2" />
                      <span>Местоположение: {product.location}</span>
                    </div>
                  )}
                  
                  {product.barcode && (
                    <div className="flex items-center">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        Штрихкод: {product.barcode}
                      </span>
                    </div>
                  )}
                  
                  {product.notes && (
                    <div className="mt-1">
                      <span className="text-gray-700">Заметки:</span>
                      <p className="text-gray-600 text-xs mt-1 bg-gray-50 p-2 rounded">
                        {product.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
