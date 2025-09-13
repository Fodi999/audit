import { Loader2 } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  isLoading: boolean;
}

export function ConnectionStatus({ isConnected, isLoading }: ConnectionStatusProps) {
  if (isConnected) {
    return (
      <div className="max-w-4xl mx-auto pb-4">
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>Нажмите Enter для отправки, Shift+Enter для новой строки</p>
          {isLoading && (
            <p className="text-blue-400 flex items-center justify-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Обработка запроса...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="text-sm text-red-300 bg-red-900/20 backdrop-blur-sm p-4 rounded-xl border border-red-700/30 animate-in fade-in slide-in-from-bottom-1 max-w-4xl mx-auto flex items-center gap-2">
        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
        Нет подключения к серверу. Проверьте, что backend запущен на порту 8080.
      </div>
      
      <div className="max-w-4xl mx-auto pb-4">
        <div className="text-xs text-gray-500 text-center">
          <p>Подключение восстановится автоматически</p>
        </div>
      </div>
    </>
  );
}