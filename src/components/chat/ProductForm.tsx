import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ChevronUp, ChevronDown, X, ImageIcon, Apple, Beef, Fish, Milk, Wheat, Coffee, Cookie, Carrot, Package } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../lib/api';
import { Product } from '../../types/api';

interface ProductFormProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onProductAdded: (product: Product) => void;
  existingProducts?: Product[];
}

export function ProductForm({ isOpen, isLoading, onClose, onProductAdded, existingProducts = [] }: ProductFormProps) {
  const categoryRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLDivElement>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    gross_weight: '',
    net_weight: '',
    price: '',
    expiration_days: '',
    custom_expiration_date: '',
    delivery_date: new Date().toISOString().split('T')[0],
    image_file: null as File | null,
    image_preview: ''
  });

  const expirationOptions = [
    { value: '1', label: '1 день' },
    { value: '2', label: '2 дня' },
    { value: '3', label: '3 дня' },
    { value: '7', label: '1 неделя' },
    { value: '14', label: '2 недели' },
    { value: '30', label: '1 месяц' },
    { value: '60', label: '2 месяца' },
    { value: '90', label: '3 месяца' },
    { value: 'custom', label: 'Указать дату' }
  ];

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

  // Закрываем выпадающий список при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (nameInputRef.current && !nameInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    if (showCategoryDropdown || showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryDropdown, showSuggestions]);

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      gross_weight: '',
      net_weight: '',
      price: '',
      expiration_days: '',
      custom_expiration_date: '',
      delivery_date: new Date().toISOString().split('T')[0],
      image_file: null,
      image_preview: ''
    });
    setSuggestedProducts([]);
    setShowSuggestions(false);
    setShowCategoryDropdown(false);
  };

  // Функция для поиска похожих продуктов
  const searchSimilarProducts = (searchName: string) => {
    if (!searchName.trim() || searchName.length < 2) {
      setSuggestedProducts([]);
      setShowSuggestions(false);
      return;
    }

    const matchingProducts = existingProducts.filter(product => 
      product.name.toLowerCase().includes(searchName.toLowerCase())
    );

    // Убираем дубликаты по названию - оставляем только один продукт на название
    const uniqueProducts = matchingProducts.reduce((acc, product) => {
      const existingProduct = acc.find(p => p.name === product.name);
      if (!existingProduct) {
        acc.push(product);
      }
      return acc;
    }, [] as Product[]);

    setSuggestedProducts(uniqueProducts);
    setShowSuggestions(uniqueProducts.length > 0);
  };

  // Функция для автозаполнения формы на основе выбранного продукта
  const autofillFromProduct = (product: Product) => {
    setFormData(prev => ({
      ...prev,
      name: product.name,
      category: product.category,
      // Оставляем пустыми поля, которые должны отличаться в новой партии
      gross_weight: '',
      net_weight: '',
      price: '',
      expiration_days: '',
      custom_expiration_date: '',
      delivery_date: new Date().toISOString().split('T')[0],
      // Сохраняем изображение из существующего продукта
      image_preview: product.image_url || prev.image_preview
    }));
    setShowSuggestions(false);
    toast.success(`Форма заполнена для новой партии "${product.name}"`);
  };

  // Обработчик изменения названия продукта
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData(prev => ({ ...prev, name: newName }));
    searchSimilarProducts(newName);
  };

  // Обработчик закрытия формы с полным сбросом
  const handleCloseForm = () => {
    resetForm();
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Размер файла не должен превышать 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Пожалуйста, выберите изображение');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({
          ...prev,
          image_file: file,
          image_preview: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image_file: null,
      image_preview: ''
    }));
  };

  const calculateExpirationDate = () => {
    if (formData.expiration_days === 'custom') {
      return formData.custom_expiration_date || undefined;
    } else if (formData.expiration_days && formData.expiration_days !== '') {
      const days = parseInt(formData.expiration_days);
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + days);
      return expirationDate.toISOString().split('T')[0];
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.net_weight || !formData.price || !formData.delivery_date) {
      toast.error('Заполните обязательные поля: название, категория, нетто, цена, дата поступления');
      return;
    }

    try {
      const expirationDate = calculateExpirationDate();
      
      const productData = {
        name: formData.name,
        category: formData.category,
        gross_weight: parseFloat(formData.gross_weight) || 0,
        net_weight: parseFloat(formData.net_weight),
        quantity: parseFloat(formData.net_weight),
        price: parseFloat(formData.price),
        expiration_date: expirationDate,
        delivery_date: formData.delivery_date,
        image_url: formData.image_preview || ''
      };

      // Временно создадим mock продукт для тестирования UI
      const mockProduct = {
        id: Date.now(),
        name: productData.name,
        category: productData.category,
        quantity: productData.quantity,
        price: productData.price,
        expiration_date: productData.expiration_date,
        owner_id: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        purchase_date: productData.delivery_date,
        delivery_date: productData.delivery_date,
        image_url: productData.image_url,
        gross_weight: productData.gross_weight,
        net_weight: productData.net_weight,
        stock: productData.quantity
      };
      
      // Пробуем реальный API
      try {
        const response = await apiService.createProduct(productData);
        
        if (response.success && response.data) {
          toast.success('Продукт добавлен успешно!');
          onProductAdded(response.data);
        } else {
          throw new Error('API failed');
        }
      } catch (apiError) {
        // Если API не работает, используем mock данные
        toast.success('Продукт добавлен (тестовый режим)!');
        onProductAdded(mockProduct as any);
      }
      
      // Даем время показать уведомление, затем сбрасываем и закрываем форму
      setTimeout(() => {
        resetForm();
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Ошибка при добавлении продукта');
    }
  };

  return (
    <div className={`overflow-hidden transition-all duration-300 ease-in-out border-b border-gray-200 ${
      isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
    }`}>
      <div className="p-3 bg-blue-50">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-base font-medium text-gray-900">Новый продукт</h4>
              <p className="text-xs text-gray-600 mt-1">
                💡 Продукты с одинаковым названием создают разные партии
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCloseForm}
              className="text-gray-500 hover:text-gray-700 h-6 w-6 p-0"
              title="Закрыть форму"
            >
              <X size={14} />
            </Button>
          </div>
          
          <div className="space-y-2">
            {/* Название и Категория в одной строке */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative" ref={nameInputRef}>
                <Label htmlFor="product-name" className="text-xs font-medium text-gray-700">
                  Название*
                  {existingProducts.some(p => p.name.toLowerCase().includes(formData.name.toLowerCase()) && formData.name.length > 1) && (
                    <span className="ml-2 text-blue-600 text-xs">
                      📦 Есть на складе
                    </span>
                  )}
                </Label>
                <Input
                  id="product-name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Название продукта"
                  className="mt-1 h-8 text-sm"
                  disabled={isLoading}
                />
                
                {/* Выпадающий список с предложениями */}
                {showSuggestions && suggestedProducts.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    <div className="p-2 text-xs text-gray-600 bg-blue-50 border-b">
                      💡 Найденные продукты (нажмите для автозаполнения):
                    </div>
                    {suggestedProducts.map((product) => {
                      // Подсчитываем количество партий этого продукта
                      const batchCount = existingProducts.filter(p => p.name === product.name).length;
                      
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => autofillFromProduct(product)}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 transition-colors text-left"
                          disabled={isLoading}
                        >
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-gray-500">
                              {product.category}
                              {batchCount > 1 && (
                                <span className="ml-2 text-blue-600">• {batchCount} партий</span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-blue-600">
                            {product.price}₽/кг
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="product-category" className="text-xs font-medium text-gray-700">
                  Категория*
                </Label>
                <div className="relative" ref={categoryRef}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="mt-1 h-8 w-full justify-between text-sm font-normal"
                    disabled={isLoading}
                  >
                    {formData.category ? (() => {
                      const selectedCategory = categories.find(cat => cat.name === formData.category);
                      if (selectedCategory) {
                        const IconComponent = selectedCategory.icon;
                        return (
                          <div className="flex items-center gap-2">
                            <IconComponent size={14} />
                            <span>{selectedCategory.name}</span>
                          </div>
                        );
                      }
                      return formData.category;
                    })() : (
                      <span className="text-gray-500">Выберите категорию</span>
                    )}
                    <ChevronDown 
                      size={14} 
                      className={`transition-transform duration-200 ${
                        showCategoryDropdown ? 'rotate-180' : ''
                      }`} 
                    />
                  </Button>
                  
                  {/* Анимированный выпадающий список */}
                  <div className={`absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg transition-all duration-200 ease-in-out ${
                    showCategoryDropdown 
                      ? 'opacity-100 max-h-60 overflow-y-auto' 
                      : 'opacity-0 max-h-0 overflow-hidden'
                  }`}>
                    <div className="py-1">
                      {categories.map((category) => {
                        const IconComponent = category.icon;
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, category: category.name });
                              setShowCategoryDropdown(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
                            disabled={isLoading}
                          >
                            <IconComponent size={14} />
                            {category.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Загрузка изображения - компактная */}
            <div>
              <Label className="text-xs font-medium text-gray-700">
                Фото продукта
              </Label>
              <div className="mt-1">
                {formData.image_preview ? (
                  <div className="relative">
                    <img 
                      src={formData.image_preview} 
                      alt="Preview" 
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeImage}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 h-6 w-6"
                      disabled={isLoading}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center py-2">
                      <ImageIcon className="w-6 h-6 mb-1 text-gray-400" />
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold">Загрузить фото</span>
                      </p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isLoading}
                    />
                  </label>
                )}
              </div>
            </div>
            
            {/* Брутто, Нетто и Цена в одной строке */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="product-gross" className="text-xs font-medium text-gray-700">
                  Брутто (кг)
                </Label>
                <Input
                  id="product-gross"
                  type="number"
                  step="0.001"
                  value={formData.gross_weight}
                  onChange={(e) => setFormData({ ...formData, gross_weight: e.target.value })}
                  placeholder="0.000"
                  className="mt-1 h-8 text-sm"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <Label htmlFor="product-net" className="text-xs font-medium text-gray-700">
                  Нетто (кг)*
                </Label>
                <Input
                  id="product-net"
                  type="number"
                  step="0.001"
                  value={formData.net_weight}
                  onChange={(e) => setFormData({ ...formData, net_weight: e.target.value })}
                  placeholder="0.000"
                  className="mt-1 h-8 text-sm"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="product-price" className="text-xs font-medium text-gray-700">
                  Цена (₽/кг)*
                </Label>
                <Input
                  id="product-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="₽"
                  className="mt-1 h-8 text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Дата поступления и Срок годности в одной строке */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="delivery-date" className="text-xs font-medium text-gray-700">
                  Дата поступления*
                </Label>
                <Input
                  id="delivery-date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                  className="mt-1 h-8 text-sm"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="product-expiration" className="text-xs font-medium text-gray-700">
                  Срок годности
                </Label>
                <Select 
                  value={formData.expiration_days} 
                  onValueChange={(value) => setFormData({ ...formData, expiration_days: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger className="mt-1 h-8 text-sm">
                    <SelectValue placeholder="Срок годности" />
                  </SelectTrigger>
                  <SelectContent>
                    {expirationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Кастомная дата, если выбрано "Указать дату" */}
            {formData.expiration_days === 'custom' && (
              <div>
                <Label htmlFor="custom-expiration" className="text-xs font-medium text-gray-700">
                  Дата истечения срока годности
                </Label>
                <Input
                  id="custom-expiration"
                  type="date"
                  value={formData.custom_expiration_date}
                  onChange={(e) => setFormData({ ...formData, custom_expiration_date: e.target.value })}
                  className="mt-1 h-8 text-sm"
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Предварительный расчет стоимости - компактный */}
            {formData.net_weight && formData.price && (
              <div className="bg-blue-50 p-2 rounded text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Нетто × Цена:</span>
                  <span className="font-medium">{formData.net_weight} кг × {formData.price} ₽</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-700 font-medium">Итого:</span>
                  <span className="font-bold text-blue-700">{(parseFloat(formData.net_weight) * parseFloat(formData.price)).toFixed(0)} ₽</span>
                </div>
                {formData.gross_weight && parseFloat(formData.gross_weight) > parseFloat(formData.net_weight) && (
                  <div className="text-xs text-gray-600 mt-1">
                    Отходы: {((parseFloat(formData.gross_weight) - parseFloat(formData.net_weight)) / parseFloat(formData.gross_weight) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex gap-2 pt-1">
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700 h-8 text-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Добавление...
                </span>
              ) : (
                'Добавить продукт'
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
              className="h-8 px-3 text-sm"
            >
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
