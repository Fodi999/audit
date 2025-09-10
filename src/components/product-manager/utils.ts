import { Product } from '@/types/api';

// Функция для получения поступлений продукта (упрощенная версия для новой схемы)
export const getProductDeliveries = (product: Product) => {
  // В новой схеме у нас нет поля deliveries, поэтому создаем mock данные на основе базовой информации
  const deliveries = [];
  
  // Базовое поступление на основе данных продукта
  deliveries.push({
    id: `${product.id}-1`,
    date: product.created_at,
    gross_weight: product.quantity,
    net_weight: product.quantity,
    waste_percentage: 0,
    price_per_kg: product.price,
    total_cost: product.quantity * product.price,
    notes: "Основное поступление"
  });

  return deliveries;
};

// Функция для получения выбранного поступления продукта
export const getSelectedDelivery = (product: Product, selectedDeliveries: {[productId: number]: string}) => {
  const deliveries = getProductDeliveries(product);
  const selectedId = selectedDeliveries[product.id];
  return deliveries.find((d: { id: string }) => d.id === selectedId) || deliveries[0];
};

// Функция для расчета общей статистики по всем поступлениям продукта
export const getProductTotalStats = (product: Product) => {
  const deliveries = getProductDeliveries(product);
  
  const totalGross = deliveries.reduce((sum, delivery) => sum + delivery.gross_weight, 0);
  const totalNet = deliveries.reduce((sum, delivery) => sum + delivery.net_weight, 0);
  const totalCost = deliveries.reduce((sum, delivery) => sum + delivery.total_cost, 0);
  
  // Средний процент отходов (взвешенный по брутто весу)
  const totalWasteWeight = totalGross - totalNet;
  const avgWastePercentage = totalGross > 0 ? (totalWasteWeight / totalGross) * 100 : 0;
  
  // Средняя цена за кг (взвешенная по нетто весу)
  const avgPricePerKg = totalNet > 0 ? totalCost / totalNet : 0;
  
  return {
    totalGross: Math.round(totalGross * 10) / 10,
    totalNet: Math.round(totalNet * 10) / 10,
    totalWasteWeight: Math.round(totalWasteWeight * 10) / 10,
    avgWastePercentage: Math.round(avgWastePercentage * 10) / 10,
    avgPricePerKg: Math.round(avgPricePerKg * 100) / 100,
    totalCost: Math.round(totalCost),
    deliveryCount: deliveries.length
  };
};

// Функция для определения состояния срока годности
export const getExpirationStatus = (expirationDate?: string) => {
  if (!expirationDate) return null;
  
  const expDate = new Date(expirationDate);
  const today = new Date();
  const daysDiff = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 0) return { status: 'expired', color: 'bg-red-400', text: 'просрочен' };
  if (daysDiff === 0) return { status: 'today', color: 'bg-orange-400', text: 'сегодня' };
  if (daysDiff === 1) return { status: 'tomorrow', color: 'bg-orange-400', text: 'завтра' };
  if (daysDiff <= 3) return { status: 'soon', color: 'bg-orange-400', text: `через ${daysDiff} дн.` };
  if (daysDiff <= 7) return { status: 'week', color: 'bg-yellow-400', text: `через ${daysDiff} дн.` };
  
  return { status: 'fresh', color: 'bg-green-400', text: '' };
};

// Функция для получения цвета индикатора отходов
export const getWasteColor = (wastePercentage: number) => {
  if (wastePercentage < 5) return 'text-green-400';
  if (wastePercentage < 15) return 'text-yellow-400';
  if (wastePercentage < 25) return 'text-orange-400';
  return 'text-red-400';
};
