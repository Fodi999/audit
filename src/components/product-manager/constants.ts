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
  Snowflake,
  Coffee,
  Cookie,
  Heart
} from 'lucide-react';

// Категории продуктов с иконками (расширенные для склада)
export const productCategories = [
  { id: 'other', name: 'Общие', icon: Package },
  { id: 'vegetables', name: 'Овощи', icon: Carrot },
  { id: 'fruits', name: 'Фрукты', icon: Apple },
  { id: 'meat', name: 'Мясо', icon: Beef },
  { id: 'fish', name: 'Рыба', icon: Fish },
  { id: 'dairy', name: 'Молочные', icon: Milk },
  { id: 'bakery', name: 'Выпечка', icon: Wheat },
  { id: 'cereals', name: 'Крупы', icon: Sparkles },
  { id: 'spices', name: 'Специи', icon: Leaf },
  { id: 'frozen', name: 'Заморозка', icon: Snowflake },
  { id: 'beverages', name: 'Напитки', icon: Coffee },
  { id: 'canned', name: 'Консервы', icon: Cookie },
  { id: 'health', name: 'Здоровье', icon: Heart },
];

// Единицы измерения
export const measurementUnits = [
  { id: 'kg', name: 'кг', type: 'weight' },
  { id: 'g', name: 'г', type: 'weight' },
  { id: 'l', name: 'л', type: 'volume' },
  { id: 'ml', name: 'мл', type: 'volume' },
  { id: 'pcs', name: 'шт', type: 'piece' },
  { id: 'pack', name: 'упак', type: 'package' },
  { id: 'box', name: 'кор', type: 'package' },
];

// Статусы продуктов на складе
export const productStatuses = [
  { id: 'active', name: 'В наличии', color: 'green' },
  { id: 'expiring', name: 'Истекает', color: 'orange' },
  { id: 'expired', name: 'Просрочен', color: 'red' },
  { id: 'reserved', name: 'Зарезервирован', color: 'blue' },
  { id: 'sold', name: 'Продан', color: 'gray' },
];

// Варианты срока годности в днях
export const expirationDays = [
  { value: '1', label: '1 день' },
  { value: '2', label: '2 дня' },
  { value: '3', label: '3 дня' },
  { value: '5', label: '5 дней' },
  { value: '7', label: '1 неделя' },
  { value: '10', label: '10 дней' },
  { value: '14', label: '2 недели' },
  { value: '21', label: '3 недели' },
  { value: '30', label: '1 месяц' },
];

// Популярные продукты для быстрого выбора
export const popularProducts = [
  // Овощи
  { name: 'Картофель', category: 'vegetables', icon: '🥔', price: 45 },
  { name: 'Морковь', category: 'vegetables', icon: '🥕', price: 65 },
  { name: 'Лук репчатый', category: 'vegetables', icon: '🧅', price: 35 },
  { name: 'Помидоры', category: 'vegetables', icon: '🍅', price: 180 },
  { name: 'Огурцы', category: 'vegetables', icon: '🥒', price: 120 },
  { name: 'Капуста белокочанная', category: 'vegetables', icon: '🥬', price: 40 },
  
  // Фрукты
  { name: 'Яблоки', category: 'fruits', icon: '🍎', price: 95 },
  { name: 'Бананы', category: 'fruits', icon: '🍌', price: 75 },
  { name: 'Апельсины', category: 'fruits', icon: '🍊', price: 120 },
  { name: 'Груши', category: 'fruits', icon: '🍐', price: 110 },
  
  // Мясо
  { name: 'Говядина', category: 'meat', icon: '🥩', price: 650 },
  { name: 'Свинина', category: 'meat', icon: '🥓', price: 420 },
  { name: 'Курица', category: 'meat', icon: '🍗', price: 280 },
  { name: 'Фарш говяжий', category: 'meat', icon: '🍖', price: 480 },
  
  // Молочные
  { name: 'Молоко', category: 'dairy', icon: '🥛', price: 65 },
  { name: 'Творог', category: 'dairy', icon: '🧀', price: 180 },
  { name: 'Сметана', category: 'dairy', icon: '🥄', price: 120 },
  { name: 'Масло сливочное', category: 'dairy', icon: '🧈', price: 320 },
  
  // Рыба
  { name: 'Семга', category: 'fish', icon: '🐟', price: 850 },
  { name: 'Треска', category: 'fish', icon: '🐠', price: 380 },
  { name: 'Скумбрия', category: 'fish', icon: '🐡', price: 220 },
  
  // Крупы
  { name: 'Рис', category: 'cereals', icon: '🍚', price: 85 },
  { name: 'Гречка', category: 'cereals', icon: '🌾', price: 95 },
  { name: 'Овсянка', category: 'cereals', icon: '🥣', price: 65 },
  
  // Выпечка
  { name: 'Хлеб белый', category: 'bakery', icon: '🍞', price: 45 },
  { name: 'Хлеб черный', category: 'bakery', icon: '🍞', price: 50 },
  { name: 'Батон', category: 'bakery', icon: '🥖', price: 35 },
];

// Типы для форм
export interface NewProductForm {
  name: string;
  quantity: string;
  price: string;
  category: string;
  notes: string;
  imageFile: File | null;
  imagePreview: string;
  purchase_date: string;
  expiration_date: string;
}

export interface ProductManagerProps {
  userId: string;
  onStatsUpdate?: (stats: { 
    totalCost: number; 
    totalWaste: number; 
    productCount: number; 
    expiringCount?: number 
  }) => void;
}

// Массив категорий для фильтров
export const CATEGORIES = [
  'Молочные продукты',
  'Мясо и птица',
  'Рыба и морепродукты',
  'Овощи',
  'Фрукты',
  'Хлеб и выпечка',
  'Крупы и макароны',
  'Консервы',
  'Напитки',
  'Заморозка',
  'Другое'
];
