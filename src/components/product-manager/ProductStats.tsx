import { Product } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

interface ProductStatsProps {
  products: Product[];
}

export function ProductStats({ products }: ProductStatsProps) {
  const calculateStats = () => {
    const total = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    
    const today = new Date();
    const expiring = products.filter(product => {
      if (!product.expiration_date) return false;
      const expiry = new Date(product.expiration_date);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    }).length;
    
    const expired = products.filter(product => {
      if (!product.expiration_date) return false;
      const expiry = new Date(product.expiration_date);
      return expiry < today;
    }).length;

    // Подсчет по категориям
    const categoryStats = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      total,
      totalValue,
      expiring,
      expired,
      topCategory: topCategory ? { name: topCategory[0], count: topCategory[1] } : null
    };
  };

  const stats = calculateStats();

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'dairy': 'Молочные',
      'meat': 'Мясо',
      'vegetables': 'Овощи',
      'fruits': 'Фрукты',
      'bakery': 'Выпечка',
      'canned': 'Консервы',
      'frozen': 'Заморозка',
      'beverages': 'Напитки',
      'spices': 'Специи',
      'other': 'Другое'
    };
    return categoryMap[category] || category;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Общее количество */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Всего продуктов</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            В вашем холодильнике
          </p>
        </CardContent>
      </Card>

      {/* Общая стоимость */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Общая стоимость</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalValue.toFixed(0)} ₽</div>
          <p className="text-xs text-muted-foreground">
            Всех продуктов
          </p>
        </CardContent>
      </Card>

      {/* Истекает скоро */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Истекает скоро</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.expiring}</div>
          <p className="text-xs text-muted-foreground">
            В течение 7 дней
          </p>
        </CardContent>
      </Card>

      {/* Просроченные */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Просроченные</CardTitle>
          <TrendingUp className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
          <p className="text-xs text-muted-foreground">
            Требуют внимания
          </p>
        </CardContent>
      </Card>

      {/* Популярная категория */}
      {stats.topCategory && (
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Популярная категория</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg py-1">
                {getCategoryDisplayName(stats.topCategory.name)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {stats.topCategory.count} продуктов
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
