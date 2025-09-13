import { useRef, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ value, onChange, onSend, isLoading, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMultiline, setIsMultiline] = useState(false);

  // Автоматическое изменение высоты textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 128); // max-h-32 = 128px
      textarea.style.height = newHeight + 'px';
      
      // Отслеживаем многострочность (больше одной строки)
      setIsMultiline(newHeight > 56); // min-h-[56px]
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [value]);

  // Обработка нажатия Enter (с поддержкой Shift+Enter для новой строки)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleSend = () => {
    onSend();
    // Сбрасываем высоту textarea и состояние многострочности
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsMultiline(false);
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Напишите сообщение..."
          disabled={disabled || isLoading}
          rows={1}
          className={`
            w-full min-h-[56px] max-h-32 resize-none 
            bg-white border-2 border-gray-200 
            text-gray-900 placeholder-gray-500 
            focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
            transition-all duration-200 
            rounded-2xl pl-6 py-4 pr-14 
            focus:outline-none overflow-hidden shadow-lg
            hover:border-gray-300 hover:shadow-xl
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
            ${isMultiline ? 'pr-4' : 'pr-16'}
          `}
        />
        
        {/* Кнопка отправки */}
        <Button
          onClick={handleSend}
          disabled={!value.trim() || isLoading || disabled}
          size="icon"
          className={`
            absolute transition-all duration-200 h-12 w-12 
            bg-gradient-to-r from-blue-600 to-blue-700 
            hover:from-blue-700 hover:to-blue-800 
            disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400
            rounded-full shadow-lg hover:shadow-xl hover:shadow-blue-500/25 
            flex items-center justify-center
            hover:scale-105 active:scale-95
            ${isMultiline 
              ? 'right-3 bottom-3' 
              : 'right-3 top-1/2 -translate-y-1/2'
            }
          `}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : (
            <Send className="w-5 h-5 text-white" />
          )}
        </Button>
      </div>

      {/* Индикатор символов */}
      {value.length > 500 && (
        <div className="absolute -bottom-6 right-0 text-xs text-gray-500">
          {value.length}/2000
        </div>
      )}
      
      {/* Подсказка */}
      <div className="absolute -bottom-6 left-0 text-xs text-gray-400">
        Нажмите Enter для отправки, Shift+Enter для новой строки
      </div>
    </div>
  );
}