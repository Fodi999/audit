'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';

interface AuthProps {
  onAuthSuccess: () => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' });

  // Демо-вход для разработки
  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      // Сначала пытаемся войти с демо-данными
      const loginResult = await apiService.login('demo@example.com', 'password');
      if (loginResult.success) {
        toast.success('Демо-вход успешен!');
        onAuthSuccess();
        return;
      }

      // Если пользователь не существует, создаем его
      const registerResult = await apiService.register('Demo User', 'demo@example.com', 'password');
      
      if (registerResult.success) {
        // После регистрации сразу входим
        const secondLoginResult = await apiService.login('demo@example.com', 'password');
        if (secondLoginResult.success) {
          toast.success('Демо-пользователь создан и вход выполнен!');
          onAuthSuccess();
        }
      }
    } catch (error) {
      toast.error('Ошибка демо-входа. Проверьте подключение к серверу.');
      console.error('Demo login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await apiService.login(loginForm.email, loginForm.password);
      if (result.success) {
        toast.success('Успешный вход!');
        onAuthSuccess();
      } else {
        toast.error(result.error || 'Ошибка входа');
      }
    } catch (error) {
      toast.error('Ошибка сети');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await apiService.register(registerForm.username, registerForm.email, registerForm.password);
      if (result.success) {
        toast.success('Регистрация успешна! Выполняем вход...');
        
        // Автоматически входим после регистрации
        const loginResult = await apiService.login(registerForm.email, registerForm.password);
        if (loginResult.success) {
          toast.success('Добро пожаловать!');
          onAuthSuccess();
        } else {
          toast.success('Регистрация выполнена. Теперь войдите в систему.');
        }
        
        setRegisterForm({ username: '', email: '', password: '' });
      } else {
        toast.error(result.error || 'Ошибка регистрации');
      }
    } catch (error) {
      toast.error('Ошибка сети');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-md border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Smart App</CardTitle>
          <CardDescription className="text-slate-600">Войдите или зарегистрируйтесь для продолжения</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Пароль"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-800" disabled={isLoading}>
                  {isLoading ? 'Вход...' : 'Войти'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                >
                  Демо-вход
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Имя пользователя"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Пароль"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-800" disabled={isLoading}>
                  {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
