export interface Product {
  id: number;
  owner_id: number;
  name: string;
  category: 'dairy' | 'meat' | 'vegetables' | 'fruits' | 'bakery' | 'canned' | 'frozen' | 'beverages' | 'spices' | 'other';
  price: number;
  quantity: number;
  net_weight?: number;
  expiration_date?: string;
  purchase_date: string;
  location?: string;
  barcode?: string;
  image_url?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: number;
  owner_id: number;
  name: string;
  description?: string;
  ingredients: string;
  instructions: string;
  prep_time?: number;
  cook_time?: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  image_url?: string;
  tags?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: number;
  user_id: number;
  full_name?: string;
  age?: number;
  bio?: string;
  avatar_url?: string;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  user_id: number;
  username: string;
  email: string;
  token: string;
  expires_at: string;
}

export interface BotMessage {
  id: number;
  user_id: number;
  message: string;
  response: string;
  timestamp: string;
  command: string;
}

export interface BotResponse {
  id: number;
  user_id: number;
  message: string;
  response: string;
  timestamp: string;
  command: string;
}

export interface ProductDelivery {
  id: string;
  date: string;
  quantity: number;
  net_weight?: number;
  price: number;
  price_per_kg?: number;
  waste_percentage?: number;
  total_cost?: number;
  supplier?: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
  isTyping?: boolean;
  isAI?: boolean; // Индикатор AI ответа
}

export interface BotMessageResponse {
  id: number;
  user_id: number;
  message: string;
  response: string;
  timestamp: string;
  command: string;
}
