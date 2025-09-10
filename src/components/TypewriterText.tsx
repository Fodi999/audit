'use client';

import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  thinkingDelay?: number; // Задержка "думает"
  onComplete?: () => void;
  onUpdate?: () => void;
}

export function TypewriterText({ text, speed = 30, thinkingDelay = 800, onComplete, onUpdate }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isThinking, setIsThinking] = useState(true);

  // Фаза "думает" перед началом печати
  useEffect(() => {
    const thinkingTimeout = setTimeout(() => {
      setIsThinking(false);
    }, thinkingDelay);

    return () => clearTimeout(thinkingTimeout);
  }, [thinkingDelay, text]); // Перезапускаем при изменении текста

  // Анимация печатания
  useEffect(() => {
    if (!isThinking && currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        onUpdate?.(); // Вызываем колбэк обновления для автоскролла
      }, speed);

      return () => clearTimeout(timeout);
    } else if (!isThinking && currentIndex >= text.length && !isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, onComplete, isComplete, isThinking, onUpdate]);

  // Сброс при изменении текста
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
    setIsThinking(true);
  }, [text]);

  return (
    <div className="inline-block">
      {isThinking ? (
        <div className="flex items-center gap-1 text-gray-400">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]"></div>
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]"></div>
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]"></div>
          </div>
          <span className="text-sm ml-1">думаю...</span>
        </div>
      ) : (
        <>
          <span className="whitespace-pre-wrap">{displayedText}</span>
          {!isComplete && (
            <span className="inline-block w-0.5 h-4 bg-gray-400 ml-0.5 animate-pulse" />
          )}
        </>
      )}
    </div>
  );
}
