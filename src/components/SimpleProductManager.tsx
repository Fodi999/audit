'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { apiService } from '@/lib/api';
import { Product } from '@/types/api';
import { toast } from 'sonner';
import { 
  Package, 
  Carrot, 
  Apple, 
  Beef, 
  Fish, 
  Milk, 
  Wheat, 
  Sparkles, 
  Leaf,
  Plus,
  Calendar,
  Trash2,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ProductManagerProps {
  userId: string;
  onStatsUpdate?: (stats: { totalCost: number; totalWaste: number; productCount: number; expiringCount?: number }) => void;
}

export function ProductManager({ userId, onStatsUpdate }: ProductManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: '1',
    price: '',
    category: 'other',
    location: '',
    notes: '',
    purchase_date: new Date().toISOString().split('T')[0],
    expiration_date: '',
  });

  // Категории продуктов с иконками
  const productCategories = [
    { id: 'other', name: 'Общие', icon: Package },
    { id: 'vegetables', name: 'Овощи', icon: Carrot },
    { id: 'fruits', name: 'Фрукты', icon: Apple },
    { id: 'meat', name: 'Мясо', icon: Beef },
    { id: 'fish', name: 'Рыба', icon: Fish },
    { id: 'dairy', name: 'Молочные', icon: Milk },
    { id: 'bakery', name: 'Выпечка', icon: Wheat },
    { id: 'cereals', name: 'Крупы', icon: Sparkles },
    { id: 'spices', name: 'Специи', icon: Leaf },
  ];

  // Фильтрация продуктов по категории
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  useEffect(() => {
    loadProducts();
  }, []);

  // Обновляем статистику при изменении продуктов
  useEffect(() => {
    if (onStatsUpdate && products.length >= 0) {
      const totalCost = filteredProducts.reduce((sum, product) => {
        return sum + (product.price * product.quantity);
      }, 0);
      
      // Подсчитываем продукты с истекающим сроком годности (в течение 3 дней)
      const expiringCount = filteredProducts.filter(product => {
        if (!product.expiration_date) return false;
        
        const expDate = new Date(product.expiration_date);
        const today = new Date();
        const daysDiff = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return daysDiff >= 0 && daysDiff <= 3;
      }).length;
      
      const stats = {
        totalCost: Math.round(totalCost),
        totalWaste: 0, // Пока не считаем отходы в упрощенной версии
        productCount: filteredProducts.length,
        expiringCount: expiringCount
      };
      
      onStatsUpdate(stats);
    }
  }, [products, onStatsUpdate, filteredProducts]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const result = await apiService.getProducts();
      if (result.success) {
        const products = result.data || [];
        setProducts(products);
      } else {
        toast.error(result.error || 'Ошибка загрузки продуктов');
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error('Ошибка сети');
    } finally {
      setIsLoading(false);
    }
  };

  const addProduct = async () => {
    const missingFields = [];
    if (!newProduct.name.trim()) missingFields.push('название продукта');
    if (!newProduct.quantity) missingFields.push('количество');
    if (!newProduct.price) missingFields.push('цена');
    
    if (missingFields.length > 0) {
      toast.error(`Заполните поля: ${missingFields.join(', ')}`);
      return;
    }

    setIsLoading(true);
    try {
      const productData = {
        name: newProduct.name,
        category: newProduct.category,
        price: parseFloat(newProduct.price),
        quantity: parseInt(newProduct.quantity),
        purchase_date: newProduct.purchase_date,
        expiration_date: newProduct.expiration_date || undefined,
        location: newProduct.location,
        notes: newProduct.notes,
      };

      const result = await apiService.createProduct(productData);

      if (result.success) {
        toast.success('Продукт добавлен!');
        setNewProduct({ 
          name: '', 
          quantity: '1',
          price: '', 
          category: 'other', 
          location: '', 
          notes: '',
          purchase_date: new Date().toISOString().split('T')[0],
          expiration_date: ''
        });
        setIsPopoverOpen(false);
        loadProducts();
      } else {
        toast.error(result.error || 'Ошибка добавления продукта');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ошибка сети');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (productId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот продукт?')) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiService.deleteProduct(productId);
      
      if (result.success) {
        toast.success('Продукт удален!');
        await loadProducts();
      } else {
        toast.error(result.error || 'Ошибка при удалении продукта');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Ошибка сети при удалении продукта');
    } finally {
      setIsLoading(false);
    }
  };

  const getExpirationStatus = (expirationDate?: string) => {
    if (!expirationDate) return null;
    
    const expDate = new Date(expirationDate);
    const today = new Date();
    const daysDiff = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return { status: 'expired', color: 'bg-red-400', text: 'просрочен' };
    if (daysDiff <= 3) return { status: 'expiring', color: 'bg-orange-400', text: `истекает через ${daysDiff} дн.` };
    if (daysDiff <= 7) return { status: 'soon', color: 'bg-yellow-400', text: `через ${daysDiff} дн.` };
    return { status: 'fresh', color: 'bg-green-400', text: 'свежий' };
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Кнопка добавления продукта */}
      <div className="flex justify-center">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <Plus size={16} />
              Добавить продукт
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 bg-gray-800 border-gray-600/30">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-200">Добавить продукт</h3>
              
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Название продукта"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-500"
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="bg-gray-700/30 border-gray-600/30 text-gray-200">
                      <SelectValue placeholder="Категория" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600/30">
                      {productCategories.map((category) => {
                        const IconComponent = category.icon;
                        return (
                          <SelectItem 
                            key={category.id} 
                            value={category.id}
                            className="text-gray-200 focus:bg-gray-700/50"
                          >
                            <div className="flex items-center gap-2">
                              <IconComponent size={14} />
                              {category.name}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="number"
                    placeholder="Цена (₽)"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                    className="bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Количество"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, quantity: e.target.value }))}
                    className="bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-500"
                  />
                  <Input
                    type="text"
                    placeholder="Местоположение"
                    value={newProduct.location}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, location: e.target.value }))}
                    className="bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Дата покупки</label>
                    <Input
                      type="date"
                      value={newProduct.purchase_date}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, purchase_date: e.target.value }))}
                      className="bg-gray-700/30 border-gray-600/30 text-gray-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Срок годности</label>
                    <Input
                      type="date"
                      value={newProduct.expiration_date}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, expiration_date: e.target.value }))}
                      className="bg-gray-700/30 border-gray-600/30 text-gray-200"
                    />
                  </div>
                </div>
                
                <Input
                  type="text"
                  placeholder="Заметки (опционально)"
                  value={newProduct.notes}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, notes: e.target.value }))}
                  className="bg-gray-700/30 border-gray-600/30 text-gray-200 placeholder-gray-500"
                />
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setIsPopoverOpen(false)}
                    variant="outline"
                    className="flex-1 bg-transparent border-gray-600/30 text-gray-400 hover:bg-gray-700/30 hover:text-gray-200"
                  >
                    Отмена
                  </Button>
                  <Button 
                    onClick={addProduct} 
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? 'Добавляю...' : 'Добавить'}
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Селектор категорий */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Package size={20} className="text-gray-400" />
            <span className="text-lg font-medium text-gray-200">Продукты</span>
          </div>
          
          <div className="flex-1 max-w-xs">
            <Select value={activeCategory} onValueChange={setActiveCategory}>
              <SelectTrigger className="bg-gray-800/50 border-gray-700/30 text-gray-200">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600/30">
                <SelectItem value="all" className="text-gray-200 focus:bg-gray-700/50">
                  Все категории ({products.length})
                </SelectItem>
                {productCategories.map((category) => {
                  const categoryProducts = products.filter(p => p.category === category.id);
                  const IconComponent = category.icon;
                  
                  return (
                    <SelectItem 
                      key={category.id} 
                      value={category.id}
                      className="text-gray-200 focus:bg-gray-700/50"
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent size={14} />
                        <span>{category.name} ({categoryProducts.length})</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Список продуктов */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-400">Загрузка продуктов...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-600 mb-4" />
            <div className="text-gray-400 mb-2">Продуктов пока нет</div>
            <div className="text-gray-500 text-sm">Добавьте первый продукт выше</div>
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {filteredProducts.map((product) => {
              const category = productCategories.find(cat => cat.id === product.category);
              const IconComponent = category?.icon || Package;
              const totalCost = product.price * product.quantity;
              const expirationStatus = getExpirationStatus(product.expiration_date);
              
              return (
                <AccordionItem 
                  key={product.id} 
                  value={`product-${product.id}`}
                  className="bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center justify-between w-full mr-3">
                      <div className="flex items-center gap-3">
                        <IconComponent size={18} className="text-gray-400" />
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-200 font-medium">{product.name}</span>
                            {expirationStatus && (
                              <div className={`w-2 h-2 rounded-full ${expirationStatus.color}`} />
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {category?.name || 'Общее'} • {product.quantity} шт.
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-200">{totalCost.toFixed(0)}₽</div>
                        <div className="text-xs text-gray-500">{product.price}₽ за шт.</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-4 pb-3">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Количество:</span>
                            <span className="text-gray-300 font-medium">{product.quantity} шт.</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Цена:</span>
                            <span className="text-gray-300 font-medium">{product.price}₽</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Общая стоимость:</span>
                            <span className="text-green-400 font-medium">{totalCost.toFixed(0)}₽</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Дата покупки:</span>
                            <span className="text-gray-300 font-medium">
                              {new Date(product.purchase_date).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                          {product.expiration_date && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Срок годности:</span>
                              <span className={`font-medium ${
                                expirationStatus?.status === 'expired' ? 'text-red-400' :
                                expirationStatus?.status === 'expiring' ? 'text-orange-400' :
                                expirationStatus?.status === 'soon' ? 'text-yellow-400' :
                                'text-green-400'
                              }`}>
                                {new Date(product.expiration_date).toLocaleDateString('ru-RU')}
                                {expirationStatus && ` (${expirationStatus.text})`}
                              </span>
                            </div>
                          )}
                          {product.location && (
                            <div className="flex justify-between">
                              <span className="text-gray-400 flex items-center gap-1">
                                <MapPin size={10} />
                                Местоположение:
                              </span>
                              <span className="text-gray-300 font-medium">{product.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {product.notes && (
                        <div className="bg-gray-800/40 rounded-md p-2">
                          <div className="text-xs text-gray-400 mb-1">Заметки:</div>
                          <div className="text-sm text-gray-300">{product.notes}</div>
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-400 border-red-400/30 hover:bg-red-400/10 hover:border-red-400"
                          disabled={isLoading}
                        >
                          <Trash2 size={14} />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </div>
  );
}
