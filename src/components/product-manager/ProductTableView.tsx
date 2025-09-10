import { Product } from '@/types/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Trash2, Edit, Eye, AlertTriangle, Clock } from 'lucide-react';
import { productCategories } from './constants';

interface ProductTableViewProps {
  products: Product[];
  onDeleteProduct: (productId: number) => void;
  onEditProduct?: (product: Product) => void;
}

export function ProductTableView({ products, onDeleteProduct, onEditProduct }: ProductTableViewProps) {
  const getExpiryStatus = (expirationDate?: string) => {
    if (!expirationDate) return { status: 'unknown', color: 'gray', days: null };
    
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'expired', color: 'red', days: Math.abs(diffDays) };
    if (diffDays <= 3) return { status: 'critical', color: 'orange', days: diffDays };
    if (diffDays <= 7) return { status: 'warning', color: 'yellow', days: diffDays };
    return { status: 'good', color: 'green', days: diffDays };
  };

  const getCategoryInfo = (categoryId: string) => {
    return productCategories.find(cat => cat.id === categoryId) || 
           { id: 'other', name: 'Другое', icon: null };
  };

  const getShelfLifeProgress = (purchaseDate: string, expirationDate?: string) => {
    if (!expirationDate) return 0;
    
    const purchase = new Date(purchaseDate);
    const expiry = new Date(expirationDate);
    const today = new Date();
    
    const totalTime = expiry.getTime() - purchase.getTime();
    const elapsedTime = today.getTime() - purchase.getTime();
    
    const progress = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
    return progress;
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Eye className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Нет продуктов</h3>
        <p className="text-gray-500">Добавьте продукты, чтобы увидеть их здесь</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Продукт</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead className="text-right">Количество</TableHead>
              <TableHead className="text-right">Цена</TableHead>
              <TableHead className="text-center">Срок годности</TableHead>
              <TableHead className="text-center">Состояние</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const expiryInfo = getExpiryStatus(product.expiration_date);
              const categoryInfo = getCategoryInfo(product.category);
              const shelfLifeProgress = getShelfLifeProgress(product.purchase_date, product.expiration_date);
              const IconComponent = categoryInfo.icon;

              return (
                <TableRow key={product.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {IconComponent && <IconComponent className="w-5 h-5 text-gray-400" />}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        {product.location && (
                          <div className="text-sm text-gray-500">📍 {product.location}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {IconComponent && <IconComponent className="w-3 h-3" />}
                      {categoryInfo.name}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-right font-medium">
                    {product.quantity} кг
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="font-medium">{product.price}₽/кг</div>
                    <div className="text-sm text-gray-500">
                      ≈ {(product.price * product.quantity).toFixed(0)}₽
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {product.expiration_date ? (
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {new Date(product.expiration_date).toLocaleDateString('ru-RU')}
                        </div>
                        {expiryInfo.days !== null && (
                          <div className={`text-xs ${
                            expiryInfo.color === 'red' ? 'text-red-600' :
                            expiryInfo.color === 'orange' ? 'text-orange-600' :
                            expiryInfo.color === 'yellow' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {expiryInfo.status === 'expired' 
                              ? `Просрочен на ${expiryInfo.days} дн.`
                              : `Осталось ${expiryInfo.days} дн.`
                            }
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Не указан</span>
                    )}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-2">
                      {/* Индикатор срока годности */}
                      <Tooltip>
                        <TooltipTrigger>
                          <div className={`w-3 h-3 rounded-full ${
                            expiryInfo.color === 'red' ? 'bg-red-500' :
                            expiryInfo.color === 'orange' ? 'bg-orange-500' :
                            expiryInfo.color === 'yellow' ? 'bg-yellow-500' :
                            expiryInfo.color === 'green' ? 'bg-green-500' :
                            'bg-gray-300'
                          }`} />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {expiryInfo.status === 'expired' ? 'Просрочен' :
                             expiryInfo.status === 'critical' ? 'Критический срок' :
                             expiryInfo.status === 'warning' ? 'Скоро истечет' :
                             expiryInfo.status === 'good' ? 'Свежий' : 'Неизвестно'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      
                      {/* Прогресс-бар срока хранения */}
                      {product.expiration_date && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Progress 
                              value={shelfLifeProgress} 
                              className="w-16 h-2"
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Срок хранения: {shelfLifeProgress.toFixed(0)}%</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {onEditProduct && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditProduct(product)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Редактировать</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteProduct(product.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Удалить</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TooltipProvider>
    </div>
  );
}
