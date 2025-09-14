import axios from 'axios';
import { User, Category, Prompt, CreateUserData, CreatePromptData, LoginData, AuthToken, UserProfile } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const getToken = (): string | null => {
  return localStorage.getItem('access_token');
};

const setToken = (token: string): void => {
  localStorage.setItem('access_token', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

const removeToken = (): void => {
  localStorage.removeItem('access_token');
  delete api.defaults.headers.common['Authorization'];
};

// Set token if it exists on app start
const token = getToken();
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove it and redirect to login
      removeToken();
      window.location.href = '/login';
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Authentication API endpoints
export const authApi = {
  login: async (credentials: LoginData): Promise<AuthToken> => {
    // Use FormData for OAuth2PasswordRequestForm
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    const token = response.data;
    setToken(token.access_token);
    return token;
  },

  register: async (userData: CreateUserData): Promise<User> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout: (): void => {
    removeToken();
  },

  createAdmin: async (userData: CreateUserData): Promise<User> => {
    const response = await api.post('/auth/create-admin', userData);
    return response.data;
  },
};

// User API endpoints
export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users/');
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  getUser: async (userId: number): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },
};

// Category API endpoints
export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories/');
    return response.data;
  },

  getCategory: async (categoryId: number): Promise<Category> => {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data;
  },

  getSubCategories: async (categoryId: number) => {
    const response = await api.get(`/categories/${categoryId}/subcategories/`);
    return response.data;
  },
};

// Prompt API endpoints
export const promptApi = {
  createPrompt: async (promptData: CreatePromptData): Promise<Prompt> => {
    const response = await api.post('/prompts/', promptData);
    return response.data;
  },

  getAllPrompts: async (userId?: number): Promise<Prompt[]> => {
    const params = userId ? { user_id: userId } : {};
    const response = await api.get('/prompts/', { params });
    return response.data;
  },

  getMyPrompts: async (): Promise<Prompt[]> => {
    const response = await api.get('/prompts/my-prompts');
    return response.data;
  },

  getUserPrompts: async (userId: number): Promise<Prompt[]> => {
    const response = await api.get(`/prompts/users/${userId}`);
    return response.data;
  },

  getPrompt: async (promptId: number): Promise<Prompt> => {
    const response = await api.get(`/prompts/${promptId}`);
    return response.data;
  },
};

// Utility functions
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const isAdmin = async (): Promise<boolean> => {
  try {
    const profile = await authApi.getProfile();
    return profile.is_admin;
  } catch {
    return false;
  }
};

export { getToken, setToken, removeToken };
export default api;