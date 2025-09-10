export interface Product {
  id: number;
  name: string;
  description?: string;
  category: string;
  price: number;
  stock: number;
  owner_id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Recipe {
  id: number;
  title: string;
  ingredients: string[];
  cook_time: number;
  description?: string;
  owner_id: number;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface BotMessage {
  message: string;
}

export interface BotResponse {
  reply: string;
  suggestions?: string[];
}
