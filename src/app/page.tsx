'use client';

import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Auth } from '@/components/Auth';
import { ChatBot } from '@/components/ChatBot';
import { ProductManager } from '@/components/ProductManager';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/api';

interface ProductDelivery {
  total_cost: string | number;
  gross_weight: string | number;
  waste_percentage: string | number;
}

interface ProductWithDeliveries extends Product {
  deliveries?: ProductDelivery[];
  stock?: string | number;
  price_per_kg?: string | number;
  waste_percentage?: string | number;
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'chat' | 'products' | 'recipes'>('chat');
  const [showProductSidebar, setShowProductSidebar] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(350);
  
  // Состояние для статистики склада
  const [warehouseStats, setWarehouseStats] = useState({
    totalCost: 0,
    totalWaste: 0,
    productCount: 0,
    expiringCount: 0 // Количество продуктов с истекающим сроком годности
  });

  const handleProductSidebarChange = (show: boolean) => {
    console.log('handleProductSidebarChange called with:', show);
    setShowProductSidebar(show);
  };

  // Функция для обновления статистики склада
  const handleWarehouseStatsUpdate = (stats: { totalCost: number; totalWaste: number; productCount: number; expiringCount?: number }) => {
    console.log('handleWarehouseStatsUpdate called with:', stats);
    setWarehouseStats({
      totalCost: stats.totalCost,
      totalWaste: stats.totalWaste,
      productCount: stats.productCount,
      expiringCount: stats.expiringCount || 0
    });
  };

  // Загружаем продукты для статистики независимо от активного вида
  useEffect(() => {
    const loadProducts = async () => {
      if (userId) {
        try {
          const response = await apiService.getProducts();
          const products = response.data || [];
          
          // Функция для расчета статистики продукта
          const getProductTotalStats = (product: ProductWithDeliveries) => {
            if (!product.deliveries || product.deliveries.length === 0) {
              // Используем основные поля продукта
              const stock = parseFloat(String(product.stock || 0)) || 0;
              const price = parseFloat(String(product.price_per_kg || product.price || 0)) || 0;
              const wastePercent = parseFloat(String(product.waste_percentage || 0)) || 0;
              
              return {
                totalCost: isNaN(stock * price) ? 0 : stock * price,
                totalWasteWeight: isNaN(stock * wastePercent / 100) ? 0 : stock * wastePercent / 100
              };
            }
            
            // Суммируем по всем поступлениям
            return product.deliveries.reduce((acc: { totalCost: number; totalWasteWeight: number }, delivery: ProductDelivery) => {
              const totalCost = parseFloat(String(delivery.total_cost)) || 0;
              const grossWeight = parseFloat(String(delivery.gross_weight)) || 0;
              const wastePercent = parseFloat(String(delivery.waste_percentage)) || 0;
              const wasteWeight = grossWeight * wastePercent / 100;
              
              return {
                totalCost: acc.totalCost + (isNaN(totalCost) ? 0 : totalCost),
                totalWasteWeight: acc.totalWasteWeight + (isNaN(wasteWeight) ? 0 : wasteWeight)
              };
            }, { totalCost: 0, totalWasteWeight: 0 });
          };
          
          // Вычисляем статистику
          const totalCost = products.reduce((sum: number, product: ProductWithDeliveries) => {
            const stats = getProductTotalStats(product);
            return sum + (isNaN(stats.totalCost) ? 0 : stats.totalCost);
          }, 0);
          
          const totalWaste = products.reduce((sum: number, product: ProductWithDeliveries) => {
            const stats = getProductTotalStats(product);
            return sum + (isNaN(stats.totalWasteWeight) ? 0 : stats.totalWasteWeight);
          }, 0);
          
          // Подсчитываем продукты с истекающим сроком годности (в течение 3 дней)
          const expiringCount = products.filter((product: ProductWithDeliveries) => {
            if (!product.expiration_date) return false;
            
            const expDate = new Date(product.expiration_date);
            const today = new Date();
            const daysDiff = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            return daysDiff >= 0 && daysDiff <= 3; // Истекает в течение 3 дней (включая сегодня)
          }).length;
          
          const stats = {
            totalCost: isNaN(totalCost) ? 0 : Math.round(totalCost),
            totalWaste: isNaN(totalWaste) ? 0 : Math.round(totalWaste * 10) / 10,
            productCount: products.length,
            expiringCount: expiringCount
          };
          
          setWarehouseStats(stats);
        } catch (error) {
          console.error('Error loading products for stats:', error);
        }
      }
    };
    
    loadProducts();
  }, [userId]);

