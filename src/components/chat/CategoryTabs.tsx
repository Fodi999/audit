import { Button } from '../ui/button';
import { Apple, Beef, Fish, Milk, Wheat, Coffee, Cookie, Carrot, Package } from 'lucide-react';
import { Product } from '../../types/api';

interface CategoryTabsProps {
  products: Product[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
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

export function CategoryTabs({ products, activeCategory, onCategoryChange }: CategoryTabsProps) {
  // Подсчитываем новые поступления
  const newArrivals = products.filter(product => {
    const arrivalDate = new Date(product.delivery_date || product.created_at);
    const today = new Date();
    const daysDiff = Math.ceil((today.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 3;
  }).length;

  return (
    <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-lg">
      <button
        onClick={() => onCategoryChange('all')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
          activeCategory === 'all' 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Все
        <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
          {products.length}
        </span>
      </button>
      
      {/* Кнопка для новых поступлений */}
      {newArrivals > 0 && (
        <button
          onClick={() => onCategoryChange('new')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeCategory === 'new' 
              ? 'bg-green-500 text-white shadow-sm' 
              : 'text-green-600 hover:text-green-700 bg-green-50'
          }`}
        >
          ✨ Новые
          <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
            activeCategory === 'new' 
              ? 'bg-green-600 text-green-100' 
              : 'bg-green-200 text-green-700'
          }`}>
            {newArrivals}
          </span>
        </button>
      )}
      
      {categories.map((category) => {
        const categoryProducts = products.filter(p => p.category === category.name);
        
        if (categoryProducts.length === 0) return null;
        
        const IconComponent = category.icon;
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.name)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
              activeCategory === category.name 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <IconComponent size={12} />
            {category.name}
            <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
              {categoryProducts.length}
            </span>
          </button>
        );
      })}
    </div>
  );
}
