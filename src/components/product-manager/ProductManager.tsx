'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/api';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

import { SimpleAddProductForm } from './SimpleAddProductForm';
import { ProductList } from './ProductList';

interface ProductManagerProps {
  userId: string;
  onStatsUpdate?: (stats: {
    totalCost: number;
    totalWaste: number;
    productCount: number;
    expiringCount: number;
  }) => void;
}

export function ProductManager({ userId, onStatsUpdate }: ProductManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Загрузка продуктов
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const result = await apiService.getProducts();
      if (result.success && result.data) {
        setProducts(result.data);
        console.log('Products loaded:', result.data.length);
      } else {
        console.error('Error loading products:', result.error);
        toast.error(result.error || 'Ошибка загрузки продуктов');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Ошибка загрузки продуктов');
    } finally {
      setIsLoading(false);
    }
  };

  // Добавление продукта
  const handleAddProduct = async (productData: Omit<Product, 'id' | 'owner_id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      // Конвертируем дату поступления в RFC3339 формат для бэкенда
      const deliveryDateTime = productData.purchase_date 
        ? new Date(productData.purchase_date + 'T00:00:00Z').toISOString()
        : new Date().toISOString();

      // Конвертируем дату истечения в RFC3339 формат для бэкенда (если есть)
      const expirationDateTime = productData.expiration_date
        ? new Date(productData.expiration_date + 'T00:00:00Z').toISOString()
        : '';
      
      const result = await apiService.createProductWithDelivery({
        name: productData.name,
        category: productData.category,
        price: productData.price,
        quantity: productData.quantity,
        net_weight: productData.net_weight || 0,
        delivery_date: deliveryDateTime,
        expiration_date: expirationDateTime,
        image_url: productData.image_url || '',
        description: productData.notes || ''
      });
      
      if (result.success && result.data) {
        setProducts(prev => [result.data!, ...prev]);
        toast.success('Продукт добавлен успешно');
        return true;
      } else {
        console.error('Error adding product:', result.error);
        toast.error(result.error || 'Ошибка добавления продукта');
        return false;
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Ошибка добавления продукта');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление продукта
  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот продукт?')) {
      return;
    }

    try {
      const result = await apiService.deleteProduct(productId);
      if (result.success) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        toast.success('Продукт удален');
      } else {
        console.error('Error deleting product:', result.error);
        toast.error(result.error || 'Ошибка удаления продукта');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Ошибка удаления продукта');
    }
  };

  // Фильтрация продуктов
  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  // Обновление статистики
  useEffect(() => {
    if (onStatsUpdate && products.length >= 0) {
      const totalCost = products.reduce((sum, product) => 
        sum + (product.price * product.quantity), 0
      );

      const today = new Date();
      const expiringCount = products.filter(product => {
        if (!product.expiration_date) return false;
        const expiry = new Date(product.expiration_date);
        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 3;
      }).length;

      const stats = {
        totalCost: Math.round(totalCost),
        totalWaste: 0, // TODO: Реализовать подсчет waste
        productCount: products.length,
        expiringCount
      };

      onStatsUpdate(stats);
    }
  }, [products, onStatsUpdate]);

  // Загрузка при монтировании
  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Заголовок склада */}
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">Склад продуктов</h1>
      </div>

      {/* Кнопка добавления по центру */}
      <div className="flex justify-center px-2 sm:px-0">
        <SimpleAddProductForm 
          onAddProduct={handleAddProduct}
          isLoading={isLoading}
        />
      </div>

      {/* Основной интерфейс */}
      <div className="space-y-3 sm:space-y-6">
        {/* Список продуктов */}
        {isLoading ? (
          <Card className="mx-3 sm:mx-4">
            <CardContent className="flex items-center justify-center py-6 sm:py-8 lg:py-12">
              <div className="text-center space-y-2 sm:space-y-3 lg:space-y-4">
                <div className="inline-block animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 border-b-2 border-slate-700"></div>
                <p className="text-slate-600 text-xs sm:text-sm lg:text-base">Загрузка продуктов...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ProductList
            products={filteredProducts}
            onDeleteProduct={handleDeleteProduct}
          />
        )}
      </div>
    </div>
  );
}
