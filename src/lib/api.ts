import { Product, Recipe, User, ApiResponse, LoginResponse, BotMessage, BotResponse } from '@/types/api';

const API_BASE = 'http://localhost:8080/api';

class ApiService {
  private userId: string | null = null;
  private username: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
    localStorage.setItem('userId', userId);
  }

  setUserData(userId: string, username: string) {
    this.userId = userId;
    this.username = username;
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
  }

  getUserId(): string | null {
    if (!this.userId) {
      this.userId = localStorage.getItem('userId');
    }
    return this.userId;
  }

  getUsername(): string | null {
    if (!this.username) {
      this.username = localStorage.getItem('username');
    }
    return this.username;
  }

  private async request<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', 
    data?: unknown
  ): Promise<ApiResponse<T>> {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Добавляем User-ID заголовок если пользователь авторизован
    const userId = this.getUserId();
    console.log('API request - userId:', userId);
    if (userId) {
      (options.headers as Record<string, string>)['User-ID'] = userId;
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const url = `${API_BASE}${endpoint}`;
      console.log(`API request: ${method} ${url}`, { userId, headers: options.headers, data });
      
      const response = await fetch(url, options);
      console.log(`API response: ${response.status} ${response.statusText}`);
      
      const result = await response.json();
      console.log('API result:', result);
      
      return result;
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        error: 'Ошибка сети. Проверьте подключение к серверу.'
      };
    }
  }

  // Auth endpoints
  async register(username: string, email: string, password: string): Promise<ApiResponse<User>> {
    return this.request<User>('/register', 'POST', { username, email, password });
  }

  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const result = await this.request<LoginResponse>('/login', 'POST', { email, password });
    if (result.success && result.data) {
      this.setUserData(result.data.user_id.toString(), result.data.username);
    }
    return result;
  }

  // Products endpoints
  async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>('/products');
  }

  async createProduct(product: {
    name: string;
    category: string;
    price: number;
    quantity: number;
    expiration_date?: string;
    purchase_date?: string;
    location?: string;
    barcode?: string;
    notes?: string;
  }): Promise<ApiResponse<Product>> {
    const requestData = {
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      expiration_date: product.expiration_date,
      purchase_date: product.purchase_date || new Date().toISOString().split('T')[0],
      location: product.location || '',
      barcode: product.barcode || '',
      notes: product.notes || ''
    };
    
    console.log('createProduct: отправляем данные на сервер:', requestData);
    const result = await this.request<Product>('/products', 'POST', requestData);
    console.log('createProduct: ответ от сервера:', result);
    return result;
  }

  async createProductWithDelivery(product: {
    name: string;
    category: string;
    price: number;
    quantity: number;
    net_weight: number;
    image_url?: string;
    description?: string;
    delivery_date: string;
    expiration_date?: string;
  }): Promise<ApiResponse<Product>> {
    console.log('createProductWithDelivery: отправляем данные на сервер:', product);
    const result = await this.request<Product>('/products/with-delivery', 'POST', product);
    console.log('createProductWithDelivery: ответ от сервера:', result);
    return result;
  }

  async searchProducts(query: string): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>(`/products/search?q=${encodeURIComponent(query)}`);
  }

  async deleteProduct(productId: number): Promise<ApiResponse<void>> {
    console.log('API deleteProduct called with:', productId);
    return this.request<void>(`/products/${productId}`, 'DELETE');
  }

  async updateProductExpirationDate(productId: number, expirationDate: string): Promise<ApiResponse<Product>> {
    console.log('API updateProductExpirationDate called with:', productId, expirationDate);
    return this.request<Product>(`/products/${productId}/expiration`, 'PUT', { expiration_date: expirationDate });
  }

  async addProductDeliveryDate(productId: number, deliveryDate: string): Promise<ApiResponse<Product>> {
    console.log('API addProductDeliveryDate called with:', productId, deliveryDate);
    return this.request<Product>(`/products/${productId}/delivery`, 'POST', { delivery_date: deliveryDate });
  }

  async addProductDelivery(productId: number, delivery: {
    date: string;
    gross_weight: number;
    net_weight: number;
    price_per_kg: number;
    notes?: string;
  }): Promise<ApiResponse<Product>> {
    console.log('API addProductDelivery called with:', productId, delivery);
    return this.request<Product>(`/products/${productId}/deliveries`, 'POST', delivery);
  }

  async uploadProductImage(imageFile: File): Promise<{ success: boolean; url?: string; message?: string; error?: string }> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const userId = this.getUserId();
    const headers: HeadersInit = {};
    if (userId) {
      headers['User-ID'] = userId;
    }

    try {
      console.log('uploadProductImage: отправляем запрос на сервер');
      const response = await fetch(`${API_BASE}/products/upload-image`, {
        method: 'POST',
        headers,
        body: formData
      });

      console.log('uploadProductImage: получен ответ от сервера, status:', response.status);
      const result = await response.json();
      console.log('uploadProductImage: содержимое ответа:', result);
      return result;
    } catch (error) {
      console.error('Image Upload Error:', error);
      return {
        success: false,
        error: 'Ошибка загрузки изображения'
      };
    }
  }

  // Recipes endpoints
  async getRecipes(): Promise<ApiResponse<Recipe[]>> {
    return this.request<Recipe[]>('/recipes');
  }

  async createRecipe(recipe: Omit<Recipe, 'id' | 'owner_id' | 'created_at'>): Promise<ApiResponse<Recipe>> {
    return this.request<Recipe>('/recipes', 'POST', recipe);
  }

  // Bot endpoint
  async sendBotMessage(message: string): Promise<ApiResponse<BotResponse>> {
    return this.request<BotResponse>('/bot/message', 'POST', { message });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; message: string }>> {
    try {
      const response = await fetch('http://localhost:8080/health');
      const result = await response.json();
      return {
        success: response.ok,
        data: result,
        error: response.ok ? undefined : 'Health check failed'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Ошибка сети. Проверьте подключение к серверу.'
      };
    }
  }

  // Выход
  logout() {
    this.userId = null;
    this.username = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
    }
  }
}

export const apiService = new ApiService();