  useEffect(() => {
    // Проверяем, есть ли сохраненный пользователь
    const savedUserId = apiService.getUserId();
    const savedUsername = apiService.getUsername();
    console.log('Page load - savedUserId:', savedUserId, 'savedUsername:', savedUsername);
    
    if (savedUserId) {
      setUserId(savedUserId);
      setUsername(savedUsername);
      setIsAuthenticated(true);
    } else {
      // Для разработки: автоматически устанавливаем тестового пользователя
      console.log('Устанавливаем тестового пользователя для разработки');
      apiService.setUserData('1', 'TestUser');
      setUserId('1');
      setUsername('TestUser');
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleAuthenticated = () => {
    const userId = apiService.getUserId();
    const username = apiService.getUsername();
    if (userId) {
      setUserId(userId);
      setUsername(username);
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    apiService.logout();
    setUserId(null);
    setUsername(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Auth onAuthSuccess={handleAuthenticated} />
        <Toaster />
      </>
    );
  }

  return (
    <div className={activeView === 'chat' ? 'h-screen bg-gray-900 flex flex-col' : 'min-h-screen bg-slate-50'}>
      <header 
        className="bg-white shadow-sm flex-shrink-0 transition-all duration-300 border-b"
        style={{
          marginRight: activeView === 'chat' && showProductSidebar && typeof window !== 'undefined' && window.innerWidth > 768 ? `${sidebarWidth}px` : '0'
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">S</span>
              </div>
              <h1 className="text-sm sm:text-lg font-semibold text-slate-900 truncate">Smart Assistant</h1>
            </div>
            
            {/* Навигация */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button 
                variant={activeView === 'chat' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setActiveView('chat')}
                className="text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
              >
                Чат
              </Button>
              <Button 
                variant={activeView === 'products' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setActiveView('products')}
                className="text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
              >
                Продукты
              </Button>
            </div>
            
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="text-slate-500 hover:text-red-500 transition-colors duration-200 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 rounded hover:bg-slate-100"
                title="Выйти из аккаунта"
              >
                <span className="hidden sm:inline">← Выйти</span>
                <span className="sm:hidden text-sm">Выйти</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className={activeView === 'chat' ? 'flex-1 flex flex-col overflow-hidden bg-gray-900' : 'flex-1 px-3 sm:px-4 lg:px-8 py-3 sm:py-6 max-w-7xl mx-auto w-full'}>
        {activeView === 'chat' ? (
          <ChatBot 
            userId={userId!} 
            username={username} 
            showProductSidebar={showProductSidebar}
            onProductSidebarChange={handleProductSidebarChange}
            onSidebarWidthChange={setSidebarWidth}
            warehouseStats={warehouseStats}
          />) : activeView === 'products' ? (
          <ProductManager 
            userId={userId!} 
            onStatsUpdate={handleWarehouseStatsUpdate}
          />
        ) : (
          <div className="text-center py-8 sm:py-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-900">Функция в разработке</h2>
            <Button onClick={() => setActiveView('chat')} className="w-full sm:w-auto">
              Вернуться к чату
            </Button>
          </div>
        )}
      </main>

      <Toaster />
    </div>
  );
}
