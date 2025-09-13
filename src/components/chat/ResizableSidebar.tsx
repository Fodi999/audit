import { useState, useEffect, ReactNode } from 'react';
import { Button } from '../ui/button';
import { Plus, X } from 'lucide-react';
import { apiService } from '../../lib/api';
import { Product } from '../../types/api';
import { ProductForm } from './ProductForm';
import { ProductList } from './ProductList';

interface ResizableSidebarProps {
  children: ReactNode;
  isOpen: boolean;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  onWidthChange?: (width: number) => void;
  onClose?: () => void;
  onAddProduct?: () => void;
  title?: string;
  userId?: string;
  onProductAdded?: () => void;
}

export function ResizableSidebar({ 
  children, 
  isOpen, 
  initialWidth = 350, 
  minWidth = 300, 
  maxWidth = 600,
  onWidthChange,
  onClose,
  onAddProduct,
  title = "Управление продуктами",
  userId,
  onProductAdded
}: ResizableSidebarProps) {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX;
      const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
      setWidth(clampedWidth);
      onWidthChange?.(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, minWidth, maxWidth, onWidthChange]);

  // Загружаем продукты при открытии панели
  useEffect(() => {
    if (isOpen && userId) {
      loadProducts();
    }
  }, [isOpen, userId]);

  // Обработчик клавиши Escape для выхода из полноэкранного режима
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isFullscreen]);

  const loadProducts = async () => {
    try {
      const response = await apiService.getProducts();
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const handleAddProduct = () => {
    setShowAddForm(true);
    onAddProduct?.();
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    // Форма сама сбросит свое состояние через handleCloseForm в ProductForm
  };

  const handleProductAdded = (product: Product) => {
    setProducts(prev => [...prev, product]);
    onProductAdded?.();
  };

  // Функция для добавления демо-данных с партиями (только для тестирования)
  const addDemoProducts = () => {
    const demoProducts: Product[] = [
      {
        id: 1001,
        name: 'Молоко',
        category: 'dairy',
        quantity: 50,
        price: 85,
        expiration_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        owner_id: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        purchase_date: '2024-01-15',
        delivery_date: '2024-01-15',
        gross_weight: 52,
        net_weight: 50,
        stock: 50
      },
      {
        id: 1002,
        name: 'Молоко',
        category: 'dairy',
        quantity: 30,
        price: 90,
        expiration_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        owner_id: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        purchase_date: '2024-01-20',
        delivery_date: '2024-01-20',
        gross_weight: 32,
        net_weight: 30,
        stock: 30
      },
      {
        id: 1003,
        name: 'Хлеб',
        category: 'bakery',
        quantity: 20,
        price: 45,
        expiration_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        owner_id: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        purchase_date: '2024-01-18',
        delivery_date: '2024-01-18',
        gross_weight: 20,
        net_weight: 20,
        stock: 20
      }
    ];
    
    setProducts(prev => [...prev, ...demoProducts]);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Обработчик закрытия с учетом полноэкранного режима
  const handleClose = () => {
    // Если в полноэкранном режиме, сначала выходим из него
    if (isFullscreen) {
      setIsFullscreen(false);
      // Даем время на анимацию выхода из полноэкранного режима
      setTimeout(() => {
        onClose?.();
      }, 300);
    } else {
      onClose?.();
    }
  };

  return (
    <>
      {/* Затемнение фона в полноэкранном режиме */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 cursor-pointer"
          style={{ zIndex: 19 }}
          onClick={() => setIsFullscreen(false)}
          title="Кликните, чтобы выйти из полноэкранного режима"
        />
      )}
      
      <div 
        className={`fixed top-0 right-0 h-screen bg-white border-l border-gray-200 shadow-2xl transition-all duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${isFullscreen ? 'left-0 w-full' : ''}`}
        style={isFullscreen ? { 
          width: '100vw',
          zIndex: 50
        } : { 
          width: `${width}px`,
          zIndex: 10
        }}
      >
      {/* Разделитель для изменения размера */}
      {!isFullscreen && (
        <div
          className="absolute top-0 left-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-blue-200"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-0.5 h-6 bg-gray-400 opacity-0 hover:opacity-100" />
        </div>
      )}
      
      <div className="h-full flex flex-col">
        {/* Заголовок с кнопками */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {isFullscreen ? `${title} — Полноэкранный режим` : title}
              {isFullscreen && (
                <span className="ml-2 text-xs text-gray-500 font-normal">
                  (ESC или клик по фону для выхода)
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {onAddProduct && (
                <Button 
                  size="sm" 
                  onClick={handleAddProduct}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus size={16} className="mr-1" />
                  Добавить
                </Button>
              )}
              {/* Временная кнопка для демо-данных */}
              <Button 
                size="sm" 
                variant="outline"
                onClick={addDemoProducts}
                className="text-gray-600 hover:text-gray-900"
                title="Добавить тестовые партии продуктов"
              >
                📦 Демо
              </Button>
              {onClose && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700"
                  title={isFullscreen ? "Выйти из полноэкранного режима и закрыть" : "Закрыть склад"}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Форма добавления продукта */}
        <ProductForm
          isOpen={showAddForm}
          isLoading={isLoading}
          onClose={handleCloseForm}
          onProductAdded={handleProductAdded}
          existingProducts={products}
        />
        
        {/* Содержимое */}
        <div className="flex-1 overflow-auto p-4">
          <ProductList
            products={products}
            activeCategory={activeCategory}
            isFullscreen={isFullscreen}
            onCategoryChange={handleCategoryChange}
            onFullscreenToggle={handleFullscreenToggle}
          />
          {children}
        </div>
      </div>
    </div>
    </>
  );
}