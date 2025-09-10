import { Product } from '@/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign, 
  Package, 
  Calendar,
  PieChart,
  BarChart3,
  Clock,
  LucideIcon
} from 'lucide-react';
import { productCategories } from './constants';

interface CategoryStats {
  count: number; 
  value: number; 
  icon?: LucideIcon;
}

interface ProductAnalyticsProps {
  products: Product[];
}

export function ProductAnalytics({ products }: ProductAnalyticsProps) {
  // Расчет аналитики
  const calculateAnalytics = () => {
    const total = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const averagePrice = total > 0 ? totalValue / total : 0;
    
    const today = new Date();
    
    // Анализ по срокам годности
    const expired = products.filter(p => {
      if (!p.expiration_date) return false;
      return new Date(p.expiration_date) < today;
    }).length;
    
    const expiring = products.filter(p => {
      if (!p.expiration_date) return false;
      const expiry = new Date(p.expiration_date);
      const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).length;
    
    // Анализ по категориям
    const categoryStats = products.reduce((acc, product) => {
      const category = productCategories.find(c => c.id === product.category);
      const categoryName = category?.name || 'Другое';
      
      if (!acc[categoryName]) {
        acc[categoryName] = { count: 0, value: 0, icon: category?.icon };
      }
      acc[categoryName].count += 1;
      acc[categoryName].value += product.price * product.quantity;
      return acc;
    }, {} as Record<string, CategoryStats>);
    
    const sortedCategories = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b.value - a.value)
      .slice(0, 5);
    
    // Анализ по месяцам (примерный)
    const monthlyStats = products.reduce((acc, product) => {
      const month = new Date(product.created_at).toLocaleDateString('ru-RU', { 
        year: 'numeric', 
        month: 'long' 
      });
      if (!acc[month]) acc[month] = 0;
      acc[month] += product.price * product.quantity;
      return acc;
    }, {} as Record<string, number>);
    
    const recentMonths = Object.entries(monthlyStats)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-3);
    
    // Топ дорогих продуктов
    const expensiveProducts = [...products]
      .sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))
      .slice(0, 5);
    
    return {
      total,
      totalValue,
      averagePrice,
      expired,
      expiring,
      sortedCategories,
      recentMonths,
      expensiveProducts,
      wastePercentage: total > 0 ? (expired / total) * 100 : 0
    };
  };

  const analytics = calculateAnalytics();

  const getCategoryDisplayName = (categoryId: string) => {
    const category = productCategories.find(c => c.id === categoryId);
    return category?.name || 'Другое';
  };

  return (
    <div className="space-y-6">
      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общая стоимость</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalValue.toFixed(0)} ₽</div>
            <p className="text-xs text-muted-foreground">
              Средняя: {analytics.averagePrice.toFixed(0)} ₽
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего продуктов</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total}</div>
            <p className="text-xs text-muted-foreground">
              В наличии на складе
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Истекает скоро</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{analytics.expiring}</div>
            <p className="text-xs text-muted-foreground">
              В течение 7 дней
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Просрочено</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.expired}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.wastePercentage.toFixed(1)}% от общего
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Анализ по категориям */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Топ категории по стоимости
            </CardTitle>
            <CardDescription>
              Самые дорогие категории в вашем складе
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.sortedCategories.map(([category, stats], index) => {
              const IconComponent = stats.icon as LucideIcon;
              const percentage = analytics.totalValue > 0 
                ? (stats.value / analytics.totalValue) * 100 
                : 0;
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        {IconComponent && <IconComponent className="w-3 h-3" />}
                        {category}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {stats.count} шт.
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{stats.value.toFixed(0)} ₽</div>
                      <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Самые дорогие продукты */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Топ дорогих продуктов
            </CardTitle>
            <CardDescription>
              Продукты с наибольшей общей стоимостью
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.expensiveProducts.map((product, index) => {
              const totalValue = product.price * product.quantity;
              const category = productCategories.find(c => c.id === product.category);
              const IconComponent = category?.icon;
              
              return (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        {IconComponent && <IconComponent className="w-3 h-3" />}
                        {getCategoryDisplayName(product.category)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{totalValue.toFixed(0)} ₽</div>
                    <div className="text-xs text-gray-500">
                      {product.quantity} кг × {product.price} ₽/кг
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Динамика по месяцам */}
      {analytics.recentMonths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Динамика закупок
            </CardTitle>
            <CardDescription>
              Стоимость продуктов по месяцам
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentMonths.map(([month, value]) => {
                const maxValue = Math.max(...analytics.recentMonths.map(([, v]) => v));
                const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                
                return (
                  <div key={month} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{month}</div>
                      <div className="text-lg font-bold">{value.toFixed(0)} ₽</div>
                    </div>
                    <Progress value={percentage} className="h-3" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Рекомендации */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Рекомендации
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analytics.expired > 0 && (
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <div className="font-medium text-red-900">
                  Утилизируйте просроченные продукты
                </div>
                <div className="text-sm text-red-700">
                  {analytics.expired} продуктов просрочено и требует немедленного внимания
                </div>
              </div>
            </div>
          )}
          
          {analytics.expiring > 0 && (
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <Calendar className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <div className="font-medium text-orange-900">
                  Скоро истекут сроки годности
                </div>
                <div className="text-sm text-orange-700">
                  {analytics.expiring} продуктов истекают в течение 7 дней
                </div>
              </div>
            </div>
          )}
          
          {analytics.wastePercentage > 20 && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <TrendingDown className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-900">
                  Высокий процент потерь
                </div>
                <div className="text-sm text-yellow-700">
                  {analytics.wastePercentage.toFixed(1)}% продуктов просрочено. Рекомендуем оптимизировать закупки
                </div>
              </div>
            </div>
          )}
          
          {analytics.total === 0 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Package className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900">
                  Склад пуст
                </div>
                <div className="text-sm text-blue-700">
                  Добавьте продукты для начала работы со складом
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
