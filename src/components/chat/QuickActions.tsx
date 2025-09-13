import { Button } from '../ui/button';
import { Plus, ChefHat, Brain, BarChart3, Search } from 'lucide-react';
import { theme } from '../../styles/theme';

interface QuickActionsProps {
  isLoading: boolean;
  onAddProduct: () => void;
  onSetMessage: (message: string) => void;
  onShowAIDemo: () => void;
}

export function QuickActions({ isLoading, onAddProduct, onSetMessage, onShowAIDemo }: QuickActionsProps) {
  const actions = [
    {
      icon: Plus,
      label: 'Добавить продукт',
      onClick: onAddProduct,
      className: 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm',
    },
    {
      icon: ChefHat,
      label: 'Рецепты',
      onClick: () => onSetMessage('что можно приготовить?'),
      className: 'bg-white border-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 shadow-sm',
    },
    {
      icon: Brain,
      label: 'ИИ Анализ',
      onClick: () => onSetMessage('анализируй мой склад и дай рекомендации'),
      className: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 border-0 shadow-md',
    },
    {
      icon: BarChart3,
      label: 'Статистика',
      onClick: () => onSetMessage('/analytics'),
      className: 'bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 shadow-sm',
    },
    {
      icon: Search,
      label: 'Оптимизация',
      onClick: () => onSetMessage('как оптимизировать склад?'),
      className: 'bg-white border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 shadow-sm',
    },
    {
      icon: Brain,
      label: 'Демо ИИ',
      onClick: onShowAIDemo,
      className: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 border-0 shadow-md',
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 max-w-4xl mx-auto justify-center">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Button
            key={index}
            size="sm"
            variant="outline"
            className={`gap-2 ${action.className} rounded-full transition-all duration-200 hover:scale-105 active:scale-95 px-4 py-2 font-medium`}
            disabled={isLoading}
            onClick={action.onClick}
          >
            <Icon size={16} />
            <span className="hidden xs:inline text-sm">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
}