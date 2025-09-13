import { Button } from '../ui/button';
import { Package, Maximize2, Minimize2 } from 'lucide-react';
import { Product } from '../../types/api';
import { ProductCard } from './ProductCard';
import { CategoryTabs } from './CategoryTabs';

interface ProductListProps {
  products: Product[];
  activeCategory: string;
  isFullscreen: boolean;
  onCategoryChange: (category: string) => void;
  onFullscreenToggle: () => void;
}

export function ProductList({ 
  products, 
  activeCategory, 
  isFullscreen, 
  onCategoryChange, 
  onFullscreenToggle 
}: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">Нет продуктов</h3>
        <p className="text-gray-500 text-sm mb-4">
          Добавьте первый продукт, нажав кнопку "Добавить" выше
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onFullscreenToggle}
          className="text-gray-600 hover:text-gray-900"
          title={isFullscreen ? "Свернуть" : "Развернуть на весь экран"}
        >
          {isFullscreen ? <Minimize2 size={16} className="mr-2" /> : <Maximize2 size={16} className="mr-2" />}
          {isFullscreen ? "Свернуть" : "Развернуть"}
        </Button>
      </div>
    );
  }

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : activeCategory === 'new'
    ? products.filter(product => {
        const arrivalDate = new Date(product.delivery_date || product.created_at);
        const today = new Date();
        const daysDiff = Math.ceil((today.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 3;
      })
    : products.filter(p => p.category === activeCategory);

  // Группируем продукты по названию
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const key = product.name;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Сортируем каждую группу по дате поступления (новые сверху)
  Object.keys(groupedProducts).forEach(productName => {
    groupedProducts[productName].sort((a, b) => {
      const dateA = new Date(a.delivery_date || a.created_at).getTime();
      const dateB = new Date(b.delivery_date || b.created_at).getTime();
      return dateB - dateA;
    });
  });

  // Создаем массив групп, отсортированный по названию
  const sortedProductGroups = Object.keys(groupedProducts)
    .sort()
    .map(productName => ({
      name: productName,
      batches: groupedProducts[productName]
    }));

  // Определяем, какие продукты имеют несколько партий
  const productCounts = filteredProducts.reduce((acc, product) => {
    acc[product.name] = (acc[product.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Подсчитываем уникальные продукты
  const uniqueProductNames = new Set(products.map(p => p.name)).size;
  const totalBatches = products.length;
  
  // Подсчитываем новые поступления (за последние 3 дня)
  const newArrivals = filteredProducts.filter(product => {
    const arrivalDate = new Date(product.delivery_date || product.created_at);
    const today = new Date();
    const daysDiff = Math.ceil((today.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 3;
  }).length;
  
  const title = uniqueProductNames === totalBatches 
    ? `Продукты (${totalBatches})`
    : `Продукты (${uniqueProductNames} наименований, ${totalBatches} партий)`;
  
  const newArrivalsText = newArrivals > 0 ? ` • ${newArrivals} новых` : '';

  return (
    <div className="space-y-3">
      {/* Вкладки категорий */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            {newArrivalsText && (
              <p className="text-xs text-green-600 font-medium">
                ✨ {newArrivals} новых поступлений за последние 3 дня
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onFullscreenToggle}
            className="h-7 px-2 text-gray-600 hover:text-gray-900"
            title={isFullscreen ? "Свернуть" : "Развернуть на весь экран"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </Button>
        </div>
        
        <CategoryTabs 
          products={products}
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
        />
      </div>
      
      {/* Отфильтрованный список продуктов */}
      <div className="space-y-2">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              {activeCategory === 'new' 
                ? 'Нет новых поступлений за последние 3 дня'
                : activeCategory === 'all'
                ? 'Нет продуктов'
                : `Нет продуктов в категории "${activeCategory}"`
              }
            </p>
          </div>
        ) : (
          sortedProductGroups.map((group) => (
            <ProductCard 
              key={`group-${group.name}`}
              product={group.batches[0]} // Основной продукт (первая партия)
              batches={group.batches} // Все партии
              hasBatches={group.batches.length > 1}
            />
          ))
        )}
      </div>
    </div>
  );
}
