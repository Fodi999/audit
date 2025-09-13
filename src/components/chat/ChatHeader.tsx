import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { Package, User, Settings, LogOut } from 'lucide-react';
import { WarehouseStats } from '../../types/api';
import { theme } from '../../styles/theme';

interface ChatHeaderProps {
  username?: string | null;
  isConnected: boolean;
  warehouseStats?: WarehouseStats;
  onLogout?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

export function ChatHeader({ 
  username, 
  isConnected, 
  warehouseStats, 
  onLogout, 
  onProfileClick, 
  onSettingsClick 
}: ChatHeaderProps) {
  return (
    <div className={`flex-shrink-0 px-6 py-4 ${theme.backgrounds.header} border-b border-white/10`}>
      <div className="flex items-center justify-between">
        {/* Левая часть - статус и название */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div className="flex flex-col">
              <span className={`${theme.text.light.primary} text-sm font-medium`}>Smart Assistant</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400' : 'bg-red-400'
                }`} />
                <span className={`${theme.text.light.muted} text-xs`}>
                  {isConnected ? 'Онлайн' : 'Нет подключения'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Центральная часть - статистика склада */}
        {warehouseStats && (
          <div className={`flex items-center gap-4 text-sm ${theme.backgrounds.card} rounded-lg px-3 py-2 border border-white/20`}>
            {warehouseStats.productCount > 0 ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className={theme.text.light.muted}>Склад:</span>
                  <span className={`${theme.text.light.primary} font-medium`}>
                    {isNaN(warehouseStats.totalCost) ? 0 : Math.round(warehouseStats.totalCost)}₽
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className={theme.text.light.muted}>Отходы:</span>
                  <span className="text-orange-400 font-medium">
                    {isNaN(warehouseStats.totalWaste) ? 0 : (Math.round(warehouseStats.totalWaste * 10) / 10)}кг
                  </span>
                </div>
                {warehouseStats.expiringCount && warehouseStats.expiringCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span className={theme.text.light.muted}>Истекает:</span>
                    <span className="text-red-400 font-medium">
                      {warehouseStats.expiringCount}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Package size={14} className={theme.text.light.muted} />
                  <span className={theme.text.light.muted}>{warehouseStats.productCount || 0}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Package size={14} className={theme.text.light.muted} />
                <span className={`${theme.text.light.muted} text-xs`}>Склад пуст</span>
              </div>
            )}
          </div>
        )}

        {/* Правая часть - пользователь и выход */}
        <div className="flex items-center gap-3">
          {/* Информация о пользователе */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="text-right hidden sm:block">
                  <div className={`${theme.text.light.primary} text-sm font-medium`}>
                    {username || 'Пользователь'}
                  </div>
                  <div className={`${theme.text.light.muted} text-xs`}>
                    {username ? 'Авторизован' : 'Гость'}
                  </div>
                </div>
                <Avatar className="w-9 h-9 ring-2 ring-white/20 transition-all duration-200 group-hover:ring-white/40 group-hover:scale-105">
                  <AvatarImage 
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${username || 'User'}&backgroundColor=475569&textColor=ffffff`} 
                    alt={`Аватар ${username || 'пользователя'}`}
                  />
                  <AvatarFallback className="bg-slate-600 text-white text-sm font-semibold">
                    {username ? username.charAt(0).toUpperCase() : 'У'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="flex items-center gap-2">
                <User size={16} />
                Профиль пользователя
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Информация о пользователе */}
              <DropdownMenuItem 
                className="flex items-center gap-3 cursor-pointer focus:bg-blue-50"
                onClick={onProfileClick}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage 
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${username || 'User'}&backgroundColor=475569&textColor=ffffff`} 
                  />
                  <AvatarFallback className="bg-slate-600 text-white text-xs">
                    {username ? username.charAt(0).toUpperCase() : 'У'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{username || 'Пользователь'}</span>
                  <span className="text-xs text-muted-foreground">
                    {username ? 'Авторизованный пользователь' : 'Гостевая сессия'}
                  </span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Действия */}
              <DropdownMenuItem 
                className="flex items-center gap-2 cursor-pointer"
                onClick={onSettingsClick}
              >
                <Settings size={16} />
                Настройки приложения
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Статистика */}
              {warehouseStats && warehouseStats.productCount > 0 && (
                <>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Статистика склада
                  </DropdownMenuLabel>
                  <div className="px-2 py-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Продуктов:</span>
                      <span className="font-medium">{warehouseStats.productCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Стоимость:</span>
                      <span className="font-medium">{Math.round(warehouseStats.totalCost)}₽</span>
                    </div>
                    {warehouseStats.expiringCount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Истекает:</span>
                        <span className="font-medium">{warehouseStats.expiringCount}</span>
                      </div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              
              {/* Выход */}
              <DropdownMenuItem 
                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={onLogout}
              >
                <LogOut size={16} />
                Выйти из системы
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}