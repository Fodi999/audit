import { Brain } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types/api';
import { TypewriterText } from '../TypewriterText';
import { LoadingDots } from '../ui/loading-dots';
import { theme } from '../../styles/theme';

interface ChatMessageProps {
  message: ChatMessageType;
  onTypingComplete: (messageId: string) => void;
  onTypingUpdate: () => void;
}

export function ChatMessage({ message, onTypingComplete, onTypingUpdate }: ChatMessageProps) {
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-3 fade-in duration-300`}>
      <div className={`max-w-2xl ${
        message.isUser
          ? 'bg-blue-600 text-white rounded-2xl px-4 py-3'
          : `${theme.text.light.primary} py-2`
      }`}>
        {/* AI индикатор */}
        {!message.isUser && message.isAI && (
          <div className="flex items-center gap-2 mb-2 text-xs text-blue-400">
            <Brain size={12} />
            <span>Ответ от ИИ</span>
          </div>
        )}
        
        <div className="whitespace-pre-wrap text-base">
          {message.isLoading ? (
            <div className={`flex items-center gap-3 ${theme.text.light.muted}`}>
              <LoadingDots className={theme.status.neutral} size="sm" />
              <span className="text-sm">Думаю...</span>
            </div>
          ) : message.isTyping ? (
            <TypewriterText 
              text={message.text} 
              speed={25}
              onComplete={() => onTypingComplete(message.id)}
              onUpdate={onTypingUpdate}
            />
          ) : (
            message.text
          )}
        </div>
        
        {!message.isLoading && !message.isTyping && (
          <div className={`text-xs ${theme.text.light.muted} mt-2 opacity-70`}>
            {message.timestamp.toLocaleTimeString('ru-RU', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>
    </div>
  );
}