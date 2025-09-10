'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProductManager } from '@/components/ProductManager';
import { TypewriterText } from '@/components/TypewriterText';
import { apiService } from '@/lib/api';
import { ChatMessage, BotMessageResponse } from '@/types/api';
import { toast } from 'sonner';
import { Plus, Package, ChefHat, Brain, BarChart3, Search } from 'lucide-react';

interface ChatBotProps {
  userId: string;
  username?: string | null;
  showProductSidebar?: boolean;
  onProductSidebarChange?: (show: boolean) => void;
  onSidebarWidthChange?: (width: number) => void;
  warehouseStats?: {
    totalCost: number;
    totalWaste: number;
    productCount: number;
    expiringCount?: number;
  };
}

export function ChatBot({ userId, username, showProductSidebar = false, onProductSidebarChange, onSidebarWidthChange, warehouseStats }: ChatBotProps) {
  const welcomeMessage = username 
    ? `Привет, ${username}! 👋\n\n🤖 Теперь все мои ответы работают через ИИ!\n\nПросто пишите как обычно:\n• "Что приготовить?"\n• "Анализируй склад"\n• "Посоветуй рецепт"\n• "Что купить?"\n\nИли используйте кнопки ниже для быстрого доступа!`
    : 'Привет! 👋\n\n🤖 Теперь все мои ответы работают через ИИ!\n\nПросто пишите как обычно:\n• "Что приготовить?"\n• "Анализируй склад"\n• "Посоветуй рецепт"\n• "Что купить?"\n\nИли используйте кнопки ниже для быстрого доступа!';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      text: welcomeMessage,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  
  // Состояния для изменения размера боковой панели
  const [sidebarWidth, setSidebarWidth] = useState(350); // 350px по умолчанию
  const [isResizing, setIsResizing] = useState(false);
  
  // Состояние для отслеживания многострочности input
  const [isMultiline, setIsMultiline] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Популярные AI команды для автодополнения
  const aiCommands = [
    '/ask что у меня есть на складе?',
    '/ask что можно приготовить?',
    '/ask как оптимизировать склад?',
    '/ask анализируй мой склад',
    '/ask какие продукты скоро испортятся?',
    '/ask составь список покупок',
    '/ask рекомендации по экономии',
    '/ask что делать с отходами?',
    '/products',
    '/analytics',
    '/optimize',
    '/brain'
  ];

  // Функция для демонстрации AI возможностей
  const showAIDemo = () => {
    const demoMessage: ChatMessage = {
      id: Date.now().toString(),
      text: '🤖 ИИ готов к работе!\n\nПопробуйте:\n• "Анализируй мой склад"\n• "Что можно приготовить?"\n• "Как сэкономить на продуктах?"\n\nИИ видит все ваши продукты и может дать персональные рекомендации!',
      isUser: false,
      timestamp: new Date(),
      isAI: true,
      isTyping: true,
    };
    
    setMessages(prev => [...prev, demoMessage]);
  };

  // Автоскролл к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Завершение анимации печатания
  const handleTypingComplete = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, isTyping: false } : msg
      )
    );
  };

  // Автоскролл во время печатания
  const handleTypingUpdate = () => {
    scrollToBottom();
  };

  // Автоматическое изменение высоты textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 128); // max-h-32 = 128px
      textarea.style.height = newHeight + 'px';
      
      // Отслеживаем многострочность (больше одной строки)
      setIsMultiline(newHeight > 52); // min-h-[52px]
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  // Обработчики для изменения размера боковой панели
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      // Для правой панели считаем ширину от правого края экрана
      const newWidth = window.innerWidth - e.clientX;
      // Ограничиваем ширину от 300px до 600px
      const clampedWidth = Math.min(Math.max(newWidth, 300), 600);
      setSidebarWidth(clampedWidth);
      onSidebarWidthChange?.(clampedWidth);
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
  }, [isResizing]);

  // Проверка подключения к бэкенду при монтировании
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await apiService.healthCheck();
        setIsConnected(result.success);
        
        if (!result.success) {
          console.warn('Backend не доступен:', result.error);
        }
      } catch (error) {
        console.error('Ошибка проверки подключения:', error);
        setIsConnected(false);
      }
    };
    
    checkConnection();
    
    // Периодическая проверка подключения
    const interval = setInterval(checkConnection, 30000); // каждые 30 секунд
    
    return () => clearInterval(interval);
  }, []);

  // Отправка сообщения
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    console.log('Отправка сообщения, userId:', userId);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: 'Печатаю...',
      isUser: false,
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    // Сбрасываем высоту textarea и состояние многострочности
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsMultiline(false);

    try {
      console.log('Отправляем запрос к боту...');
      const result = await apiService.sendBotMessage(userMessage.text);
      console.log('Результат от бота:', result);

      if (result.success && result.data) {
        // Теперь все ответы от бота считаются AI ответами, кроме системных команд
        const isSystemCommand = userMessage.text.startsWith('/') && 
                               !userMessage.text.startsWith('/ask');
        const isProductAddition = userMessage.text.includes('добав') && 
                                (userMessage.text.includes('кг') || userMessage.text.includes('руб'));
        
        const isAIResponse = !isSystemCommand && !isProductAddition;
        
        const botResponse: ChatMessage = {
          id: result.data.id.toString(),
          text: result.data.response,
          isUser: false,
          timestamp: new Date(result.data.timestamp),
          isTyping: true, // Начинаем с анимации печатания
          isAI: isAIResponse, // Помечаем как AI ответ
        };

        setMessages(prev => 
          prev.map(msg => 
            msg.id === loadingMessage.id ? botResponse : msg
          )
        );
      } else {
        throw new Error(result.error || 'Ошибка ответа бота');
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        text: '❌ Извините, произошла ошибка. Попробуйте позже.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id ? errorMessage : msg
        )
      );

      toast.error('Ошибка отправки сообщения');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка нажатия Enter (с поддержкой Shift+Enter для новой строки)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full w-full bg-gray-800 relative">
      {/* Основная область чата */}
      <div 
        className="flex flex-col h-full bg-gray-800 transition-all duration-300 ease-in-out"
        style={{
          width: showProductSidebar ? `calc(100% - ${sidebarWidth}px)` : '100%'
        }}
      >
        {/* Заголовок чата */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? 'bg-emerald-400' : 'bg-red-400'
              }`} />
              <span className="text-gray-300 text-sm font-medium">Smart Assistant</span>
            </div>
            
            {/* Статистика склада */}
            {warehouseStats && (
              <div className="flex items-center gap-4 text-sm bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/30">
                {warehouseStats.productCount > 0 ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-400">Склад:</span>
                      <span className="text-gray-200 font-medium">
                        {isNaN(warehouseStats.totalCost) ? 0 : Math.round(warehouseStats.totalCost)}₽
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-gray-400">Отходы:</span>
                      <span className="text-orange-400 font-medium">
                        {isNaN(warehouseStats.totalWaste) ? 0 : (Math.round(warehouseStats.totalWaste * 10) / 10)}кг
                      </span>
                    </div>
                    {warehouseStats.expiringCount && warehouseStats.expiringCount > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        <span className="text-gray-400">Истекает:</span>
                        <span className="text-red-400 font-medium">
                          {warehouseStats.expiringCount}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-gray-400" />
                      <span className="text-gray-400">{warehouseStats.productCount || 0}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-gray-500" />
                    <span className="text-gray-500 text-xs">Склад пуст</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Сообщения */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-6 py-0">
            <div className="space-y-6 py-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-3 fade-in duration-300`}
                >
                  <div
                    className={`max-w-2xl ${
                      message.isUser
                        ? 'bg-blue-600 text-white rounded-2xl px-4 py-3'
                        : 'text-gray-200 py-2'
                    }`}
                  >
                    {/* AI индикатор */}
                    {!message.isUser && message.isAI && (
                      <div className="flex items-center gap-2 mb-2 text-xs text-blue-400">
                        <Brain size={12} />
                        <span>Ответ от ИИ</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-base">
                      {message.isLoading ? (
                        <div className="flex items-center gap-2 text-gray-400">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]"></div>
                          </div>
                          <span className="text-sm">Думаю...</span>
                        </div>
                      ) : message.isTyping ? (
                        <TypewriterText 
                          text={message.text} 
                          speed={25}
                          onComplete={() => handleTypingComplete(message.id)}
                          onUpdate={scrollToBottom}
                        />
                      ) : (
                        message.text
                      )}
                    </div>
                    {!message.isLoading && !message.isTyping && (
                      <div className="text-xs text-gray-400 mt-2 opacity-70">
                        {message.timestamp.toLocaleTimeString('ru-RU', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Поле ввода */}
        <div className="flex-shrink-0">
          <div className="px-6 pb-6 space-y-4">
            {/* Быстрые действия */}
            <div className="flex flex-wrap gap-2 max-w-3xl mx-auto">
              <Button
                size="sm"
                variant="outline"
                className="gap-2 bg-gray-700/50 backdrop-blur-sm border-gray-600/40 hover:bg-gray-600/50 text-gray-200 hover:text-white rounded-full"
                disabled={isLoading}
                onClick={() => {
                  console.log('Кнопка "Добавить продукт" нажата. userId:', userId);
                  console.log('onProductSidebarChange:', onProductSidebarChange);
                  onProductSidebarChange?.(true);
                }}
              >
                <Plus size={16} />
                Добавить продукт
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 bg-gray-700/50 backdrop-blur-sm border-gray-600/40 hover:bg-gray-600/50 text-gray-200 hover:text-white rounded-full"
                disabled={isLoading}
                onClick={() => setInputMessage('/products')}
              >
                <Package size={16} />
                Мои продукты
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 bg-gray-700/50 backdrop-blur-sm border-gray-600/40 hover:bg-gray-600/50 text-gray-200 hover:text-white rounded-full"
                disabled={isLoading}
                onClick={() => setInputMessage('что можно приготовить?')}
              >
                <ChefHat size={16} />
                Рецепты
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 bg-blue-700/50 backdrop-blur-sm border-blue-600/40 hover:bg-blue-600/50 text-blue-200 hover:text-white rounded-full"
                disabled={isLoading}
                onClick={() => setInputMessage('анализируй мой склад и дай рекомендации')}
              >
                <Brain size={16} />
                ИИ Анализ
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 bg-green-700/50 backdrop-blur-sm border-green-600/40 hover:bg-green-600/50 text-green-200 hover:text-white rounded-full"
                disabled={isLoading}
                onClick={() => setInputMessage('/analytics')}
              >
                <BarChart3 size={16} />
                Статистика
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 bg-purple-700/50 backdrop-blur-sm border-purple-600/40 hover:bg-purple-600/50 text-purple-200 hover:text-white rounded-full"
                disabled={isLoading}
                onClick={() => setInputMessage('как оптимизировать склад?')}
              >
                <Search size={16} />
                Оптимизация
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 bg-gradient-to-r from-blue-700/50 to-purple-700/50 backdrop-blur-sm border-blue-600/40 hover:from-blue-600/50 hover:to-purple-600/50 text-blue-200 hover:text-white rounded-full"
                disabled={isLoading}
                onClick={showAIDemo}
              >
                <Brain size={16} />
                Демо ИИ
              </Button>
            </div>

            <div className="relative max-w-3xl mx-auto">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Напишите сообщение..."
                disabled={isLoading}
                rows={1}
                className="w-full min-h-[52px] max-h-32 resize-none bg-gray-700/50 border border-gray-600/50 text-gray-100 placeholder-gray-400 focus:bg-gray-700/70 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm rounded-3xl pl-4 py-3 text-base leading-6 focus:outline-none overflow-hidden"
                style={{
                  paddingRight: isMultiline ? '16px' : '50px'
                }}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="icon"
                className={`absolute transition-all duration-300 h-9 w-9 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-lg hover:shadow-blue-500/25 flex items-center justify-center ${
                  isMultiline 
                    ? 'right-2 bottom-4' // Многострочный режим - в углу
                    : 'right-2 top-1/2 -translate-y-1/2 -mt-0.5' // Однострочный режим - справа по центру с небольшим сдвигом вверх
                }`}
              >
                {isLoading ? (
                  <span className="animate-spin text-base">⏳</span>
                ) : (
                  <span className="text-base font-bold">↑</span>
                )}
              </Button>
            </div>

            {!isConnected && (
              <div className="text-sm text-red-300 bg-red-900/20 backdrop-blur-sm p-4 rounded-xl border border-red-700/30 animate-in fade-in slide-in-from-bottom-1">
                ⚠️ Нет подключения к серверу. Проверьте, что backend запущен на порту 8080.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Боковая панель справа - ультра минималистичная */}
      <div 
        className={`fixed top-0 right-0 h-screen bg-gray-900/95 backdrop-blur-sm border-l border-gray-800/30 transition-transform duration-200 ${
          showProductSidebar ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ 
          width: `${sidebarWidth}px`,
          zIndex: 10
        }}
      >
        {/* Разделитель для изменения размера - невидимый */}
        <div
          className="absolute top-0 left-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-blue-500/20"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-0.5 h-6 bg-gray-700 opacity-0 hover:opacity-100" />
        </div>
        
        <div className="h-full flex flex-col">
          <div className="px-4 py-3 border-b border-gray-800/20 flex items-center justify-between">
            <h3 className="text-sm text-gray-300 font-medium">Склад продуктов</h3>
            <button
              onClick={() => onProductSidebarChange?.(false)}
              className="text-gray-500 hover:text-gray-300 w-6 h-6 flex items-center justify-center rounded text-sm hover:bg-gray-800/40"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <ProductManager userId={userId} />
          </div>
        </div>
      </div>
    </div>
  );
}
